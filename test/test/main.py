
# # import time
# # import cv2
# # import numpy as np
# # import pickle
# # import os
# # import warnings
# # import requests
# # import threading
# # import cloudinary
# # import cloudinary.uploader
# # import queue
# # from datetime import datetime
# # from insightface.app import FaceAnalysis
# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name
# # import paho.mqtt.client as mqtt
# # import json

# # warnings.filterwarnings('ignore')

# # # ====== Cloudinary config ======
# # cloudinary.config(
# #     cloud_name="dvc80qdie",
# #     api_key="221435714784277",
# #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# #     secure=True
# # )

# # MQTT_BROKER = "broker.hivemq.com"
# # MQTT_PORT = 1883
# # MQTT_TOPIC = "exam/attendance"

# # mqtt_client = mqtt.Client()
# # mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# # # ====== Config ======
# # MODEL_DIR = "./resources/anti_spoof_models"
# # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # DEVICE_ID = 0
# # EMBEDDINGS_PATH = "faiss_index/embeddings.pkl"
# # DISTANCE_THRESHOLD = 0.7
# # API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # # ====== Load embeddings ======
# # with open(EMBEDDINGS_PATH, "rb") as f:
# #     data = pickle.load(f)
# # embeddings = np.array(data["embeddings"], dtype=np.float32)
# # student_ids = data["student_ids"]
# # print(f"Loaded embeddings for {len(student_ids)} students.")

# # # ====== Init models ======
# # model_test = AntiSpoofPredict(DEVICE_ID)
# # image_cropper = CropImage()
# # h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # app.prepare(ctx_id=0, det_size=(320, 320))

# # # ====== Send batch thread ======
# # send_buffer = []
# # send_lock = threading.Lock()
# # send_interval = 3

# # def send_data_batch():
# #     while True:
# #         time.sleep(send_interval)
# #         with send_lock:
# #             buffer_copy = send_buffer.copy()
# #             send_buffer.clear()

# #         for record in buffer_copy:
# #             try:
# #                 response = requests.post(API_URL, json=record)
# #                 if response.status_code in [200, 201]:
# #                     print(f"Gửi thành công: {record['student_id']} lúc {record['timestamp']}")
# #                 else:
# #                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
# #             except Exception as e:
# #                 print(f"Gửi lỗi: {e}")

# # threading.Thread(target=send_data_batch, daemon=True).start()

# # # ====== Upload fake face ======
# # def upload_fake_face_to_cloudinary(frame, bbox):
# #     _, img_encoded = cv2.imencode('.jpg', frame)
# #     response = cloudinary.uploader.upload(
# #         img_encoded.tobytes(),
# #         folder="fake_faces_fullframe",
# #         public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
# #         resource_type="image"
# #     )
# #     print(f"Full frame fake face uploaded: {response.get('secure_url')}")
# #     return response.get("secure_url")

# # # ====== Fake face queue ======
# # fake_face_queue = queue.Queue()

# # def fake_face_uploader():
# #     while True:
# #         frame, bbox = fake_face_queue.get()
# #         if frame is None:
# #             break
# #         try:
# #             upload_fake_face_to_cloudinary(frame, bbox)
# #         except Exception as e:
# #             print("Error when uploading fake photo:", e)

# # threading.Thread(target=fake_face_uploader, daemon=True).start()

# # # ====== Anti-spoofing ======
# # def is_real_face(frame, bbox):
# #     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# #     param = {
# #         "org_img": frame,
# #         "bbox": image_bbox,
# #         "scale": scale,
# #         "out_w": w_input,
# #         "out_h": h_input,
# #         "crop": True if scale is not None else False,
# #     }
# #     spoof_input = image_cropper.crop(**param)
# #     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# #     label = np.argmax(prediction)
# #     confidence = prediction[0][label] / 2
# #     return label == 1, confidence

# # # ====== Face recognition without FAISS ======
# # def recognize_face(face_embedding):
# #     emb = face_embedding.astype(np.float32)
# #     emb /= np.linalg.norm(emb)

# #     # Tính khoảng cách Euclidean đến tất cả embeddings
# #     dists = np.linalg.norm(embeddings - emb, axis=1)
# #     min_idx = np.argmin(dists)
# #     min_dist = dists[min_idx]

# #     if min_dist < DISTANCE_THRESHOLD:
# #         return student_ids[min_idx], float(min_dist)
# #     return "Unknown", float(min_dist)

