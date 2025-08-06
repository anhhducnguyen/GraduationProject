# # # -*- coding: utf-8 -*-
# # import cv2
# # import numpy as np
# # import time
# # import os
# # import json
# # import pickle
# # import warnings
# # import psycopg2

# # from sklearn.metrics.pairwise import cosine_similarity
# # from insightface.app import FaceAnalysis

# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name

# # warnings.filterwarnings('ignore')

# # # ====== Cấu hình ======
# # image_path = "ducanh.jpg"  # Thay ảnh đầu vào
# # model_dir = "./resources/anti_spoof_models"
# # model_name = "2.7_80x80_MiniFASNetV2.pth"
# # device_id = 0  # CPU

# # # ====== Load model ======
# # model_test = AntiSpoofPredict(device_id)
# # image_cropper = CropImage()

# # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # app.prepare(ctx_id=0, det_size=(320, 320))

# # # ====== Load embeddings ======
# # pkl_path = "face_embeddings.pkl"
# # if os.path.exists(pkl_path):
# #     with open(pkl_path, "rb") as f:
# #         rows = pickle.load(f)
# #     print("✅ Loaded embeddings from face_embeddings.pkl")
# # else:
# #     print("🔄 Loading embeddings from PostgreSQL...")
# #     conn = psycopg2.connect(
# #         dbname="defaultdb",
# #         user="avnadmin",
# #         password="AVNS_X7Gv-gc_chVFAaKGrLZ",
# #         host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
# #         port=10848,
# #         sslmode="require"
# #     )
# #     cursor = conn.cursor()
# #     cursor.execute("SELECT student_id, embedding FROM student_face_embeddings_512")
# #     rows = cursor.fetchall()
# #     with open(pkl_path, "wb") as f:
# #         pickle.dump(rows, f)
# #     cursor.close()
# #     conn.close()
# #     print("✅ Saved embeddings to face_embeddings.pkl")

# # student_ids = []
# # embedding_list = []
# # for student_id, emb_str in rows:
# #     student_ids.append(student_id)
# #     embedding_list.append(json.loads(emb_str))
# # embedding_matrix = np.array(embedding_list, dtype=np.float32)

# # # ====== Đọc ảnh ======
# # start_total = time.perf_counter()
# # frame = cv2.imread(image_path)
# # if frame is None:
# #     print(f"❌ Không thể đọc ảnh: {image_path}")
# #     exit()

# # print(f"\n🖼️ Phân tích ảnh: {image_path}")

# # # ----------- Anti-Spoofing -----------
# # start_anti = time.perf_counter()
# # image_bboxes = model_test.get_bboxes(frame)
# # if not image_bboxes:
# #     print("⚠️ Không phát hiện khuôn mặt.")
# #     exit()

# # image_bbox = image_bboxes[0]
# # h_input, w_input, model_type, scale = parse_model_name(model_name)

# # param = {
# #     "org_img": frame,
# #     "bbox": image_bbox,
# #     "scale": scale,
# #     "out_w": w_input,
# #     "out_h": h_input,
# #     "crop": True,
# # }
# # if scale is None:
# #     param["crop"] = False

# # img = image_cropper.crop(**param)

# # start_predict = time.perf_counter()
# # prediction = model_test.predict(img, os.path.join(model_dir, model_name))
# # end_predict = time.perf_counter()

# # label = np.argmax(prediction)
# # value = prediction[0][label] / 2
# # end_anti = time.perf_counter()

# # if label != 1:
# #     print(f"❌ Spoofing Detected! Fake Face Score: {value:.2f}")
# # else:
# #     print(f"✅ Real Face Detected! Score: {value:.2f}")

# #     # ----------- Face Recognition -----------
# #     start_recog = time.perf_counter()
# #     faces = app.get(frame)
# #     if len(faces) == 0:
# #         print("⚠️ Không tìm thấy khuôn mặt cho nhận diện.")
# #     else:
# #         for i, face in enumerate(faces):
# #             bbox = face.bbox.astype(int)
# #             unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)

# #             start_sim = time.perf_counter()
# #             sims = cosine_similarity(unknown_embedding, embedding_matrix)[0]
# #             best_idx = np.argmax(sims)
# #             best_score = sims[best_idx]
# #             end_sim = time.perf_counter()

# #             identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"

# #             print(f"[Face {i+1}] Identity: {identity}")
# #             print(f" - Similarity Score: {best_score:.4f}")
# #             print(f" - BBox: {bbox.tolist()}")
# #             print(f" - ⏱️ Tính similarity: {(end_sim - start_sim):.4f}s")
# #     end_recog = time.perf_counter()

