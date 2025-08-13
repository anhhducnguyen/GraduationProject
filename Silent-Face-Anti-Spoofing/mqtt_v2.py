# import cv2
# from datetime import datetime
# import json
# import time
# import threading
# from insightface.app import FaceAnalysis
# import cloudinary
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# import paho.mqtt.client as mqtt
# import pickle
# import numpy as np

# import config
# import utils

# # Cấu hình Cloudinary để upload ảnh (dùng thông tin trong file config)
# cloudinary.config(**config.CLOUDINARY_CONFIG)

# # Khởi tạo và kết nối MQTT client đến broker để gửi dữ liệu realtime
# mqtt_client = mqtt.Client()
# mqtt_client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)

# # Khởi tạo model phát hiện khuôn mặt giả (anti-spoofing)
# model_test = AntiSpoofPredict(config.DEVICE_ID)
# # Khởi tạo module cắt ảnh khuôn mặt để chuẩn bị cho anti-spoofing
# image_cropper = CropImage()
# # Phân tích tên model để lấy thông số đầu vào (chiều cao, rộng, scale...)
# h_input, w_input, model_type, scale = parse_model_name(config.MODEL_NAME)

# # Tải embeddings khuôn mặt đã lưu từ file pickle (dữ liệu vector và ID học sinh)
# with open(config.EMBEDDINGS_PATH, "rb") as f:
#     data = pickle.load(f)
# embeddings = np.array(data["embeddings"], dtype=np.float32)
# student_ids = data["student_ids"]

# # Khởi tạo app FaceAnalysis từ insightface để phát hiện và trích xuất khuôn mặt
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))  # chuẩn bị model với kích thước phát hiện 320x320

# # Khởi chạy các thread nền xử lý gửi dữ liệu batch và upload ảnh face giả
# threading.Thread(target=utils.send_data_batch_worker, args=(config.API_URL,), daemon=True).start()
# threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

# # Mở webcam (thiết bị camera mặc định)
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Không thể mở webcam.")
#     exit()

# print("Realtime detection (nhấn 'q' để thoát)")

# # Khởi tạo biến lưu trạng thái kiểm tra face giả và thời gian upload ảnh face giả
# last_spoof_check = 0
# spoof_result = None
# last_fake_upload_time = 0

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Lỗi khi đọc webcam.")
#         break

#     frame_start_time = time.perf_counter()  # Đo thời gian bắt đầu xử lý frame hiện tại
#     faces = app.get(frame)  # Phát hiện tất cả khuôn mặt trong frame

#     if not faces or len(faces) == 0:
#         print("Không phát hiện khuôn mặt nào")

#     for face in faces:
#         bbox = face.bbox.astype(int)  # Lấy tọa độ bounding box khuôn mặt, chuyển sang int

#         # Chỉ kiểm tra face giả sau mỗi 2 giây để giảm tải
#         if time.time() - last_spoof_check > 2:
#             # Gọi hàm kiểm tra face giả, trả về is_real (True/False), confidence (độ tin cậy)
#             is_real, confidence = utils.is_real_face(frame, bbox, image_cropper, model_test,
#                                                      config.MODEL_DIR, config.MODEL_NAME,
#                                                      scale, w_input, h_input)
#             spoof_result = (is_real, confidence)  # Lưu kết quả
#             last_spoof_check = time.time()        # Cập nhật thời điểm kiểm tra

#         # Nếu chưa có kết quả spoof thì mặc định là giả
#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         if is_real:
#             # Nếu khuôn mặt được xác định là thật, tiến hành nhận diện danh tính
#             identity, similarity = utils.recognize_face(face.embedding, embeddings, student_ids, config.COSINE_THRESHOLD)
#             label_text = f"{identity} ({similarity:.2f})"
#             color = (0, 255, 0)  # Màu xanh lá để đánh dấu face thật

#             # Nếu nhận diện được học sinh với độ tương đồng cao hơn ngưỡng
#             if identity != "Unknown" and similarity >= config.COSINE_THRESHOLD:
#                 payload = {
#                     "student_id": identity,
#                     "confidence": round(similarity, 2),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 # Gửi dữ liệu nhận diện qua MQTT
#                 mqtt_client.publish(config.MQTT_TOPIC, json.dumps(payload))
#                 print(f"Send: {payload}")
#         else:
#             # Nếu phát hiện face giả, hiển thị nhãn và dùng màu đỏ
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#             current_time = time.time()
#             # Nếu đủ thời gian từ lần upload trước, đưa ảnh face giả vào queue upload
#             if current_time - last_fake_upload_time > config.FAKE_UPLOAD_INTERVAL:
#                 utils.fake_face_queue.put(frame.copy())
#                 last_fake_upload_time = current_time