# # # ====== Draw label ======
# # def draw_label(frame, bbox, label_text, color):
# #     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# #     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
# #                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # # ====== Camera ======
# # cap = cv2.VideoCapture(0)
# # if not cap.isOpened():
# #     print("Cannot open webcam.")
# #     exit()

# # print("Realtime detection (press 'q' to exit)")

# # last_spoof_check = 0
# # spoof_result = None
# # last_fake_upload_time = 0
# # fake_upload_interval = 10

# # while True:
# #     ret, frame = cap.read()
# #     if not ret:
# #         print("Error reading webcam.")
# #         break

# #     faces = app.get(frame)

# #     for face in faces:
# #         bbox = face.bbox.astype(int)

# #         if time.time() - last_spoof_check > 2:
# #             is_real, confidence = is_real_face(frame, bbox)
# #             spoof_result = (is_real, confidence)
# #             last_spoof_check = time.time()

# #         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

# #         if is_real:
# #             identity, dist = recognize_face(face.embedding)
# #             label_text = f"{identity} ({dist:.2f})"
# #             color = (0, 255, 0)

# #             if identity != "Unknown":
# #                 payload = {
# #                     "student_id": identity,
# #                     "confidence": float(round(dist, 2)),
# #                     "real_face": 1.0,
# #                     "timestamp": datetime.now().isoformat()
# #                 }
# #                 mqtt_client.publish(MQTT_TOPIC, json.dumps(payload))
# #                 print(f"Send: {payload}")
# #         else:
# #             label_text = f"Fake Face ({confidence:.2f})"
# #             color = (0, 0, 255)
# #             current_time = time.time()
# #             if current_time - last_fake_upload_time > fake_upload_interval:
# #                 fake_face_queue.put((frame.copy(), bbox))
# #                 last_fake_upload_time = current_time

# #         draw_label(frame, bbox, label_text, color)

# #     cv2.imshow("Anti-Spoof + Face Recognition", frame)
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # # ====== Cleanup ======
# # cap.release()
# # cv2.destroyAllWindows()
# # fake_face_queue.put((None, None))

# import time
# import cv2
# import numpy as np
# # import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# import cloudinary
# import cloudinary.uploader
# import queue
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# # ====== Cấu hình Cloudinary ======
# cloudinary.config(
#     cloud_name="dvc80qdie",
#     api_key="221435714784277",
#     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
#     secure=True
# )

# # ====== Cấu hình ======
# MODEL_DIR = "./resources/anti_spoof_models"
# MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# DEVICE_ID = 0
# # FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# # FAISS_THRESHOLD = 1.2
# API_URL = "https://graduationproject-nx7m.onrender.com/api/v1/exam-attendance/"


# # ====== Khởi tạo models ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# with open("embeddings/embeddings.pkl", "rb") as f:
#     data = pickle.load(f)
# embeddings = np.array(data["embeddings"], dtype=np.float32)
# student_ids = data["student_ids"]

# # Chuẩn hóa trước để tăng tốc
# embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

# THRESHOLD = 1.2  # Ngưỡng khoảng cách nhận diện


# # print("Đang tải FAISS index và student_ids...")
# # index = faiss.read_index(FAISS_PATH)
# # with open(IDS_PATH, "rb") as f:
# #     student_ids = pickle.load(f)
# # print(f"Đã load FAISS index ({index.ntotal} vectors)")

# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Tạo worker thread chạy nền để gửi dữ liệu điểm danh(record) lên API theo lô(batch) ======
# send_buffer = [] # Danh sách chung chứa các payload(record) cần gửi lên trên server. Các thread/luồng khác (luồng chính) sẽ append data vào đây
# send_lock = threading.Lock()
# send_interval = 3 # Khoảng thời gian (giây) giữa hai lần worker kiểm tra và gửi batch — ở đây là 3 giây.

# def send_data_batch():
#     while True:
#         time.sleep(send_interval) # worker ngủ send_interval giây trước mỗi lần gửi
#         with send_lock:
#             buffer_copy = send_buffer.copy() # bảo vệ thao tác copy/clear khỏi tranh chấp.
#             send_buffer.clear() # xóa danh sách gốc để các producer (luồng khác) có thể tiếp tục append mà không chờ worker gửi xong.
     
