import threading # Dùng để chạy nhiều luồng (thread) song song, ví dụ xử lý camera và gửi dữ liệu cùng lúc.
import time # Làm việc với thời gian, tạm dừng (sleep) hoặc đo thời gian xử lý.
import cv2 # OpenCV, dùng để xử lý ảnh/video (đọc camera, vẽ bounding box, resize, v.v.).
from datetime import datetime
import numpy as np
import pickle # Lưu/tải dữ liệu Python dạng nhị phân (model, embeddings).
import os
from dotenv import load_dotenv
load_dotenv() 
from insightface.app import FaceAnalysis # Từ thư viện InsightFace, dùng cho nhận diện và phân tích khuôn mặt.
from src.anti_spoof_predict import AntiSpoofPredict # Module nội bộ, dự đoán ảnh thật/giả (anti-spoofing).
from src.generate_patches import CropImage # Module nội bộ, cắt vùng ảnh khuôn mặt từ frame.
from src.utility import parse_model_name # from src.utility import parse_model_name –
import utils

# --- Load configs ---
API_URL = os.getenv("API_URL") # URL API để gửi dữ liệu.
MODEL_DIR = os.getenv("MODEL_DIR") # Thư mục chứa model chống giả mạo
MODEL_NAME = os.getenv("MODEL_NAME") # Tên file model chống giả mạo
DEVICE_ID = int(os.getenv("DEVICE_ID")) # ID thiết bị (số nguyên)
COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", 0.6)) # Ngưỡng so khớp cosine (float).
SEND_INTERVAL = int(os.getenv("SEND_INTERVAL", 1)) # Khoảng gửi dữ liệu (giây)
FAKE_UPLOAD_INTERVAL = int(os.getenv("FAKE_UPLOAD_INTERVAL", 10)) # Khoảng gửi ảnh giả mạo lên cloud
SPOOF_INTERVAL = 0.5  # giây, khoảng thời gian kiểm tra lại anti-spoof

# --- Khởi tạo model anti-spoof ---
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)
# 2.7_80x80_MiniFASNetV2.pth
# 80, 80 → kích thước ảnh đầu vào của model
# "MiniFASNetV2" → loại model
# 2.7 → hệ số scale ảnh

# --- Load embeddings ---
# # Mở file embeddings.pkl (dạng nhị phân) và load dữ liệu đã lưu
with open("embeddings/embeddings.pkl", "rb") as f:
    data = pickle.load(f)
# Lấy mảng embeddings, chuyển sang NumPy array kiểu float32 để tối ưu tốc độ và bộ nhớ
embeddings = np.array(data["embeddings"], dtype=np.float32)
# Lấy danh sách mã sinh viên tương ứng với từng embedding
student_ids = data["student_ids"]
# Chuẩn hóa vector embeddings về độ dài = 1 (unit vector) để so khớp bằng cosine similarity chính xác hơn
embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

# --- Khởi tạo FaceAnalysis (CPU) ---
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=-1, det_size=(320, 320))

# --- Start worker threads ---
# Tạo 2 luồng nền sử lý xong xong với chương trình
threading.Thread(target=utils.send_data_batch_worker, args=(API_URL, SEND_INTERVAL), daemon=True).start()
# API_URL: địa chỉ API để gửi dữ liệu.
# SEND_INTERVAL: khoảng thời gian (giây) giữa mỗi lần gửi dữ liệu.


threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()
# daemon=True: luồng này chạy nền, sẽ tự dừng khi chương trình chính kết thúc (không giữ chương trình chạy mãi).

# --- Biến lưu spoof result cho từng khuôn mặt ---
spoof_results = {}  # {bbox_tuple: (is_real, confidence, last_check_time)}
last_fake_upload_time = 0

# --- Mở webcam ---
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Không thể mở webcam.")
    exit()