#         # Vẽ nhãn tên (hoặc fake face) lên frame cùng bounding box
#         utils.draw_label(frame, bbox, label_text, color)

#     # Tính và hiển thị FPS (khung hình trên giây) của xử lý realtime
#     elapsed = time.perf_counter() - frame_start_time
#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     # Hiển thị frame ra cửa sổ
#     cv2.imshow("Anti-Spoof + Face Recognition", frame)

#     # Nhấn 'q' để thoát vòng lặp và kết thúc chương trình
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # Giải phóng webcam và đóng cửa sổ hiển thị
# cap.release()
# cv2.destroyAllWindows()

# # Gửi tín hiệu dừng cho thread upload ảnh face giả
# utils.fake_face_queue.put(None)

import cv2
from datetime import datetime
import json
import time
import threading
from insightface.app import FaceAnalysis
import cloudinary
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name
import paho.mqtt.client as mqtt
import pickle
import numpy as np

import config
import utils

# Cấu hình Cloudinary để upload ảnh
cloudinary.config(**config.CLOUDINARY_CONFIG)

# MQTT client
mqtt_client = mqtt.Client()
mqtt_client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)

# Model anti-spoof
model_test = AntiSpoofPredict(config.DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(config.MODEL_NAME)

# Load embeddings
with open(config.EMBEDDINGS_PATH, "rb") as f:
    data = pickle.load(f)
embeddings = np.array(data["embeddings"], dtype=np.float32)
student_ids = data["student_ids"]

# FaceAnalysis
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# Thread nền
threading.Thread(target=utils.send_data_batch_worker, args=(config.API_URL,), daemon=True).start()
threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

# Webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Không thể mở webcam.")
    exit()

print("Realtime detection (nhấn 'q' để thoát)")

# Lưu kết quả spoof cho từng khuôn mặt
spoof_results = {}  # key: bbox tuple, value: (is_real, confidence, last_check_time)
last_fake_upload_time = 0
SPOOF_INTERVAL = 0.5  # giây, kiểm tra lại anti-spoofing sau mỗi khoảng thời gian này

while True:
    ret, frame = cap.read()
    if not ret:
        print("Lỗi khi đọc webcam.")
        break

    frame_start_time = time.perf_counter()
    faces = app.get(frame)

    if not faces:
        print("Không phát hiện khuôn mặt nào")

    for face in faces:
        bbox = tuple(face.bbox.astype(int))

        now = time.time()
        if bbox not in spoof_results or now - spoof_results[bbox][2] > SPOOF_INTERVAL:
            # Kiểm tra anti-spoofing cho khuôn mặt này
            is_real, confidence = utils.is_real_face(
                frame, np.array(bbox), image_cropper, model_test,
                config.MODEL_DIR, config.MODEL_NAME,
                scale, w_input, h_input
            )
            spoof_results[bbox] = (is_real, confidence, now)
        else:
            is_real, confidence, _ = spoof_results[bbox]

        if is_real:
            # Nhận diện khuôn mặt thật
            identity, similarity = utils.recognize_face(
                face.embedding, embeddings, student_ids, config.COSINE_THRESHOLD
            )
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown" and similarity >= config.COSINE_THRESHOLD:
                payload = {
                    "student_id": identity,
                    "confidence": round(similarity, 2),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                mqtt_client.publish(config.MQTT_TOPIC, json.dumps(payload))
                print(f"Send: {payload}")
        else:
            # Face giả
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)

            if now - last_fake_upload_time > config.FAKE_UPLOAD_INTERVAL:
                utils.fake_face_queue.put(frame.copy())
                last_fake_upload_time = now

        # Vẽ bounding box + label
        utils.draw_label(frame, np.array(bbox), label_text, color)

    # Hiển thị FPS
    elapsed = time.perf_counter() - frame_start_time
    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
utils.fake_face_queue.put(None)
