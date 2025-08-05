# import cv2
# import numpy as np
# import time
# import os
# import warnings

# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# warnings.filterwarnings('ignore')

# def check_image(image):
#     height, width, _ = image.shape
#     return width / height == 3 / 4

# def process_frame(frame, model_test, image_cropper, model_dir):
#     prediction = np.zeros((1, 3))
#     image_bbox = model_test.get_bbox(frame)
    
#     for model_name in os.listdir(model_dir):
#         h_input, w_input, model_type, scale = parse_model_name(model_name)
#         param = {
#             "org_img": frame,
#             "bbox": image_bbox,
#             "scale": scale,
#             "out_w": w_input,
#             "out_h": h_input,
#             "crop": True,
#         }
#         if scale is None:
#             param["crop"] = False
#         img = image_cropper.crop(**param)

#         start = time.time()
#         prediction += model_test.predict(img, os.path.join(model_dir, model_name))
        
#     label = np.argmax(prediction)
#     value = prediction[0][label] / 2
    
#     if label == 1:
#         result_text = "Real Face: {:.2f}".format(value)
#         color = (0, 255, 0)
#     else:
#         result_text = "Fake Face: {:.2f}".format(value)
#         color = (0, 0, 255)
    
#     # Vẽ kết quả lên khung hình
#     cv2.rectangle(frame, (image_bbox[0], image_bbox[1]), 
#                   (image_bbox[0] + image_bbox[2], image_bbox[1] + image_bbox[3]), color, 2)
#     cv2.putText(frame, result_text, (image_bbox[0], image_bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#     return frame

# if __name__ == "__main__":
#     model_dir = "./resources/anti_spoof_models"
#     device_id = 0  # GPU ID
#     model_test = AntiSpoofPredict(device_id)
#     image_cropper = CropImage()

#     cap = cv2.VideoCapture(0)
    
#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break
        
#         frame = process_frame(frame, model_test, image_cropper, model_dir)
#         cv2.imshow("Anti-Spoofing Detection", frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
    
#     cap.release()
#     cv2.destroyAllWindows()

# -*- coding: utf-8 -*-
# import cv2
# import numpy as np
# import time
# import os
# import warnings

# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# def check_image(image):
#     height, width, _ = image.shape
#     return width / height == 3 / 4

# def process_frame(frame, model_test, image_cropper, model_dir, model_name):
#     prediction = np.zeros((1, 3))
#     image_bbox = model_test.get_bbox(frame)

#     # Parse model info
#     h_input, w_input, model_type, scale = parse_model_name(model_name)
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True,
#     }
#     if scale is None:
#         param["crop"] = False

#     img = image_cropper.crop(**param)

#     # Inference
#     start = time.time()
#     prediction = model_test.predict(img, os.path.join(model_dir, model_name))
#     elapsed = time.time() - start

#     label = np.argmax(prediction)
#     value = prediction[0][label] / 2

#     if label == 1:
#         result_text = "Real Face: {:.2f} ({:.2f}s)".format(value, elapsed)
#         color = (0, 255, 0)
#     else:
#         result_text = "Fake Face: {:.2f} ({:.2f}s)".format(value, elapsed)
#         color = (0, 0, 255)

#     # Vẽ kết quả lên frame
#     cv2.rectangle(frame, (image_bbox[0], image_bbox[1]),
#                   (image_bbox[0] + image_bbox[2], image_bbox[1] + image_bbox[3]), color, 2)
#     cv2.putText(frame, result_text, (image_bbox[0], image_bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#     return frame

# if __name__ == "__main__":
#     model_dir = "./resources/anti_spoof_models"
#     model_name = "2.7_80x80_MiniFASNetV2.pth"
#     device_id = 0  # Sử dụng CPU, nếu bạn có GPU thì sửa tương ứng

#     model_test = AntiSpoofPredict(device_id)
#     image_cropper = CropImage()

#     cap = cv2.VideoCapture(0)
#     print("[INFO] Press 'q' to quit")

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break

#         frame = process_frame(frame, model_test, image_cropper, model_dir, model_name)
#         cv2.imshow("Anti-Spoofing Detection", frame)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# warnings.filterwarnings('ignore')

# # ====== Khởi tạo model chống giả mạo ======
# model_dir = "./resources/anti_spoof_models"
# model_name = "2.7_80x80_MiniFASNetV2.pth"
# device_id = 0

# model_test = AntiSpoofPredict(device_id)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(model_name)

# # ====== Khởi tạo FAISS + danh sách ID ======
# faiss_path = "faiss_index/face_index.faiss"
# ids_path = "faiss_index/student_ids.pkl"

# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(faiss_path)

# with open(ids_path, "rb") as f:
#     student_ids = pickle.load(f)

# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ====== Khởi tạo InsightFace ======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Webcam + FPS tối ưu ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Không mở được webcam.")
#     exit()

# print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# # Đệm thời gian để chỉ kiểm tra thật/giả mỗi 2 giây
# last_spoof_check = 0
# spoof_result = None

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     start_time = time.perf_counter()

#     # Nhận diện khuôn mặt
#     faces = app.get(frame)

#     for face in faces:
#         bbox = face.bbox.astype(int)
#         face_crop = frame[bbox[1]:bbox[3], bbox[0]:bbox[2]]

#         # Anti-spoofing mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             # Lấy bbox cho mô hình
#             image_bbox = [bbox[0], bbox[1], bbox[2]-bbox[0], bbox[3]-bbox[1]]