#         for record in buffer_copy: # Duyệt từng record trong buffer_copy
#             try:
#                 response = requests.post(API_URL, json=record) # Gửi POST tới API_URL với body JSON = record
#                 if response.status_code in [200, 201]: # Nếu HTTP code là 200 hoặc 201 → in log thành công; ngược lại in lỗi.
#                     print(f"Gửi thành công: {record['name']} lúc {record['timestamp']}")
#                 else:
#                     print(f"Lỗi gửi: {response.status_code} - {response.text}")
#             except Exception as e:
#                 print(f"Gửi lỗi: {e}")

# threading.Thread(target=send_data_batch, daemon=True).start()
# # Tạo một luồng (thread) chạy nền để gửi dữ liệu nhận diện lên server định kỳ
# # daemon=True → Luồng này là daemon thread, nghĩa là:
# # Nó chạy song song với luồng chính.
# # Khi chương trình chính kết thúc, thread này cũng tự tắt theo (không giữ chương trình chạy mãi).
# # Đây là “ông shipper” chạy nền, cứ 3 giây gom dữ liệu trong send_buffer và gửi đi.

# def upload_fake_face_to_cloudinary(frame, bbox):
#     # Gửi toàn bộ khung hình (frame), không crop
#     _, img_encoded = cv2.imencode('.jpg', frame) # mã hóa ảnh

#     response = cloudinary.uploader.upload(
#         img_encoded.tobytes(),
#         folder="fake_faces_fullframe", # Tên thư mục
#         public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}", # Đặt tên file
#         resource_type="image" # Xác định kiểu dữ liệu
#     )
#     print(f"Ảnh toàn khung chứa fake face đã upload: {response.get('secure_url')}")
#     return response.get("secure_url")

# # ====== Fake face queue + thread ======
# fake_face_queue = queue.Queue() # hàng đợi chứa các ảnh bị phát hiện giả mạo

# def fake_face_uploader():
#     while True:
#         frame, bbox = fake_face_queue.get() # ảnh khung hình và boudingbox của khuôn mặt giả
#         # .get() sẽ chặn (block) thread tại đây cho đến khi có phần tử mới được thêm bằng 
#         # .put() từ thread khác (thường là thread chính).
#         if frame is None:
#             break
#         try:
#             upload_fake_face_to_cloudinary(frame, bbox) 
#         except Exception as e:
#             print("Lỗi khi upload ảnh fake:", e)

# threading.Thread(target=fake_face_uploader, daemon=True).start()
# # fake_face_uploader() là một thread nền (background thread) 
# # chuyên trách việc lấy ảnh khuôn mặt giả (fake face) từ hàng đợi (queue) fake_face_queue và upload chúng lên Cloudinary.

# # ====== Anti-spoofing ======
# def is_real_face(frame, bbox):
#     # Chuyển bbox sang dạng [x, y, w, h]
#     # bbox ban đầu là dạng tọa độ góc: [x1, y1, x2, y2]
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame, # ảnh gốc (toàn bộ khung hình).
#         "bbox": image_bbox, # vùng khuôn mặt cần kiểm tra.
#         "scale": scale, # tỉ lệ phóng to/thu nhỏ khi crop (nếu có).
#         "out_w": w_input, # kích thước ảnh đầu ra sau khi crop.
#         "out_h": h_input,
#         "crop": True if scale is not None else False, # cho biết có cần cắt vùng mặt hay không.
#     }
#     spoof_input = image_cropper.crop(**param) # Dùng hàm image_cropper.crop() để lấy ra ảnh khuôn mặt theo bbox và scale đã chỉ định.
#     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME)) # Kết quả spoof_input sẽ là ảnh chỉ chứa mặt đã chuẩn hóa kích thước.
#     label = np.argmax(prediction) # Lấy chỉ số của xác suất cao nhất trong mảng dự đoán.
#     confidence = prediction[0][label] / 2 # Lấy xác suất của nhãn dự đoán (prediction[0][label]) chia 2.
#     return label == 1, confidence

# # ====== Face recognition ======
# # def recognize_face(face_embedding):
# #     embedding = face_embedding.astype(np.float32).reshape(1, -1)
# #     embedding /= np.linalg.norm(embedding)
# #     D, I = index.search(embedding, 1)
# #     distance = float(D[0][0])
# #     idx = int(I[0][0])
# #     if distance < FAISS_THRESHOLD:
# #         return student_ids[idx], distance
# #     return "Unknown", distance

# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32)
#     embedding /= np.linalg.norm(embedding)

#     # Tính khoảng cách Euclidean
#     dists = np.linalg.norm(embeddings - embedding, axis=1)
#     idx = np.argmin(dists)
#     distance = dists[idx]