# # end_total = time.perf_counter()

# # # ====== In thống kê thời gian ======
# # print("\n⏱️ Tổng thời gian xử lý toàn bộ:", f"{end_total - start_total:.3f}s")
# # print(f"⏱️  Anti-Spoofing tổng:        {(end_anti - start_anti):.3f}s")
# # print(f"⏱️    └─ Crop ảnh:             {(start_predict - start_anti):.3f}s")
# # print(f"⏱️    └─ Dự đoán spoof:        {(end_predict - start_predict):.3f}s")
# # if label == 1:
# #     print(f"⏱️  Face Recognition:          {(end_recog - start_recog):.3f}s")

# # import os
# # import cv2
# # import time
# # import json
# # import pickle
# # import threading
# # import numpy as np
# # from queue import Queue
# # from sklearn.metrics.pairwise import cosine_similarity
# # from insightface.app import FaceAnalysis

# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name

# # # ========== Khởi tạo ==========
# # model_dir = "./resources/anti_spoof_models"
# # model_name = "2.7_80x80_MiniFASNetV2.pth"
# # image_cropper = CropImage()
# # model_test = AntiSpoofPredict(0)

# # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # app.prepare(ctx_id=0, det_size=(320, 320))

# # # ========== Load embeddings ==========
# # pkl_path = "face_embeddings.pkl"
# # if os.path.exists(pkl_path):
# #     with open(pkl_path, "rb") as f:
# #         rows = pickle.load(f)
# # else:
# #     raise FileNotFoundError("Không tìm thấy file embeddings.")

# # student_ids = []
# # embedding_list = []
# # for student_id, emb_str in rows:
# #     student_ids.append(student_id)
# #     embedding_list.append(json.loads(emb_str))
# # embedding_matrix = np.array(embedding_list, dtype=np.float32)

# # # ========== Queue ảnh để kiểm tra spoof ==========
# # spoof_queue = Queue()

# # # ========== Hàm kiểm tra spoof ==========
# # def check_spoof(image_path):
# #     frame = cv2.imread(image_path)
# #     if frame is None:
# #         print(f"❌ Không đọc được ảnh: {image_path}")
# #         return

# #     image_bboxes = model_test.get_bboxes(frame)
# #     if not image_bboxes:
# #         print(f"❌ Không phát hiện khuôn mặt trong ảnh: {image_path}")
# #         return

# #     image_bbox = image_bboxes[0]
# #     h_input, w_input, model_type, scale = parse_model_name(model_name)
# #     param = {
# #         "org_img": frame,
# #         "bbox": image_bbox,
# #         "scale": scale,
# #         "out_w": w_input,
# #         "out_h": h_input,
# #         "crop": True,
# #     }
# #     if scale is None:
# #         param["crop"] = False

# #     img = image_cropper.crop(**param)
# #     prediction = model_test.predict(img, os.path.join(model_dir, model_name))
# #     label = np.argmax(prediction)
# #     value = prediction[0][label] / 2

# #     if label == 1:
# #         print(f"✅ Real Face [{os.path.basename(image_path)}] - Score: {value:.2f}")
# #     else:
# #         print(f"❌ Fake Face [{os.path.basename(image_path)}] - Score: {value:.2f}")

# # # ========== Thread xử lý spoof ==========
# # def spoof_worker():
# #     while True:
# #         image_path = spoof_queue.get()
# #         check_spoof(image_path)
# #         spoof_queue.task_done()

# # threading.Thread(target=spoof_worker, daemon=True).start()

# # # ========== Luồng chính: nhận diện + lưu ảnh ==========
# # cap = cv2.VideoCapture(0)
# # os.makedirs("recognized", exist_ok=True)

# # print("📷 Đang chạy realtime nhận diện. Nhấn 'q' để thoát.")

# # # Biến đếm thời gian
# # prev_time = time.time()

# # while cap.isOpened():
# #     ret, frame = cap.read()
# #     if not ret:
# #         break

# #     # ==== Tính FPS ====
# #     current_time = time.time()
# #     fps = 1.0 / (current_time - prev_time)
# #     prev_time = current_time

# #     faces = app.get(frame)
# #     for face in faces:
# #         bbox = face.bbox.astype(int)
# #         embedding = face.embedding.astype(np.float32).reshape(1, -1)

# #         sims = cosine_similarity(embedding, embedding_matrix)[0]
# #         best_idx = np.argmax(sims)
# #         best_score = sims[best_idx]
# #         identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"

