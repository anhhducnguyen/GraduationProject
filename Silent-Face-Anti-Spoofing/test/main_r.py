# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# # ====== Cấu hình ======
# MODEL_DIR = "./resources/anti_spoof_models"
# MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# DEVICE_ID = 0
# FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# FAISS_THRESHOLD = 1.2
# API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # ====== Khởi tạo mô hình chống giả mạo ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # ====== Load FAISS index ======
# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(FAISS_PATH)
# with open(IDS_PATH, "rb") as f:
#     student_ids = pickle.load(f)
# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ====== Khởi tạo InsightFace ======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Gửi dữ liệu theo lô ======
# send_buffer = []
# send_lock = threading.Lock()
# send_interval = 3  # giây

# def send_data_batch():
#     while True:
#         time.sleep(send_interval)
#         with send_lock:
#             buffer_copy = send_buffer.copy()
#             send_buffer.clear()

#         for record in buffer_copy:
#             try:
#                 response = requests.post(API_URL, json=record)
#                 if response.status_code in [200, 201]:
#                     print(f"✅ Gửi thành công: {record['name']} lúc {record['timestamp']}")
#                 else:
#                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
#             except Exception as e:
#                 print(f"⚠️ Gửi lỗi: {e}")

# # Khởi động luồng gửi
# threading.Thread(target=send_data_batch, daemon=True).start()

# # ====== Hàm chống giả mạo ======
# def is_real_face(frame, bbox):
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True if scale is not None else False,
#     }
#     spoof_input = image_cropper.crop(**param)
#     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
#     label = np.argmax(prediction)
#     confidence = prediction[0][label] / 2
#     return label == 1, confidence

# # ====== Nhận diện khuôn mặt ======
# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32).reshape(1, -1)
#     embedding /= np.linalg.norm(embedding)
#     D, I = index.search(embedding, 1)
#     distance = float(D[0][0])
#     idx = int(I[0][0])
#     if distance < FAISS_THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance

# # ====== Vẽ nhãn lên khung hình ======
# def draw_label(frame, bbox, label_text, color):
#     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # ====== Mở webcam ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Không mở được webcam.")
#     exit()

# print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# # ====== Biến thống kê ======
# frame_count = 0
# face_count = 0
# total_elapsed_time = 0.0
# total_face_time = 0.0
# last_spoof_check = 0
# spoof_result = None

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     frame_start_time = time.perf_counter()
#     faces = app.get(frame)
#     face_count += len(faces)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         # Anti-spoofing mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         face_start_time = time.perf_counter()

#         if is_real:
#             identity, dist = recognize_face(face.embedding)
#             label_text = f"{identity} ({dist:.2f})"
#             color = (0, 255, 0)

#             if identity != "Unknown":
#                 payload = {
#                     "name": identity,
#                     "confidence": round(dist, 2),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 with send_lock:
#                     send_buffer.append(payload)
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#         draw_label(frame, bbox, label_text, color)

#         face_time = time.perf_counter() - face_start_time
#         total_face_time += face_time

#     # Đếm khung hình
#     frame_count += 1
#     elapsed = time.perf_counter() - frame_start_time
#     total_elapsed_time += elapsed

#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ====== Giải phóng ======
# cap.release()
# cv2.destroyAllWindows()

# # ====== Thống kê kết quả ======
# print("\n===== THỐNG KÊ HIỆU SUẤT =====")
# print(f"Tổng số khung hình:        {frame_count}")
# print(f"Tổng số khuôn mặt:         {face_count}")
# print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
# print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
# print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây (nếu có face)")

# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# import cloudinary
# import cloudinary.uploader

# warnings.filterwarnings('ignore')

# # ====== Cloudinary Config ======
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
# FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# FAISS_THRESHOLD = 1.2
# API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # ====== Khởi tạo mô hình chống giả mạo ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # ====== Load FAISS index ======
# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(FAISS_PATH)
# with open(IDS_PATH, "rb") as f:
#     student_ids = pickle.load(f)
# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ====== Khởi tạo InsightFace ======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Gửi dữ liệu theo lô ======
# send_buffer = []
# send_lock = threading.Lock()
# send_interval = 3  # giây

# def send_data_batch():
#     while True:
#         time.sleep(send_interval)
#         with send_lock:
#             buffer_copy = send_buffer.copy()
#             send_buffer.clear()

#         for record in buffer_copy:
#             try:
#                 response = requests.post(API_URL, json=record)
#                 if response.status_code in [200, 201]:
#                     print(f"✅ Gửi thành công: {record['name']} lúc {record['timestamp']}")
#                 else:
#                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
#             except Exception as e:
#                 print(f"⚠️ Gửi lỗi: {e}")

# # Khởi động luồng gửi
# threading.Thread(target=send_data_batch, daemon=True).start()

# # ====== Hàm upload ảnh giả mạo lên Cloudinary ======
# def upload_fake_face(frame, identity="unknown"):
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     filename = f"fake_face_{identity}_{timestamp}.jpg"
#     filepath = f"/tmp/{filename}"
#     cv2.imwrite(filepath, frame)

#     try:
#         response = cloudinary.uploader.upload(filepath, folder="fake_faces/")
#         print(f"☁️ Ảnh giả mạo đã upload: {response['secure_url']}")
#     except Exception as e:
#         print(f"❌ Lỗi khi upload ảnh lên Cloudinary: {e}")

# # ====== Hàm chống giả mạo ======
# def is_real_face(frame, bbox):
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True if scale is not None else False,
#     }
#     spoof_input = image_cropper.crop(**param)
#     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
#     label = np.argmax(prediction)
#     confidence = prediction[0][label] / 2
#     return label == 1, confidence

# # ====== Nhận diện khuôn mặt ======
# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32).reshape(1, -1)
#     embedding /= np.linalg.norm(embedding)
#     D, I = index.search(embedding, 1)
#     distance = float(D[0][0])
#     idx = int(I[0][0])
#     if distance < FAISS_THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance

# # ====== Vẽ nhãn lên khung hình ======
# def draw_label(frame, bbox, label_text, color):
#     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # ====== Mở webcam ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Không mở được webcam.")
#     exit()

# print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# # ====== Biến thống kê ======
# frame_count = 0
# face_count = 0
# total_elapsed_time = 0.0
# total_face_time = 0.0
# last_spoof_check = 0
# spoof_result = None

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     frame_start_time = time.perf_counter()
#     faces = app.get(frame)
#     face_count += len(faces)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         # Anti-spoofing mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         face_start_time = time.perf_counter()

#         if is_real:
#             identity, dist = recognize_face(face.embedding)
#             label_text = f"{identity} ({dist:.2f})"
#             color = (0, 255, 0)

#             if identity != "Unknown":
#                 payload = {
#                     "name": identity,
#                     "confidence": round(dist, 2),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 with send_lock:
#                     send_buffer.append(payload)
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)
#             upload_fake_face(frame)

#         draw_label(frame, bbox, label_text, color)

#         face_time = time.perf_counter() - face_start_time
#         total_face_time += face_time