#     if distance < THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance


# # ====== Draw label ======
# def draw_label(frame, bbox, label_text, color):
#     #  Vẽ hình chữ nhật quanh khuôn mặt.
#     # (bbox[0], bbox[1]) → góc trên trái.
#     # (bbox[2], bbox[3]) → góc dưới phải.
#     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#     # Vẽ chữ trên boudingbox
#     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # ====== Mở camera ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Không mở được webcam.")
#     exit()

# print("Nhận diện realtime (ấn 'q' để thoát)")

# last_spoof_check = 0 # lưu thời điểm cuối chạy kiểm tra thật giả
# spoof_result = None # lưu kết quả kiểm trả gần nhất

# last_fake_upload_time = 0 # thời điểm cuối gửi ảnh fake lên server 
# fake_upload_interval = 10  # giây, khoảng cách giữa các lần gửi fake face

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Lỗi khi đọc webcam.")
#         break
#     # Trả về danh sách các khuôn mặt mỗi face chứa boudingbox và embedding
#     faces = app.get(frame)

#     for face in faces: # Duyệt qua từng khuôn mặt để sử lý
#         bbox = face.bbox.astype(int) # Lấy boudingbox của từng khuôn mặt chuyển sang int

#         # Thực hiện kiểm tra giả mạo mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox) # True or False, ngưỡng tự tin
#             spoof_result = (is_real, confidence) # lưu kết quả dưới dạng tulip
#             last_spoof_check = time.time() # cập nhật lại thời gian kiểm tra gần nhất

#         # spoof_result chưa có → gán mặc định là "giả" với độ tin cậy 0.0
#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         if is_real: # Nếu như là mặt thật thì
#             identity, dist = recognize_face(face.embedding) # Xác định xem đây là ai trả về student_id và khoảng cách giữa emb hiện tại và emb trong cơ sở dữ liệu
#             label_text = f"{identity} ({dist:.2f})" # tạo chuỗi hiển thị nhãn
#             color = (0, 255, 0) 

#             if identity != "Unknown": # Nếu nhận diện được đó là ai
#                 # Tạo gói dữ liệu
#                 payload = {
#                     "name": identity,
#                     # "confidence": round(dist, 2),
#                     "confidence": float(round(dist, 2)),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 # send_lock là threading lock để đảm bảo khi nhiều luồng (threads) cùng thao tác với send_buffer thì sẽ không bị lỗi xung đột dữ liệu
#                 with send_lock:
#                     send_buffer.append(payload) # thêm phần tử mới payload vào cuối danh sách send_buffer
#         # Khuôn mặt là giả 
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#             current_time = time.time()
#             # Cứ 10s mới đẩy ảnh fakeface lên cloudinary
#             if current_time - last_fake_upload_time > fake_upload_interval:
#                 fake_face_queue.put((frame.copy(), bbox)) # đưa ảnh vào hàng đợi để xử lý sau .copy để tránh ảnh bị thay đổi trong quá trình sử lý
#                 last_fake_upload_time = current_time # ập nhật last_fake_upload_time = current_time để đánh dấu thời điểm vừa xử lý fake face.

#         draw_label(frame, bbox, label_text, color)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ====== Cleanup ======
# cap.release()
# cv2.destroyAllWindows()
# fake_face_queue.put((None, None))  # kết thúc thread upload nếu cần
























# # # # ====== Camera ======
# # # cap = cv2.VideoCapture(0)
# # # if not cap.isOpened():
# # #     print("Không mở được webcam.")
# # #     exit()

# # # print("Nhận diện realtime (ấn 'q' để thoát)")

# # # frame_count = 0
# # # face_count = 0
# # # total_elapsed_time = 0.0
# # # total_face_time = 0.0
# # # last_spoof_check = 0
# # # spoof_result = None

# # # last_fake_upload_time = 0
# # # fake_upload_interval = 10  # giây, khoảng cách giữa các lần gửi fake face

# # # while True:
# # #     ret, frame = cap.read()
# # #     if not ret:
# # #         print("⚠️ Lỗi khi đọc webcam.")
# # #         break

# # #     frame_start_time = time.perf_counter()
# # #     faces = app.get(frame)
# # #     face_count += len(faces)

# # #     for face in faces:
# # #         bbox = face.bbox.astype(int)

# # #         if time.time() - last_spoof_check > 2:
# # #             is_real, confidence = is_real_face(frame, bbox)
# # #             spoof_result = (is_real, confidence)
# # #             last_spoof_check = time.time()