print("Realtime detection (ấn 'q' để thoát)")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Lỗi khi đọc webcam.")
        break
    # Insightface phát hiện khuôn mặt resize ảnh đầu vào về det_size=(320,320)
    faces = app.get(frame)

    for face in faces:
        bbox = tuple(face.bbox.astype(int)) # lấy tọa độ hộp giới hạn khuôn mặt, ép thành số nguyên.
        now = time.time()

        # Kiểm tra anti-spoof định kỳ cho từng khuôn mặt
        # Nếu bbox chưa có trong spoof_results hoặc thời gian hiện tại 
        # now trừ đi thời gian đã lưu ở spoof_results[bbox][2]
        # ([2] nghĩa là lấy phần tử thứ 3 trong tuple value, tức là thời điểm kiểm tra gần nhất.) lớn hơn SPOOF_INTERVAL
        # spoof_results = {
        #     (100, 50, 200, 180): (True, 0.95, 1723628391.521)  
        # }
        if bbox not in spoof_results or now - spoof_results[bbox][2] > SPOOF_INTERVAL:
            is_real, confidence = utils.is_real_face(
                # Tham số:
                # frame: ảnh gốc.
                # np.array(bbox): tọa độ khuôn mặt dạng NumPy array.
                # image_cropper: đối tượng dùng để cắt khuôn mặt từ frame.
                # model_test: model chống giả mạo
                # MODEL_DIR, MODEL_NAME: thư mục lưu và tên model.
                # scale, w_input, h_input: thông số tiền xử lý ảnh trước khi đưa vào model.
                frame, np.array(bbox), image_cropper, model_test,
                MODEL_DIR, MODEL_NAME, scale, w_input, h_input
            )
            spoof_results[bbox] = (is_real, confidence, now) #lưu kết quả kiểm tra chống giả mạo cho từng khuôn mặt
        else:
            is_real, confidence, _ = spoof_results[bbox] #giải nén tuple được lưu trong spoof_results[bbox]

        if is_real:
            # Nhận diện khuôn mặt
            # Dùng embedding từ InsightFace (ảnh đã được mô hình nhận diện resize nội bộ trước khi tạo embedding).
            identity, similarity = utils.recognize_face(face.embedding, embeddings, student_ids, COSINE_THRESHOLD)
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)
            # Nếu danh tính khác 'Không xác định' và độ tương đồng lớn hơn hoặc bằng ngưỡng 
            if identity != "Unknown" and similarity >= COSINE_THRESHOLD:
                # Tạo dữ liệu cần gửi
                payload = {
                    "student_id": identity,
                    "confidence": round(similarity, 2),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                # Thêm dữ liệu vào hàng đợi
                with utils.send_lock:
                    utils.send_buffer.append(payload)
        else:
            # Khuôn mặt giả
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)
            if now - last_fake_upload_time > FAKE_UPLOAD_INTERVAL:
                # Đưa ảnh toàn khung chứa mặt giả vào hàng đợi để upload Cloudinary.
                utils.fake_face_queue.put(frame.copy())
                last_fake_upload_time = now

        # Vẽ bbox và label
        utils.draw_label(frame, np.array(bbox), label_text, color)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
utils.fake_face_queue.put(None)









# import threading
# import time
# import cv2
# from datetime import datetime
# import numpy as np
# import pickle
# import os
# from dotenv import load_dotenv
# load_dotenv() 
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# import requests

    
# import utils 

# # --- Load configs từ biến môi trường hoặc file config ---
# API_URL = os.getenv("API_URL")
# MODEL_DIR = os.getenv("MODEL_DIR")
# MODEL_NAME = os.getenv("MODEL_NAME")
# DEVICE_ID = int(os.getenv("DEVICE_ID"))
# COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", 0.6))
# SEND_INTERVAL = int(os.getenv("SEND_INTERVAL", 1))
# FAKE_UPLOAD_INTERVAL = int(os.getenv("FAKE_UPLOAD_INTERVAL", 10))

# # --- Khởi tạo ---
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# with open("embeddings/embeddings.pkl", "rb") as f:
#     data = pickle.load(f)
# embeddings = np.array(data["embeddings"], dtype=np.float32)
# student_ids = data["student_ids"]
# embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # --- Start worker threads ---
# threading.Thread(target=utils.send_data_batch_worker, args=(API_URL, SEND_INTERVAL), daemon=True).start()
# threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

# last_spoof_check = 0
# spoof_result = None
# last_fake_upload_time = 0

# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Không thể mở webcam.")
#     exit()

# print("Realtime detection (ấn 'q' để thoát)")

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Lỗi khi đọc webcam.")
#         break

#     faces = app.get(frame)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = utils.is_real_face(frame, bbox, image_cropper, model_test, MODEL_DIR, MODEL_NAME, scale, w_input, h_input)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         if is_real:
#             identity, similarity = utils.recognize_face(face.embedding, embeddings, student_ids, COSINE_THRESHOLD)
#             label_text = f"{identity} ({similarity:.2f})"
#             color = (0, 255, 0)

#             if identity != "Unknown":
#                 payload = {
#                     "student_id": identity,
#                     "confidence": float(round(similarity, 2)),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 # o day
#                 with utils.send_lock:
#                     utils.send_buffer.append(payload)

#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)
#             current_time = time.time()
#             if current_time - last_fake_upload_time > FAKE_UPLOAD_INTERVAL:
#                 utils.fake_face_queue.put(frame.copy())
#                 last_fake_upload_time = current_time

#         utils.draw_label(frame, bbox, label_text, color)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()
# utils.fake_face_queue.put(None)  # Dừng thread upload ảnh fake