#     # Đếm khung hình
#     frame_count += 1
#     elapsed = time.perf_counter() - frame_start_time
#     total_elapsed_time += elapsed

#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ====== Giải phóng ======
# cap.release()
# cv2.destroyAllWindows()

# # ====== Thống kê kết quả ======
# print("\n===== THỐNG KÊ HIỆU SUẤT =====")
# print(f"Tổng số khung hình:        {frame_count}")
# print(f"Tổng số khuôn mặt:         {face_count}")
# print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
# print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
# print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây (nếu có face)")

# # # # import time
# # # # import cv2
# # # # import numpy as np
# # # # import faiss
# # # # import pickle
# # # # import os
# # # # import warnings
# # # # import requests
# # # # import threading
# # # # import io
# # # # from datetime import datetime
# # # # from insightface.app import FaceAnalysis
# # # # from src.anti_spoof_predict import AntiSpoofPredict
# # # # from src.generate_patches import CropImage
# # # # from src.utility import parse_model_name
# # # # import cloudinary
# # # # import cloudinary.uploader

# # # # warnings.filterwarnings('ignore')

# # # # # ====== Cloudinary Config ======
# # # # cloudinary.config(
# # # #     cloud_name="dvc80qdie",
# # # #     api_key="221435714784277",
# # # #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# # # #     secure=True
# # # # )

# # # # # ====== Cấu hình ======
# # # # MODEL_DIR = "./resources/anti_spoof_models"
# # # # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # # # DEVICE_ID = 0
# # # # FAISS_PATH = "faiss_index/face_index.faiss"
# # # # IDS_PATH = "faiss_index/student_ids.pkl"
# # # # FAISS_THRESHOLD = 1.2
# # # # API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # # # # ====== Khởi tạo mô hình chống giả mạo ======
# # # # model_test = AntiSpoofPredict(DEVICE_ID)
# # # # image_cropper = CropImage()
# # # # h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # # # # ====== Load FAISS index ======
# # # # print("📂 Đang tải FAISS index và student_ids...")
# # # # index = faiss.read_index(FAISS_PATH)
# # # # with open(IDS_PATH, "rb") as f:
# # # #     student_ids = pickle.load(f)
# # # # print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # # # # ====== Khởi tạo InsightFace ======
# # # # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # # # app.prepare(ctx_id=0, det_size=(320, 320))

# # # # # ====== Gửi dữ liệu theo lô ======
# # # # send_buffer = []
# # # # send_lock = threading.Lock()
# # # # send_interval = 3  # giây

# # # # def send_data_batch():
# # # #     while True:
# # # #         time.sleep(send_interval)
# # # #         with send_lock:
# # # #             buffer_copy = send_buffer.copy()
# # # #             send_buffer.clear()

# # # #         for record in buffer_copy:
# # # #             try:
# # # #                 response = requests.post(API_URL, json=record)
# # # #                 if response.status_code in [200, 201]:
# # # #                     print(f"✅ Gửi thành công: {record['name']} lúc {record['timestamp']}")
# # # #                 else:
# # # #                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
# # # #             except Exception as e:
# # # #                 print(f"⚠️ Gửi lỗi: {e}")

# # # # # Khởi động luồng gửi
# # # # threading.Thread(target=send_data_batch, daemon=True).start()

# # # # # ====== Hàm upload ảnh giả mạo từ RAM, không ghi file ======
# # # # def upload_fake_face_async(frame, bbox, identity="unknown"):
# # # #     def do_upload():
# # # #         x1, y1, x2, y2 = bbox
# # # #         face_img = frame[y1:y2, x1:x2]

# # # #         # Resize để nhẹ hơn (tuỳ chọn)
# # # #         face_img = cv2.resize(face_img, (160, 160))

# # # #         # Encode JPEG sang bytes
# # # #         success, buffer = cv2.imencode(".jpg", face_img)
# # # #         if not success:
# # # #             print("⚠️ Không encode được ảnh.")
# # # #             return

# # # #         image_bytes = io.BytesIO(buffer.tobytes())

# # # #         try:
# # # #             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
# # # #             response = cloudinary.uploader.upload(
# # # #                 image_bytes,
# # # #                 folder="fake_faces/",
# # # #                 public_id=f"fake_{identity}_{timestamp}",
# # # #                 resource_type="image"
# # # #             )
# # # #             print(f"☁️ Upload thành công: {response['secure_url']}")
# # # #         except Exception as e:
# # # #             print(f"❌ Upload lỗi: {e}")

# # # #     threading.Thread(target=do_upload, daemon=True).start()

# # # # # ====== Hàm chống giả mạo ======
# # # # def is_real_face(frame, bbox):
# # # #     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# # # #     param = {
# # # #         "org_img": frame,
# # # #         "bbox": image_bbox,
# # # #         "scale": scale,
# # # #         "out_w": w_input,
# # # #         "out_h": h_input,
# # # #         "crop": True if scale is not None else False,
# # # #     }
# # # #     spoof_input = image_cropper.crop(**param)
# # # #     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# # # #     label = np.argmax(prediction)
# # # #     confidence = prediction[0][label] / 2
# # # #     return label == 1, confidence

# # # # # ====== Nhận diện khuôn mặt ======
# # # # def recognize_face(face_embedding):
# # # #     embedding = face_embedding.astype(np.float32).reshape(1, -1)
# # # #     embedding /= np.linalg.norm(embedding)
# # # #     D, I = index.search(embedding, 1)
# # # #     distance = float(D[0][0])
# # # #     idx = int(I[0][0])
# # # #     if distance < FAISS_THRESHOLD:
# # # #         return student_ids[idx], distance
# # # #     return "Unknown", distance

# # # # # ====== Vẽ nhãn lên khung hình ======
# # # # def draw_label(frame, bbox, label_text, color):
# # # #     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# # # #     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
# # # #                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # # # # ====== Mở webcam ======
# # # # cap = cv2.VideoCapture(0)
# # # # if not cap.isOpened():
# # # #     print("❌ Không mở được webcam.")
# # # #     exit()

# # # # print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# # # # # ====== Biến thống kê ======
# # # # frame_count = 0
# # # # face_count = 0
# # # # total_elapsed_time = 0.0
# # # # total_face_time = 0.0
# # # # last_spoof_check = 0
# # # # spoof_result = None

# # # # while True:
# # # #     ret, frame = cap.read()
# # # #     if not ret:
# # # #         print("⚠️ Lỗi khi đọc webcam.")
# # # #         break

# # # #     frame_start_time = time.perf_counter()
# # # #     faces = app.get(frame)
# # # #     face_count += len(faces)

# # # #     for face in faces:
# # # #         bbox = face.bbox.astype(int)

# # # #         # Anti-spoofing mỗi 2 giây
# # # #         if time.time() - last_spoof_check > 2:
# # # #             is_real, confidence = is_real_face(frame, bbox)
# # # #             spoof_result = (is_real, confidence)
# # # #             last_spoof_check = time.time()

# # # #         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

# # # #         face_start_time = time.perf_counter()