# #         label = f"{identity} ({best_score:.2f})"
# #         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
# #         cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX,
# #                     0.6, (0, 255, 0), 2)

# #         # Nếu nhận diện được người → lưu ảnh + gửi qua queue
# #         if identity != "Unknown":
# #             filename = f"recognized/{identity}_{int(time.time())}.jpg"
# #             cv2.imwrite(filename, frame)
# #             spoof_queue.put(filename)

# #     # ==== Hiển thị FPS trên góc trái ====
# #     cv2.putText(frame, f"FPS: {fps:.2f}", (10, 25),
# #                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

# #     cv2.imshow("Realtime Face Recognition", frame)
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break


# import os
# import cv2
# import time
# import json
# import pickle
# import threading
# import numpy as np
# import csv
# from datetime import datetime
# from queue import Queue
# from sklearn.metrics.pairwise import cosine_similarity
# from insightface.app import FaceAnalysis

# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name

# # ========== Khởi tạo ==========
# model_dir = "./resources/anti_spoof_models"
# model_name = "2.7_80x80_MiniFASNetV2.pth"
# image_cropper = CropImage()
# model_test = AntiSpoofPredict(0)

# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ========== Load embeddings ==========
# pkl_path = "face_embeddings.pkl"
# if os.path.exists(pkl_path):
#     with open(pkl_path, "rb") as f:
#         rows = pickle.load(f)
# else:
#     raise FileNotFoundError("Không tìm thấy file embeddings.")

# student_ids = []
# embedding_list = []
# for student_id, emb_str in rows:
#     student_ids.append(student_id)
#     embedding_list.append(json.loads(emb_str))
# embedding_matrix = np.array(embedding_list, dtype=np.float32)

# # ========== Queue ảnh để kiểm tra spoof ==========
# spoof_queue = Queue()

# # ========== Ghi log ==========
# os.makedirs("logs", exist_ok=True)
# log_file = "logs/recognition_log.csv"
# if not os.path.exists(log_file):
#     with open(log_file, "w", newline='', encoding="utf-8") as f:
#         writer = csv.writer(f)
#         writer.writerow(["Timestamp", "Identity", "Similarity", "FPS", "IsReal"])

# # ========== Hàm kiểm tra spoof ==========
# def check_spoof(image_path, log_info):
#     frame = cv2.imread(image_path)
#     if frame is None:
#         print(f"❌ Không đọc được ảnh: {image_path}")
#         return

#     image_bboxes = model_test.get_bboxes(frame)
#     if not image_bboxes:
#         print(f"❌ Không phát hiện khuôn mặt trong ảnh: {image_path}")
#         return

#     image_bbox = image_bboxes[0]
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
#     prediction = model_test.predict(img, os.path.join(model_dir, model_name))
#     label = np.argmax(prediction)
#     value = prediction[0][label] / 2

#     result = "Real" if label == 1 else "Fake"
#     print(f"{'✅' if result == 'Real' else '❌'} {result} Face [{os.path.basename(image_path)}] - Score: {value:.2f}")

#     # Ghi log kèm kết quả Real/Fake
#     with open(log_file, "a", newline='', encoding="utf-8") as f:
#         writer = csv.writer(f)
#         writer.writerow([*log_info, result])

# # ========== Thread xử lý spoof ==========
# def spoof_worker():
#     while True:
#         image_path, log_info = spoof_queue.get()
#         check_spoof(image_path, log_info)
#         spoof_queue.task_done()

# threading.Thread(target=spoof_worker, daemon=True).start()

# # ========== Luồng chính: nhận diện + lưu ảnh ==========
# cap = cv2.VideoCapture(0)
# os.makedirs("recognized", exist_ok=True)

# print("📷 Đang chạy realtime nhận diện. Nhấn 'q' để thoát.")

# prev_time = time.time()

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break

#     # ==== Tính FPS ====
#     current_time = time.time()
#     fps = 1.0 / (current_time - prev_time)
#     prev_time = current_time

#     faces = app.get(frame)
#     for face in faces:
#         bbox = face.bbox.astype(int)
#         embedding = face.embedding.astype(np.float32).reshape(1, -1)

#         sims = cosine_similarity(embedding, embedding_matrix)[0]
#         best_idx = np.argmax(sims)
#         best_score = sims[best_idx]
#         identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"

#         label = f"{identity} ({best_score:.2f})"
#         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
#         cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX,
#                     0.6, (0, 255, 0), 2)