# # #         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

# # #         face_start_time = time.perf_counter()

# # #         if is_real:
# # #             identity, dist = recognize_face(face.embedding)
# # #             label_text = f"{identity} ({dist:.2f})"
# # #             color = (0, 255, 0)

# # #             if identity != "Unknown":
# # #                 payload = {
# # #                     "name": identity,
# # #                     "confidence": round(dist, 2),
# # #                     "real_face": 1.0,
# # #                     "timestamp": datetime.now().isoformat()
# # #                 }
# # #                 with send_lock:
# # #                     send_buffer.append(payload)
# # #         else:
# # #             label_text = f"Fake Face ({confidence:.2f})"
# # #             color = (0, 0, 255)

# # #             current_time = time.time()
# # #             if current_time - last_fake_upload_time > fake_upload_interval:
# # #                 fake_face_queue.put((frame.copy(), bbox))
# # #                 last_fake_upload_time = current_time

# # #         draw_label(frame, bbox, label_text, color)

# # #         face_time = time.perf_counter() - face_start_time
# # #         total_face_time += face_time

# # #     frame_count += 1
# # #     elapsed = time.perf_counter() - frame_start_time
# # #     total_elapsed_time += elapsed

# # #     fps = f"FPS: {1 / elapsed:.2f}"
# # #     cv2.putText(frame, fps, (10, 30),
# # #                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

# # #     cv2.imshow("Anti-Spoof + Face Recognition", frame)
# # #     if cv2.waitKey(1) & 0xFF == ord('q'):
# # #         break

# # # # ====== Cleanup ======
# # # cap.release()
# # # cv2.destroyAllWindows()
# # # fake_face_queue.put((None, None))  # kết thúc thread upload nếu cần

# # # # ====== Stats ======
# # # # print("\n===== THỐNG KÊ HIỆU SUẤT =====")
# # # # print(f"Tổng số khung hình:        {frame_count}")
# # # # print(f"Tổng số khuôn mặt:         {face_count}")
# # # # print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
# # # # print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
# # # # if face_count > 0:
# # # #     print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây")



import threading
import time
import cv2
from datetime import datetime
import numpy as np
import pickle
import os
from dotenv import load_dotenv
load_dotenv() 
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

import utils  # file bạn vừa chỉnh sửa

# --- Load configs từ biến môi trường hoặc file config ---
API_URL = os.getenv("API_URL")
MODEL_DIR = os.getenv("MODEL_DIR")
MODEL_NAME = os.getenv("MODEL_NAME")
DEVICE_ID = int(os.getenv("DEVICE_ID"))
COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", 0.6))
SEND_INTERVAL = int(os.getenv("SEND_INTERVAL", 3))
FAKE_UPLOAD_INTERVAL = int(os.getenv("FAKE_UPLOAD_INTERVAL", 10))

# --- Khởi tạo ---
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

with open("embeddings/embeddings.pkl", "rb") as f:
    data = pickle.load(f)
embeddings = np.array(data["embeddings"], dtype=np.float32)
student_ids = data["student_ids"]
embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# --- Start worker threads ---
threading.Thread(target=utils.send_data_batch_worker, args=(API_URL, SEND_INTERVAL), daemon=True).start()
threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

last_spoof_check = 0
spoof_result = None
last_fake_upload_time = 0

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

    faces = app.get(frame)

    for face in faces:
        bbox = face.bbox.astype(int)

        if time.time() - last_spoof_check > 2:
            is_real, confidence = utils.is_real_face(frame, bbox, image_cropper, model_test, MODEL_DIR, MODEL_NAME, scale, w_input, h_input)
            spoof_result = (is_real, confidence)
            last_spoof_check = time.time()

        is_real, confidence = spoof_result if spoof_result else (False, 0.0)

        if is_real:
            identity, similarity = utils.recognize_face(face.embedding, embeddings, student_ids, COSINE_THRESHOLD)
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown":
                payload = {
                    "name": identity,
                    "confidence": float(round(similarity, 2)),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                with utils.send_lock:
                    utils.send_buffer.append(payload)

        else:
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)
            current_time = time.time()
            if current_time - last_fake_upload_time > FAKE_UPLOAD_INTERVAL:
                utils.fake_face_queue.put(frame.copy())
                last_fake_upload_time = current_time

        utils.draw_label(frame, bbox, label_text, color)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
utils.fake_face_queue.put(None)  # Dừng thread upload ảnh fake