# # # #         if is_real:
# # # #             identity, dist = recognize_face(face.embedding)
# # # #             label_text = f"{identity} ({dist:.2f})"
# # # #             color = (0, 255, 0)

# # # #             if identity != "Unknown":
# # # #                 payload = {
# # # #                     "name": identity,
# # # #                     "confidence": round(dist, 2),
# # # #                     "real_face": 1.0,
# # # #                     "timestamp": datetime.now().isoformat()
# # # #                 }
# # # #                 with send_lock:
# # # #                     send_buffer.append(payload)
# # # #         else:
# # # #             label_text = f"Fake Face ({confidence:.2f})"
# # # #             color = (0, 0, 255)
# # # #             upload_fake_face_async(frame, bbox)

# # # #         draw_label(frame, bbox, label_text, color)

# # # #         face_time = time.perf_counter() - face_start_time
# # # #         total_face_time += face_time

# # # #     # Đếm khung hình
# # # #     frame_count += 1
# # # #     elapsed = time.perf_counter() - frame_start_time
# # # #     total_elapsed_time += elapsed

# # # #     fps = f"FPS: {1 / elapsed:.2f}"
# # # #     cv2.putText(frame, fps, (10, 30),
# # # #                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

# # # #     cv2.imshow("Anti-Spoof + Face Recognition", frame)
# # # #     if cv2.waitKey(1) & 0xFF == ord('q'):
# # # #         break

# # # # # ====== Giải phóng ======
# # # # cap.release()
# # # # cv2.destroyAllWindows()

# # # # # ====== Thống kê kết quả ======
# # # # print("\n===== THỐNG KÊ HIỆU SUẤT =====")
# # # # print(f"Tổng số khung hình:        {frame_count}")
# # # # print(f"Tổng số khuôn mặt:         {face_count}")
# # # # print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
# # # # print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
# # # # print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây (nếu có face)")


# # # import time
# # # import cv2
# # # import numpy as np
# # # import faiss
# # # import pickle
# # # import os
# # # import warnings
# # # import requests
# # # import threading
# # # import io
# # # import queue
# # # from datetime import datetime
# # # from insightface.app import FaceAnalysis
# # # from src.anti_spoof_predict import AntiSpoofPredict
# # # from src.generate_patches import CropImage
# # # from src.utility import parse_model_name
# # # import cloudinary
# # # import cloudinary.uploader

# # # warnings.filterwarnings('ignore')

# # # # ====== Cloudinary Config ======
# # # cloudinary.config(
# # #     cloud_name="dvc80qdie",
# # #     api_key="221435714784277",
# # #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# # #     secure=True
# # # )

# # # # ====== Cấu hình ======
# # # MODEL_DIR = "./resources/anti_spoof_models"
# # # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # # DEVICE_ID = 0
# # # FAISS_PATH = "faiss_index/face_index.faiss"
# # # IDS_PATH = "faiss_index/student_ids.pkl"
# # # FAISS_THRESHOLD = 1.2
# # # API_URL = "http://localhost:5000/api/v1/exam-attendance/"
# # # CAMERA_RESOLUTION = (640, 480) # Giảm độ phân giải để tăng tốc

# # # # --- KHỞI TẠO CÁC HÀNG ĐỢI (QUEUES) ---
# # # frames_queue = queue.Queue(maxsize=2) # Hàng đợi chứa khung hình thô từ camera
# # # results_queue = queue.Queue(maxsize=2) # Hàng đợi chứa kết quả cuối cùng để hiển thị
# # # upload_queue = queue.Queue(maxsize=10) # Hàng đợi chứa ảnh giả mạo để upload
# # # api_send_buffer = []
# # # api_send_lock = threading.Lock()


# # # # ====== LUỒNG 1: UPLOADER WORKER (Không đổi) ======
# # # def uploader_worker():
# # #     while True:
# # #         try:
# # #             face_img, identity = upload_queue.get()
# # #             success, buffer = cv2.imencode(".jpg", face_img)
# # #             if not success: continue
            
# # #             image_bytes = io.BytesIO(buffer.tobytes())
# # #             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
# # #             cloudinary.uploader.upload(
# # #                 image_bytes,
# # #                 folder="fake_faces/",
# # #                 public_id=f"fake_{identity}_{timestamp}",
# # #                 resource_type="image"
# # #             )
# # #             # print(f"☁️ Uploaded fake face.")
# # #             upload_queue.task_done()
# # #         except Exception as e:
# # #             print(f"❌ Lỗi upload Cloudinary: {e}")

# # # # ====== LUỒNG 2: API SENDER WORKER (Không đổi) ======
# # # def api_sender_worker():
# # #     while True:
# # #         time.sleep(3)
# # #         with api_send_lock:
# # #             if not api_send_buffer: continue
# # #             buffer_copy = api_send_buffer.copy()
# # #             api_send_buffer.clear()

# # #         for record in buffer_copy:
# # #             try:
# # #                 requests.post(API_URL, json=record, timeout=5)
# # #                 # print(f"✅ Sent attendance: {record['name']}")
# # #             except Exception as e:
# # #                 print(f"⚠️ Lỗi gửi API: {e}")


# # # # ====== LUỒNG 3: PROCESSING WORKER (CÔNG NHÂN XỬ LÝ CHÍNH) ======
# # # def processing_worker():
# # #     # Mỗi luồng phải khởi tạo model của riêng nó
# # #     app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # #     app.prepare(ctx_id=0, det_size=(320, 320))
    
# # #     model_test = AntiSpoofPredict(DEVICE_ID)
# # #     image_cropper = CropImage()
# # #     h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # #     index = faiss.read_index(FAISS_PATH)
# # #     with open(IDS_PATH, "rb") as f:
# # #         student_ids = pickle.load(f)

# # #     # --- Các hàm helper bên trong luồng ---
# # #     def is_real_face(frame, bbox):
# # #         image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# # #         param = {"org_img": frame, "bbox": image_bbox, "scale": scale, "out_w": w_input, "out_h": h_input, "crop": True}
# # #         if param["bbox"][2] == 0 or param["bbox"][3] == 0: return False, 0.0
# # #         spoof_input = image_cropper.crop(**param)
# # #         prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# # #         label = np.argmax(prediction)
# # #         return label == 1, prediction[0][label] / 2

# # #     def recognize_face(face_embedding):
# # #         embedding = face_embedding.astype(np.float32).reshape(1, -1)
# # #         embedding /= np.linalg.norm(embedding)
# # #         D, I = index.search(embedding, 1)
# # #         if D[0][0] < FAISS_THRESHOLD:
# # #             return student_ids[int(I[0][0])], float(D[0][0])
# # #         return "Unknown", float(D[0][0])

# # #     # --- Vòng lặp chính của luồng xử lý ---
# # #     while True:
# # #         try:
# # #             frame = frames_queue.get(timeout=1)
# # #             processed_results = []
            
# # #             # Tác vụ nặng: phát hiện khuôn mặt
# # #             faces = app.get(frame)

# # #             for face in faces:
# # #                 bbox = face.bbox.astype(int)
                
# # #                 # Tác vụ nặng: anti-spoofing
# # #                 is_real, confidence = is_real_face(frame, bbox)