#             param = {
#                 "org_img": frame,
#                 "bbox": image_bbox,
#                 "scale": scale,
#                 "out_w": w_input,
#                 "out_h": h_input,
#                 "crop": True if scale is not None else False,
#             }

#             spoof_input = image_cropper.crop(**param)
#             prediction = model_test.predict(spoof_input, os.path.join(model_dir, model_name))
#             label = np.argmax(prediction)
#             value = prediction[0][label] / 2
#             spoof_result = (label, value)  # (1=real, 0=fake)
#             last_spoof_check = time.time()

#         label, conf = spoof_result if spoof_result else (0, 0.0)

#         if label == 1:  # real face
#             # Nhận diện bằng FAISS
#             embedding = face.embedding.astype(np.float32).reshape(1, -1)
#             embedding /= np.linalg.norm(embedding)

#             D, I = index.search(embedding, 1)
#             best_score = float(D[0][0])
#             best_idx = int(I[0][0])

#             identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"
#             label_text = f"{identity} ({best_score:.2f})"
#             color = (0, 255, 0)
#         else:
#             label_text = f"Fake Face ({conf:.2f})"
#             color = (0, 0, 255)

#         # Hiển thị kết quả
#         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#         cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

#     # Hiển thị FPS
#     elapsed = time.perf_counter() - start_time
#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
#                 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()

# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
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
# FAISS_THRESHOLD = 1.2  # L2 khoảng cách, càng nhỏ càng giống

# # ====== Khởi tạo model chống giả mạo ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # ====== Load FAISS index và student_ids ======
# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(FAISS_PATH)
# with open(IDS_PATH, "rb") as f:
#     student_ids = pickle.load(f)
# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ====== Khởi tạo InsightFace ======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Hàm xử lý chống giả mạo ======
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
#     return label == 1, confidence  # True if real face

# # ====== Hàm nhận diện khuôn mặt bằng FAISS ======
# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32).reshape(1, -1)
#     embedding /= np.linalg.norm(embedding)  # chuẩn hóa
#     D, I = index.search(embedding, 1)
#     distance = float(D[0][0])
#     idx = int(I[0][0])
#     if distance < FAISS_THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance

# # ====== Hàm hiển thị kết quả lên khung hình ======
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

# last_spoof_check = 0
# spoof_result = None

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     start_time = time.perf_counter()
#     faces = app.get(frame)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         # Chống giả mạo mỗi 2 giây
#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         if is_real:
#             identity, dist = recognize_face(face.embedding)
#             label_text = f"{identity} ({dist:.2f})"
#             color = (0, 255, 0)
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#         draw_label(frame, bbox, label_text, color)

#     # Hiển thị FPS
#     elapsed = time.perf_counter() - start_time
#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()

import time
import cv2
import numpy as np
import faiss
import pickle
import os
import warnings
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

# ====== Cấu hình ======
MODEL_DIR = "./resources/anti_spoof_models"
MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
DEVICE_ID = 0
FAISS_PATH = "faiss_index/face_index.faiss"
IDS_PATH = "faiss_index/student_ids.pkl"
FAISS_THRESHOLD = 1.2

# ====== Khởi tạo mô hình chống giả mạo ======
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# ====== Load FAISS index ======
print("📂 Đang tải FAISS index và student_ids...")
index = faiss.read_index(FAISS_PATH)
with open(IDS_PATH, "rb") as f:
    student_ids = pickle.load(f)
print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# ====== Khởi tạo InsightFace ======
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ====== Hàm chống giả mạo ======
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

# ====== Nhận diện khuôn mặt ======
def recognize_face(face_embedding):
    embedding = face_embedding.astype(np.float32).reshape(1, -1)
    embedding /= np.linalg.norm(embedding)
    D, I = index.search(embedding, 1)
    distance = float(D[0][0])
    idx = int(I[0][0])
    if distance < FAISS_THRESHOLD:
        return student_ids[idx], distance
    return "Unknown", distance

# ====== Vẽ nhãn lên khung hình ======
def draw_label(frame, bbox, label_text, color):
    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
    cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# ====== Mở webcam ======
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Không mở được webcam.")
    exit()

print("📷 Nhận diện realtime (ấn 'q' để thoát)")

# ====== Biến thống kê ======
frame_count = 0
face_count = 0
total_elapsed_time = 0.0
total_face_time = 0.0
last_spoof_check = 0
spoof_result = None

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

        # Anti-spoofing mỗi 2 giây
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
        else:
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)

        draw_label(frame, bbox, label_text, color)

        face_time = time.perf_counter() - face_start_time
        total_face_time += face_time

    # Đếm khung hình
    frame_count += 1
    elapsed = time.perf_counter() - frame_start_time
    total_elapsed_time += elapsed

    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ====== Giải phóng ======
cap.release()
cv2.destroyAllWindows()

# ====== Thống kê kết quả ======
print("\n===== THỐNG KÊ HIỆU SUẤT =====")
print(f"Tổng số khung hình:        {frame_count}")
print(f"Tổng số khuôn mặt:         {face_count}")
print(f"Thời gian chạy (giây):     {total_elapsed_time:.2f}s")
print(f"FPS trung bình:            {frame_count / total_elapsed_time:.2f}")
print(f"Thời gian trung bình/face: {total_face_time / face_count:.4f} giây (nếu có face)")