#         # Nếu nhận diện được người → lưu ảnh + gửi qua queue kiểm tra spoof
#         if identity != "Unknown":
#             filename = f"recognized/{identity}_{int(time.time())}.jpg"
#             cv2.imwrite(filename, frame)
#             timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#             spoof_queue.put((filename, [timestamp, identity, f"{best_score:.4f}", f"{fps:.2f}"]))

#     # ==== Hiển thị FPS ====
#     cv2.putText(frame, f"FPS: {fps:.2f}", (10, 25),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Realtime Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv2.destroyAllWindows()


import os
import cv2
import time
import json
import pickle
import threading
import numpy as np
import csv
from datetime import datetime
from queue import Queue
from sklearn.metrics.pairwise import cosine_similarity
from insightface.app import FaceAnalysis

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

# ========== Khởi tạo ==========
model_dir = "./resources/anti_spoof_models"
model_name = "2.7_80x80_MiniFASNetV2.pth"
image_cropper = CropImage()
model_test = AntiSpoofPredict(0)

app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ========== Load embeddings ==========
pkl_path = "face_embeddings.pkl"
if os.path.exists(pkl_path):
    with open(pkl_path, "rb") as f:
        rows = pickle.load(f)
else:
    raise FileNotFoundError("Không tìm thấy file embeddings.")

student_ids = []
embedding_list = []
for student_id, emb_str in rows:
    student_ids.append(student_id)
    embedding_list.append(json.loads(emb_str))
embedding_matrix = np.array(embedding_list, dtype=np.float32)

# ========== Queue ảnh để kiểm tra spoof ==========
spoof_queue = Queue()

# ========== Ghi log ==========
os.makedirs("logs", exist_ok=True)
log_file = "logs/recognition_log.csv"
if not os.path.exists(log_file):
    with open(log_file, "w", newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Identity", "Similarity", "FPS", "IsReal"])

# ========== Hàm kiểm tra spoof ==========
def check_spoof(image_path, log_info):
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"❌ Không đọc được ảnh: {image_path}")
        return

    image_bboxes = model_test.get_bboxes(frame)
    if not image_bboxes:
        print(f"❌ Không phát hiện khuôn mặt trong ảnh: {image_path}")
        return

    for bbox in image_bboxes:
        h_input, w_input, model_type, scale = parse_model_name(model_name)
        param = {
            "org_img": frame,
            "bbox": bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }
        if scale is None:
            param["crop"] = False

        img = image_cropper.crop(**param)
        prediction = model_test.predict(img, os.path.join(model_dir, model_name))
        real_score = float(prediction[0][1])
        is_real = real_score > 0.85  # Ngưỡng xác định real/fake

        result = "Real" if is_real else "Fake"
        print(f"{'✅' if is_real else '❌'} {result} Face [{os.path.basename(image_path)}] - RealScore: {real_score:.2f}")

        with open(log_file, "a", newline='', encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([*log_info, result])

# ========== Thread xử lý spoof ==========
def spoof_worker():
    while True:
        image_path, log_info = spoof_queue.get()
        check_spoof(image_path, log_info)
        spoof_queue.task_done()

threading.Thread(target=spoof_worker, daemon=True).start()

# ========== Luồng chính: nhận diện + lưu ảnh ==========
cap = cv2.VideoCapture(0)
os.makedirs("recognized", exist_ok=True)

print("📷 Đang chạy realtime nhận diện. Nhấn 'q' để thoát.")

prev_time = time.time()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # ==== Tính FPS ====
    current_time = time.time()
    fps = 1.0 / (current_time - prev_time)
    prev_time = current_time

    faces = app.get(frame)
    for face in faces:
        bbox = face.bbox.astype(int)
        embedding = face.embedding.astype(np.float32).reshape(1, -1)

        sims = cosine_similarity(embedding, embedding_matrix)[0]
        best_idx = np.argmax(sims)
        best_score = sims[best_idx]
        identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"

        label = f"{identity} ({best_score:.2f})"
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (0, 255, 0), 2)

        # Nếu nhận diện được người → lưu ảnh khuôn mặt + gửi qua queue kiểm tra spoof
        if identity != "Unknown":
            face_img = frame[bbox[1]:bbox[3], bbox[0]:bbox[2]]
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S%f")
            filename = f"recognized/{identity}_{timestamp_str}.jpg"
            cv2.imwrite(filename, face_img)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            spoof_queue.put((filename, [timestamp, identity, f"{best_score:.4f}", f"{fps:.2f}"]))

    # ==== Hiển thị FPS ====
    cv2.putText(frame, f"FPS: {fps:.2f}", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Realtime Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