# # #                 if is_real:
# # #                     # Tác vụ nặng: nhận dạng
# # #                     identity, dist = recognize_face(face.embedding)
# # #                     label_text = f"{identity} ({dist:.2f})"
# # #                     color = (0, 255, 0)

# # #                     if identity != "Unknown":
# # #                         payload = {"name": identity, "timestamp": datetime.now().isoformat()}
# # #                         with api_send_lock:
# # #                             # Tránh gửi trùng lặp quá nhanh
# # #                             if not any(p['name'] == identity for p in api_send_buffer):
# # #                                 api_send_buffer.append(payload)
# # #                 else:
# # #                     label_text = f"Fake Face ({confidence:.2f})"
# # #                     color = (0, 0, 255)
# # #                     if not upload_queue.full():
# # #                         x1, y1, x2, y2 = bbox
# # #                         face_img = frame[y1:y2, x1:x2]
# # #                         face_img_resized = cv2.resize(face_img, (160, 160))
# # #                         upload_queue.put((face_img_resized, "unknown"))

# # #                 processed_results.append({'bbox': bbox, 'label': label_text, 'color': color})
            
# # #             # Đưa kết quả đã xử lý vào hàng đợi kết quả
# # #             results_queue.put(processed_results)
# # #             frames_queue.task_done()

# # #         except queue.Empty:
# # #             continue # Đợi khung hình mới
# # #         except Exception as e:
# # #             print(f"❌ Lỗi trong luồng xử lý: {e}")


# # # # ====== LUỒNG CHÍNH (CAMERA & DISPLAY) - SIÊU NHẸ ======
# # # def main():
# # #     # Khởi động tất cả các luồng worker
# # #     threading.Thread(target=processing_worker, daemon=True).start()
# # #     threading.Thread(target=uploader_worker, daemon=True).start()
# # #     threading.Thread(target=api_sender_worker, daemon=True).start()

# # #     print("📷 Nhận diện realtime (ấn 'q' để thoát)")
# # #     cap = cv2.VideoCapture(0)
# # #     if not cap.isOpened():
# # #         print("❌ Không mở được webcam.")
# # #         return
        
# # #     cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
# # #     cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])
    
# # #     start_time = time.time()
# # #     frame_count = 0
    
# # #     while True:
# # #         ret, frame = cap.read()
# # #         if not ret:
# # #             break

# # #         # Đưa khung hình vào hàng đợi xử lý mà không chờ đợi
# # #         if not frames_queue.full():
# # #             frames_queue.put(frame)

# # #         # Lấy kết quả từ hàng đợi kết quả (nếu có)
# # #         try:
# # #             results = results_queue.get_nowait()
# # #             for res in results:
# # #                 bbox = res['bbox']
# # #                 label = res['label']
# # #                 color = res['color']
# # #                 cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# # #                 cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
# # #             results_queue.task_done()
# # #         except queue.Empty:
# # #             pass # Không có kết quả mới, cứ hiển thị khung hình hiện tại

# # #         # Tính toán và hiển thị FPS
# # #         frame_count += 1
# # #         elapsed_time = time.time() - start_time
# # #         fps = frame_count / elapsed_time
# # #         cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
# # #         cv2.imshow("Realtime Recognition", frame)

# # #         if cv2.waitKey(1) & 0xFF == ord('q'):
# # #             break

# # #     cap.release()
# # #     cv2.destroyAllWindows()

# # # if __name__ == '__main__':
# # #     main()




























# # # # import time
# # # # import cv2
# # # # import numpy as np
# # # # import faiss
# # # # import pickle
# # # # import os
# # # # import warnings
# # # # import requests
# # # # import threading
# # # # import io
# # # # import queue
# # # # from datetime import datetime
# # # # from insightface.app import FaceAnalysis
# # # # from src.anti_spoof_predict import AntiSpoofPredict
# # # # from src.generate_patches import CropImage
# # # # from src.utility import parse_model_name
# # # # import cloudinary
# # # # import cloudinary.uploader

# # # # warnings.filterwarnings('ignore')

# # # # # ====== Cloudinary Config ======
# # # # cloudinary.config(
# # # #     cloud_name="dvc80qdie",
# # # #     api_key="221435714784277",
# # # #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# # # #     secure=True
# # # # )

# # # # # ====== Cấu hình ======
# # # # MODEL_DIR = "./resources/anti_spoof_models"
# # # # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # # # DEVICE_ID = 0
# # # # FAISS_PATH = "faiss_index/face_index.faiss"
# # # # IDS_PATH = "faiss_index/student_ids.pkl"
# # # # FAISS_THRESHOLD = 1.2
# # # # API_URL = "http://localhost:5000/api/v1/exam-attendance/"
# # # # CAMERA_RESOLUTION = (640, 480)

# # # # # --- KHỞI TẠO CÁC HÀNG ĐỢI (QUEUES) ---
# # # # frames_queue = queue.Queue(maxsize=1)  # Chỉ cần buffer 1 frame để xử lý
# # # # results_queue = queue.Queue(maxsize=1) # Hàng đợi chứa (khung hình, kết quả) đã xử lý
# # # # upload_queue = queue.Queue(maxsize=10) # Hàng đợi chứa (frame, bbox) để upload
# # # # api_send_buffer = []
# # # # api_send_lock = threading.Lock()

# # # # # ====== LUỒNG 1: UPLOADER WORKER - Cải tiến để cắt ảnh tại đây ======
# # # # def uploader_worker():
# # # #     while True:
# # # #         try:
# # # #             # <<< THAY ĐỔI: Nhận cả frame và bbox để đảm bảo cắt đúng
# # # #             frame, bbox, identity = upload_queue.get()

# # # #             # Cắt khuôn mặt từ frame
# # # #             x1, y1, x2, y2 = bbox
# # # #             face_img = frame[y1:y2, x1:x2]

# # # #             # Kiểm tra xem cắt có thành công không
# # # #             if face_img.size == 0:
# # # #                 print("⚠️ Bỏ qua ảnh giả mạo rỗng.")
# # # #                 continue

# # # #             face_img_resized = cv2.resize(face_img, (160, 160))
# # # #             success, buffer = cv2.imencode(".jpg", face_img_resized)
# # # #             if not success: continue

# # # #             image_bytes = io.BytesIO(buffer.tobytes())
# # # #             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
# # # #             cloudinary.uploader.upload(
# # # #                 image_bytes,
# # # #                 folder="fake_faces/",
# # # #                 public_id=f"fake_{identity}_{timestamp}",
# # # #                 resource_type="image"
# # # #             )
# # # #             # print(f"☁️ Đã upload ảnh giả mạo.")
# # # #             upload_queue.task_done()
# # # #         except Exception as e:
# # # #             print(f"❌ Lỗi upload Cloudinary: {e}")

# # # # # ====== LUỒNG 2: API SENDER WORKER (Không đổi) ======
# # # # def api_sender_worker():
# # # #     while True:
# # # #         time.sleep(3)
# # # #         with api_send_lock:
# # # #             if not api_send_buffer: continue
# # # #             buffer_copy = api_send_buffer.copy()
# # # #             api_send_buffer.clear()

# # # #         for record in buffer_copy:
# # # #             try:
# # # #                 requests.post(API_URL, json=record, timeout=5)
# # # #             except Exception as e:
# # # #                 print(f"⚠️ Lỗi gửi API: {e}")

# # # # # ====== LUỒNG 3: PROCESSING WORKER (CÔNG NHÂN XỬ LÝ CHÍNH) ======
# # # # def processing_worker():
# # # #     app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # # #     app.prepare(ctx_id=0, det_size=(320, 320))
# # # #     model_test = AntiSpoofPredict(DEVICE_ID)
# # # #     image_cropper = CropImage()
# # # #     h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)
# # # #     index = faiss.read_index(FAISS_PATH)
# # # #     with open(IDS_PATH, "rb") as f:
# # # #         student_ids = pickle.load(f)

# # # #     def is_real_face(frame, bbox):
# # # #         image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# # # #         param = {"org_img": frame, "bbox": image_bbox, "scale": scale, "out_w": w_input, "out_h": h_input, "crop": True}
# # # #         if param["bbox"][2] <= 0 or param["bbox"][3] <= 0: return False, 0.0
# # # #         spoof_input = image_cropper.crop(**param)
# # # #         prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# # # #         label = np.argmax(prediction)
# # # #         return label == 1, prediction[0][label] / 2

# # # #     def recognize_face(face_embedding):
# # # #         embedding = face_embedding.astype(np.float32).reshape(1, -1)
# # # #         embedding /= np.linalg.norm(embedding)
# # # #         D, I = index.search(embedding, 1)
# # # #         if D[0][0] < FAISS_THRESHOLD:
# # # #             return student_ids[int(I[0][0])], float(D[0][0])
# # # #         return "Unknown", float(D[0][0])

# # # #     while True:
# # # #         try:
# # # #             frame = frames_queue.get(timeout=1)
# # # #             processed_results = []
# # # #             faces = app.get(frame)

# # # #             for face in faces:
# # # #                 bbox = face.bbox.astype(int)
# # # #                 is_real, confidence = is_real_face(frame, bbox)

# # # #                 if is_real:
# # # #                     identity, dist = recognize_face(face.embedding)
# # # #                     label_text = f"{identity} ({dist:.2f})"
# # # #                     color = (0, 255, 0)
# # # #                     if identity != "Unknown":
# # # #                         payload = {"name": identity, "timestamp": datetime.now().isoformat()}
# # # #                         with api_send_lock:
# # # #                             if not any(p['name'] == identity for p in api_send_buffer):
# # # #                                 api_send_buffer.append(payload)
# # # #                 else:
# # # #                     label_text = f"Fake Face ({confidence:.2f})"
# # # #                     color = (0, 0, 255)
# # # #                     if not upload_queue.full():
# # # #                         # <<< THAY ĐỔI QUAN TRỌNG: Gửi cả frame và bbox
# # # #                         # để luồng uploader tự cắt, đảm bảo không lỗi
# # # #                         upload_queue.put((frame.copy(), bbox, "unknown"))

# # # #                 processed_results.append({'bbox': bbox, 'label': label_text, 'color': color})

# # # #             # <<< THAY ĐỔI QUAN TRỌNG: Gửi cả FRAME và KẾT QUẢ của nó đi
# # # #             results_queue.put((frame, processed_results))
# # # #             frames_queue.task_done()
# # # #         except queue.Empty:
# # # #             continue
# # # #         except Exception as e:
# # # #             print(f"❌ Lỗi trong luồng xử lý: {e}", exc_info=True)


# # # # # ====== LUỒNG CHÍNH (CAMERA & DISPLAY) - ĐỒNG BỘ HÓA ======
# # # # def main():
# # # #     threading.Thread(target=processing_worker, daemon=True).start()
# # # #     threading.Thread(target=uploader_worker, daemon=True).start()
# # # #     threading.Thread(target=api_sender_worker, daemon=True).start()

# # # #     print("📷 Nhận diện realtime (ấn 'q' để thoát)")
# # # #     cap = cv2.VideoCapture(0)
# # # #     if not cap.isOpened():
# # # #         print("❌ Không mở được webcam.")
# # # #         return

# # # #     cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
# # # #     cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])

# # # #     last_processed_frame = None
# # # #     processing_fps = 0
# # # #     frame_times = queue.Queue()

# # # #     while True:
# # # #         ret, frame = cap.read()
# # # #         if not ret:
# # # #             break

# # # #         # Đưa khung hình vào hàng đợi xử lý
# # # #         if not frames_queue.full():
# # # #             frames_queue.put(frame)

# # # #         # Lấy kết quả (frame + bboxes) từ hàng đợi kết quả
# # # #         try:
# # # #             # <<< THAY ĐỔI QUAN TRỌNG: Nhận cả frame và kết quả
# # # #             processed_frame, results = results_queue.get_nowait()
            
# # # #             # Vẽ kết quả lên ĐÚNG khung hình mà nó đã được xử lý
# # # #             for res in results:
# # # #                 bbox, label, color = res['bbox'], res['label'], res['color']
# # # #                 cv2.rectangle(processed_frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# # # #                 cv2.putText(processed_frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
# # # #             # Tính toán FPS dựa trên tốc độ xử lý
# # # #             now = time.time()
# # # #             frame_times.put(now)
# # # #             while frame_times.qsize() > 20:
# # # #                 frame_times.get()
# # # #             if frame_times.qsize() > 1:
# # # #                 processing_fps = (frame_times.qsize() -1) / (now - frame_times.queue[0])
            
# # # #             # Cập nhật khung hình để hiển thị
# # # #             last_processed_frame = processed_frame
# # # #             results_queue.task_done()

# # # #         except queue.Empty:
# # # #             pass # Không có kết quả mới, tiếp tục hiển thị khung hình cũ

# # # #         # Hiển thị khung hình cuối cùng đã được xử lý
# # # #         if last_processed_frame is not None:
# # # #             # Hiển thị FPS xử lý (con số thật sự quan trọng)
# # # #             cv2.putText(last_processed_frame, f"Processing FPS: {processing_fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
# # # #             cv2.imshow("Realtime Recognition", last_processed_frame)

# # # #         if cv2.waitKey(1) & 0xFF == ord('q'):
# # # #             break

# # # #     cap.release()
# # # #     cv2.destroyAllWindows()


# # # # if __name__ == '__main__':
# # # #     main()

# # import time
# # import cv2
# # import numpy as np
# # import faiss
# # import pickle
# # import os
# # import warnings
# # import requests
# # import threading
# # import io
# # import queue
# # from datetime import datetime
# # from insightface.app import FaceAnalysis
# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name
# # import cloudinary
# # import cloudinary.uploader

# # warnings.filterwarnings('ignore')

# # # ====== Cloudinary Config ======
# # cloudinary.config(
# #     cloud_name="dvc80qdie",
# #     api_key="221435714784277",
# #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# #     secure=True
# # )

# # # ====== Cấu hình ======
# # MODEL_DIR = "./resources/anti_spoof_models"
# # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # DEVICE_ID = 0
# # FAISS_PATH = "faiss_index/face_index.faiss"
# # IDS_PATH = "faiss_index/student_ids.pkl"
# # FAISS_THRESHOLD = 1.2
# # API_URL = "http://localhost:5000/api/v1/exam-attendance/"
# # CAMERA_RESOLUTION = (640, 480)

# # frames_queue = queue.Queue(maxsize=2)
# # results_queue = queue.Queue(maxsize=2)
# # upload_queue = queue.Queue(maxsize=10)
# # api_send_buffer = []
# # api_send_lock = threading.Lock()


# # # ====== Luồng Upload Cloudinary ======
# # def uploader_worker():
# #     while True:
# #         try:
# #             face_img, identity = upload_queue.get()
# #             success, buffer = cv2.imencode(".jpg", face_img)
# #             if not success:
# #                 continue

# #             image_bytes = io.BytesIO(buffer.tobytes())
# #             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
# #             cloudinary.uploader.upload(
# #                 image_bytes,
# #                 folder="fake_faces/",
# #                 public_id=f"fake_{identity}_{timestamp}",
# #                 resource_type="image"
# #             )
# #             upload_queue.task_done()
# #         except Exception as e:
# #             print(f"❌ Lỗi upload Cloudinary: {e}")

# # # ====== Luồng Gửi API ======
# # def api_sender_worker():
# #     while True:
# #         time.sleep(3)
# #         with api_send_lock:
# #             if not api_send_buffer:
# #                 continue
# #             buffer_copy = api_send_buffer.copy()
# #             api_send_buffer.clear()

# #         for record in buffer_copy:
# #             try:
# #                 requests.post(API_URL, json=record, timeout=5)
# #             except Exception as e:
# #                 print(f"⚠️ Lỗi gửi API: {e}")

# # # ====== Luồng Xử Lý Chính ======
# # def processing_worker():
# #     app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# #     app.prepare(ctx_id=0, det_size=(320, 320))

# #     model_test = AntiSpoofPredict(DEVICE_ID)
# #     image_cropper = CropImage()
# #     h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# #     index = faiss.read_index(FAISS_PATH)
# #     with open(IDS_PATH, "rb") as f:
# #         student_ids = pickle.load(f)

# #     def is_real_face(frame, bbox):
# #         image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# #         param = {"org_img": frame, "bbox": image_bbox, "scale": scale, "out_w": w_input, "out_h": h_input, "crop": True}
# #         if param["bbox"][2] == 0 or param["bbox"][3] == 0:
# #             return False, 0.0
# #         spoof_input = image_cropper.crop(**param)
# #         prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# #         label = np.argmax(prediction)
# #         return label == 1, prediction[0][label] / 2

# #     def recognize_face(face_embedding):
# #         embedding = face_embedding.astype(np.float32).reshape(1, -1)
# #         embedding /= np.linalg.norm(embedding)
# #         D, I = index.search(embedding, 1)
# #         if D[0][0] < FAISS_THRESHOLD:
# #             return student_ids[int(I[0][0])], float(D[0][0])
# #         return "Unknown", float(D[0][0])

# #     while True:
# #         try:
# #             frame = frames_queue.get(timeout=1)
# #             processed_results = []
# #             faces = app.get(frame)

# #             for face in faces:
# #                 bbox = face.bbox.astype(int)
# #                 is_real, confidence = is_real_face(frame, bbox)

# #                 if is_real:
# #                     identity, dist = recognize_face(face.embedding)
# #                     label_text = f"{identity} ({dist:.2f})"
# #                     color = (0, 255, 0)

# #                     if identity != "Unknown":
# #                         payload = {"name": identity, "timestamp": datetime.now().isoformat()}
# #                         with api_send_lock:
# #                             if not any(p['name'] == identity for p in api_send_buffer):
# #                                 api_send_buffer.append(payload)
# #                 else:
# #                     label_text = f"Fake Face ({confidence:.2f})"
# #                     color = (0, 0, 255)

# #                     # Gửi toàn bộ frame chứ không chỉ crop khuôn mặt
# #                     if not upload_queue.full():
# #                         full_img = cv2.resize(frame, (640, 480))
# #                         upload_queue.put((full_img, "unknown"))

# #                 processed_results.append({'bbox': bbox, 'label': label_text, 'color': color})

# #             results_queue.put(processed_results)
# #             frames_queue.task_done()
# #         except queue.Empty:
# #             continue
# #         except Exception as e:
# #             print(f"❌ Lỗi trong luồng xử lý: {e}")

# # # ====== Main Loop (Camera & Display) ======
# # def main():
# #     threading.Thread(target=processing_worker, daemon=True).start()
# #     threading.Thread(target=uploader_worker, daemon=True).start()
# #     threading.Thread(target=api_sender_worker, daemon=True).start()

# #     print("📷 Nhận diện realtime (ấn 'q' để thoát)")
# #     cap = cv2.VideoCapture(0)
# #     if not cap.isOpened():
# #         print("❌ Không mở được webcam.")
# #         return

# #     cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
# #     cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])

# #     start_time = time.time()
# #     frame_count = 0
# #     static_results = []

# #     while True:
# #         ret, frame = cap.read()
# #         if not ret:
# #             break

# #         if not frames_queue.full():
# #             frames_queue.put(frame)

# #         try:
# #             new_results = results_queue.get_nowait()
# #             static_results = new_results
# #             results_queue.task_done()
# #         except queue.Empty:
# #             pass

# #         for res in static_results:
# #             bbox = res['bbox']
# #             label = res['label']
# #             color = res['color']
# #             cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# #             cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# #         frame_count += 1
# #         elapsed_time = time.time() - start_time
# #         fps = frame_count / elapsed_time
# #         cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

# #         cv2.imshow("Realtime Recognition", frame)

# #         if cv2.waitKey(1) & 0xFF == ord('q'):
# #             break

# #     cap.release()
# #     cv2.destroyAllWindows()

# # if __name__ == '__main__':
# #     main()















# ===================================================

# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# import io
# import queue
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# import cloudinary
# import cloudinary.uploader

# warnings.filterwarnings('ignore')

# # ====== Cloudinary Config ======
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
# FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# FAISS_THRESHOLD = 1.2
# API_URL = "http://localhost:5000/api/v1/exam-attendance/"
# CAMERA_RESOLUTION = (640, 480)

# frames_queue = queue.Queue(maxsize=2)
# results_queue = queue.Queue(maxsize=2)
# upload_queue = queue.Queue(maxsize=10)
# api_send_buffer = []
# api_send_lock = threading.Lock()

# # ====== Luồng Upload Cloudinary ======
# def uploader_worker():
#     while True:
#         try:
#             face_img, identity = upload_queue.get()
#             success, buffer = cv2.imencode(".jpg", face_img)
#             if not success:
#                 upload_queue.task_done()
#                 continue

#             image_bytes = io.BytesIO(buffer.tobytes())
#             timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#             cloudinary.uploader.upload(
#                 image_bytes,
#                 folder="fake_faces/",
#                 public_id=f"fake_{identity}_{timestamp}",
#                 resource_type="image"
#             )
#             upload_queue.task_done()
#         except Exception as e:
#             print(f"❌ Lỗi upload Cloudinary: {e}")

# # ====== Luồng Gửi API ======
# def api_sender_worker():
#     while True:
#         time.sleep(3)
#         with api_send_lock:
#             if not api_send_buffer:
#                 continue
#             buffer_copy = api_send_buffer.copy()
#             api_send_buffer.clear()

#         for record in buffer_copy:
#             try:
#                 requests.post(API_URL, json=record, timeout=5)
#             except Exception as e:
#                 print(f"⚠️ Lỗi gửi API: {e}")

# # ====== Luồng Xử Lý Chính ======
# def processing_worker():
#     app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
#     app.prepare(ctx_id=0, det_size=(320, 320))

#     model_test = AntiSpoofPredict(DEVICE_ID)
#     image_cropper = CropImage()
#     h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

#     index = faiss.read_index(FAISS_PATH)
#     with open(IDS_PATH, "rb") as f:
#         student_ids = pickle.load(f)

#     last_fake_upload_time = 0  # Giới hạn upload ảnh giả

#     def is_real_face(frame, bbox):
#         image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#         param = {"org_img": frame, "bbox": image_bbox, "scale": scale, "out_w": w_input, "out_h": h_input, "crop": True}
#         if param["bbox"][2] == 0 or param["bbox"][3] == 0:
#             return False, 0.0
#         spoof_input = image_cropper.crop(**param)
#         prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
#         label = np.argmax(prediction)
#         return label == 1, prediction[0][label] / 2

#     def recognize_face(face_embedding):
#         embedding = face_embedding.astype(np.float32).reshape(1, -1)
#         embedding /= np.linalg.norm(embedding)
#         D, I = index.search(embedding, 1)
#         if D[0][0] < FAISS_THRESHOLD:
#             return student_ids[int(I[0][0])], float(D[0][0])
#         return "Unknown", float(D[0][0])

#     while True:
#         try:
#             frame = frames_queue.get(timeout=1)
#             processed_results = []
#             faces = app.get(frame)

#             for face in faces:
#                 bbox = face.bbox.astype(int)
#                 is_real, confidence = is_real_face(frame, bbox)

#                 if is_real:
#                     identity, dist = recognize_face(face.embedding)
#                     label_text = f"{identity} ({dist:.2f})"
#                     color = (0, 255, 0)

#                     if identity != "Unknown":
#                         payload = {"name": identity, "timestamp": datetime.now().isoformat()}
#                         with api_send_lock:
#                             if not any(p['name'] == identity for p in api_send_buffer):
#                                 api_send_buffer.append(payload)
#                 else:
#                     label_text = f"Fake Face ({confidence:.2f})"
#                     color = (0, 0, 255)

#                     # Gửi full frame resized nếu là fake (tối đa mỗi 5 giây)
#                     if not upload_queue.full() and (time.time() - last_fake_upload_time > 5):
#                         small_frame = cv2.resize(frame, (320, 240))
#                         upload_queue.put((small_frame.copy(), "unknown"))
#                         last_fake_upload_time = time.time()

#                 processed_results.append({'bbox': bbox, 'label': label_text, 'color': color})

#             results_queue.put(processed_results)
#             frames_queue.task_done()
#         except queue.Empty:
#             continue
#         except Exception as e:
#             print(f"❌ Lỗi trong luồng xử lý: {e}")

# # ====== Main Loop (Camera & Display) ======
# def main():
#     threading.Thread(target=processing_worker, daemon=True).start()
#     threading.Thread(target=uploader_worker, daemon=True).start()
#     threading.Thread(target=api_sender_worker, daemon=True).start()

#     print("📷 Nhận diện realtime (ấn 'q' để thoát)")
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("❌ Không mở được webcam.")
#         return

#     cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
#     cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])

#     start_time = time.time()
#     frame_count = 0
#     static_results = []

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         if not frames_queue.full():
#             frames_queue.put(frame)

#         try:
#             new_results = results_queue.get_nowait()
#             static_results = new_results
#             results_queue.task_done()
#         except queue.Empty:
#             pass

#         for res in static_results:
#             bbox = res['bbox']
#             label = res['label']
#             color = res['color']
#             cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#             cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

#         frame_count += 1
#         elapsed_time = time.time() - start_time
#         fps = frame_count / elapsed_time
#         cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#         cv2.imshow("Realtime Recognition", frame)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

# if __name__ == '__main__':
#     main()


# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# # ====== Cấu hình ======
# MODEL_DIR = "./resources/anti_spoof_models"
# MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# DEVICE_ID = 0
# FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# FAISS_THRESHOLD = 1.2
# API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # ====== Khởi tạo mô hình chống giả mạo ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # ====== Load FAISS index ======
# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(FAISS_PATH)
# with open(IDS_PATH, "rb") as f:
#     student_ids = pickle.load(f)
# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ====== Khởi tạo InsightFace ======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Gửi dữ liệu theo lô ======
# send_buffer = []
# send_lock = threading.Lock()
# send_interval = 3  # giây

# def send_data_batch():
#     while True:
#         time.sleep(send_interval)
#         with send_lock:
#             buffer_copy = send_buffer.copy()
#             send_buffer.clear()

#         for record in buffer_copy:
#             try:
#                 response = requests.post(API_URL, json=record)
#                 if response.status_code in [200, 201]:
#                     print(f"✅ Gửi thành công: {record['name']} lúc {record['timestamp']}")
#                 else:
#                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
#             except Exception as e:
#                 print(f"⚠️ Gửi lỗi: {e}")

# # Khởi động luồng gửi
# threading.Thread(target=send_data_batch, daemon=True).start()

# # ====== Hàm chống giả mạo ======
# def is_real_face(frame, bbox):
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True if scale is not None else False,
#     }
#     spoof_input = image_cropper.crop(**param)
#     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
#     label = np.argmax(prediction)
#     confidence = prediction[0][label] / 2
#     return label == 1, confidence

# # ====== Nhận diện khuôn mặt ======
# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32).reshape(1, -1)
#     embedding /= np.linalg.norm(embedding)
#     D, I = index.search(embedding, 1)
#     distance = float(D[0][0])
#     idx = int(I[0][0])
#     if distance < FAISS_THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance

# # ====== Vẽ nhãn lên khung hình ======
# def draw_label(frame, bbox, label_text, color):
#     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # ====== Mở webcam ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Không mở được webcam.")
#     exit()

# print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# # ====== Biến thống kê ======
# frame_count = 0
# face_count = 0
# total_elapsed_time = 0.0
# total_face_time = 0.0
# last_spoof_check = 0
# spoof_result = None

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     frame_start_time = time.perf_counter()
#     faces = app.get(frame)
#     face_count += len(faces)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         # Anti-spoofing mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         face_start_time = time.perf_counter()

#         if is_real:
#             identity, dist = recognize_face(face.embedding)
#             label_text = f"{identity} ({dist:.2f})"
#             color = (0, 255, 0)

#             if identity != "Unknown":
#                 payload = {
#                     "name": identity,
#                     "confidence": round(dist, 2),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 with send_lock:
#                     send_buffer.append(payload)
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#         draw_label(frame, bbox, label_text, color)

#         face_time = time.perf_counter() - face_start_time
#         total_face_time += face_time

#     # Đếm khung hình
#     frame_count += 1
#     elapsed = time.perf_counter() - frame_start_time
#     total_elapsed_time += elapsed

#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ====== Giải phóng ======
# cap.release()
# cv2.destroyAllWindows()

# # ====== Thống kê kết quả ======
# print("\n===== THỐNG KÊ HIỆU SUẤT =====")
# print(f"Tổng số khung hình:        {frame_count}")
# print(f"Tổng số khuôn mặt:         {face_count}")
# print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
# print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
# print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây (nếu có face)")

import time
import cv2
import numpy as np
import faiss
import pickle
import os
import warnings
import requests
import threading
import cloudinary
import cloudinary.uploader
import queue
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

# ====== Cloudinary config ======
cloudinary.config(
    cloud_name="dvc80qdie",
    api_key="221435714784277",
    api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
    secure=True
)

# ====== Config ======
MODEL_DIR = "./resources/anti_spoof_models"
MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
DEVICE_ID = 0
FAISS_PATH = "faiss_index/face_index.faiss"
IDS_PATH = "faiss_index/student_ids.pkl"
FAISS_THRESHOLD = 1.2
API_URL = "http://localhost:5000/api/v1/exam-attendance/"


# ====== Init models ======
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

print("📂 Đang tải FAISS index và student_ids...")
index = faiss.read_index(FAISS_PATH)
with open(IDS_PATH, "rb") as f:
    student_ids = pickle.load(f)
print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ====== Send batch thread ======
send_buffer = []
send_lock = threading.Lock()
send_interval = 3

def send_data_batch():
    while True:
        time.sleep(send_interval)
        with send_lock:
            buffer_copy = send_buffer.copy()
            send_buffer.clear()

        for record in buffer_copy:
            try:
                response = requests.post(API_URL, json=record)
                if response.status_code in [200, 201]:
                    print(f"✅ Gửi thành công: {record['name']} lúc {record['timestamp']}")
                else:
                    print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"⚠️ Gửi lỗi: {e}")

threading.Thread(target=send_data_batch, daemon=True).start()

# ====== Upload fake face to Cloudinary ======
# def upload_fake_face_to_cloudinary(frame, bbox):
#     x1, y1, x2, y2 = bbox
#     cropped_face = frame[y1:y2, x1:x2]
#     _, img_encoded = cv2.imencode('.jpg', cropped_face)
#     response = cloudinary.uploader.upload(
#         img_encoded.tobytes(),
#         folder="fake_faces",
#         public_id=f"fakeface_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
#         resource_type="image"
#     )
#     print(f"☁️ Fake face đã upload: {response.get('secure_url')}")
#     return response.get("secure_url")

def upload_fake_face_to_cloudinary(frame, bbox):
    # Gửi toàn bộ khung hình (frame), không crop
    _, img_encoded = cv2.imencode('.jpg', frame)

    response = cloudinary.uploader.upload(
        img_encoded.tobytes(),
        folder="fake_faces_fullframe",
        public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        resource_type="image"
    )
    print(f"☁️ Ảnh toàn khung chứa fake face đã upload: {response.get('secure_url')}")
    return response.get("secure_url")


# ====== Fake face queue + thread ======
fake_face_queue = queue.Queue()

def fake_face_uploader():
    while True:
        frame, bbox = fake_face_queue.get()
        if frame is None:
            break
        try:
            upload_fake_face_to_cloudinary(frame, bbox)
        except Exception as e:
            print("❌ Lỗi khi upload ảnh fake:", e)

threading.Thread(target=fake_face_uploader, daemon=True).start()

# ====== Anti-spoofing ======
def is_real_face(frame, bbox):
    image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
    param = {
        "org_img": frame,
        "bbox": image_bbox,
        "scale": scale,
        "out_w": w_input,
        "out_h": h_input,
        "crop": True if scale is not None else False,
    }
    spoof_input = image_cropper.crop(**param)
    prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
    label = np.argmax(prediction)
    confidence = prediction[0][label] / 2
    return label == 1, confidence

# ====== Face recognition ======
def recognize_face(face_embedding):
    embedding = face_embedding.astype(np.float32).reshape(1, -1)
    embedding /= np.linalg.norm(embedding)
    D, I = index.search(embedding, 1)
    distance = float(D[0][0])
    idx = int(I[0][0])
    if distance < FAISS_THRESHOLD:
        
        return student_ids[idx], distance
    return "Unknown", distance

# ====== Draw label ======
def draw_label(frame, bbox, label_text, color):
    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
    cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# ====== Camera ======
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Không mở được webcam.")
    exit()

print("📷 Nhận diện realtime (ấn 'q' để thoát)")

frame_count = 0
face_count = 0
total_elapsed_time = 0.0
total_face_time = 0.0
last_spoof_check = 0
spoof_result = None

last_fake_upload_time = 0
fake_upload_interval = 10  # giây, khoảng cách giữa các lần gửi fake face

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Lỗi khi đọc webcam.")
        break

    frame_start_time = time.perf_counter()
    faces = app.get(frame)
    face_count += len(faces)

    for face in faces:
        bbox = face.bbox.astype(int)

        if time.time() - last_spoof_check > 2:
            is_real, confidence = is_real_face(frame, bbox)
            spoof_result = (is_real, confidence)
            last_spoof_check = time.time()

        is_real, confidence = spoof_result if spoof_result else (False, 0.0)

        face_start_time = time.perf_counter()

        if is_real:
            identity, dist = recognize_face(face.embedding)
            label_text = f"{identity} ({dist:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown":
                payload = {
                    "name": identity,
                    "confidence": round(dist, 2),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                with send_lock:
                    send_buffer.append(payload)
        else:
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)

            # 🧵 Gửi ảnh fake vào queue xử lý upload riêng
            # fake_face_queue.put((frame.copy(), bbox))
            current_time = time.time()
            if current_time - last_fake_upload_time > fake_upload_interval:
                fake_face_queue.put((frame.copy(), bbox))
                last_fake_upload_time = current_time

        draw_label(frame, bbox, label_text, color)

        face_time = time.perf_counter() - face_start_time
        total_face_time += face_time

    frame_count += 1
    elapsed = time.perf_counter() - frame_start_time
    total_elapsed_time += elapsed

    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ====== Cleanup ======
cap.release()
cv2.destroyAllWindows()
fake_face_queue.put((None, None))  # kết thúc thread upload nếu cần

# ====== Stats ======
print("\n===== THỐNG KÊ HIỆU SUẤT =====")
print(f"Tổng số khung hình:        {frame_count}")
print(f"Tổng số khuôn mặt:         {face_count}")
print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
if face_count > 0:
    print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây")
