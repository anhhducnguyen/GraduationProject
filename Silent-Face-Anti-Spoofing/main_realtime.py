# # import time
# # import cv2
# # import numpy as np
# # import faiss
# # import pickle
# # from insightface.app import FaceAnalysis

# # # ======= 1. Load FAISS index và student_ids =======
# # faiss_path = "faiss_index/face_index.faiss"
# # ids_path = "faiss_index/student_ids.pkl"

# # print("📂 Đang tải FAISS index và student_ids...")
# # index = faiss.read_index(faiss_path)

# # with open(ids_path, "rb") as f:
# #     student_ids = pickle.load(f)  # List[str] theo thứ tự embedding

# # print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # # ======= 2. Khởi tạo mô hình InsightFace =======
# # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # app.prepare(ctx_id=0, det_size=(320, 320))

# # # ======= 3. Mở webcam =======
# # cap = cv2.VideoCapture(0)
# # if not cap.isOpened():
# #     print("❌ Không mở được webcam.")
# #     exit()

# # print("📷 Đang chạy realtime nhận diện... Nhấn 'q' để thoát.")

# # while True:
# #     ret, frame = cap.read()
# #     if not ret:
# #         print("⚠️ Lỗi khi đọc webcam.")
# #         break

# #     start_time = time.perf_counter()
# #     faces = app.get(frame)

# #     for face in faces:
# #         bbox = face.bbox.astype(int)
# #         unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)

# #         # Chuẩn hóa
# #         unknown_embedding /= np.linalg.norm(unknown_embedding)

# #         # Truy vấn FAISS
# #         D, I = index.search(unknown_embedding, 1)  # top-1
# #         best_score = float(D[0][0])
# #         best_idx = int(I[0][0])

# #         identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"
# #         label = f"{identity} ({best_score:.2f})"

# #         # Hiển thị nhãn
# #         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
# #         cv2.putText(frame, label, (bbox[0], bbox[1] - 10),
# #                     cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

# #     # FPS
# #     elapsed = time.perf_counter() - start_time
# #     fps = f"FPS: {1 / elapsed:.2f}"
# #     cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
# #                 0.7, (0, 255, 255), 2)

# #     cv2.imshow("Face Recognition (FAISS)", frame)
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # # ======= 4. Kết thúc =======
# # cap.release()
# # cv2.destroyAllWindows()


# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import requests
# from datetime import datetime
# from insightface.app import FaceAnalysis

# API_URL = "https://graduationproject-nx7m.onrender.com/api/v1/exam-attendance/"

# # ======= 1. Load FAISS index và student_ids =======
# faiss_path = "faiss_index/face_index.faiss"
# ids_path = "faiss_index/student_ids.pkl"

# print("📂 Đang tải FAISS index và student_ids...")
# index = faiss.read_index(faiss_path)

# with open(ids_path, "rb") as f:
#     student_ids = pickle.load(f)  # List[str] theo thứ tự embedding

# print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# # ======= 2. Khởi tạo mô hình InsightFace =======
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ======= 3. Mở webcam =======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("❌ Không mở được webcam.")
#     exit()

# print("📷 Đang chạy realtime nhận diện... Nhấn 'q' để thoát.")

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("⚠️ Lỗi khi đọc webcam.")
#         break

#     start_time = time.perf_counter()
#     faces = app.get(frame)

#     for face in faces:
#         bbox = face.bbox.astype(int)
#         unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)

#         # Chuẩn hóa
#         unknown_embedding /= np.linalg.norm(unknown_embedding)

#         # Truy vấn FAISS
#         D, I = index.search(unknown_embedding, 1)  # top-1
#         best_score = float(D[0][0])
#         best_idx = int(I[0][0])

#         identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"
#         label_text = f"{identity} ({best_score:.2f})"

#         # Hiển thị nhãn
#         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
#         cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

#         # ======= 4. Gửi thông tin về server =======
#         timestamp = datetime.now().isoformat()

#         payload = {
#             "name": identity,
#             "confidence": round(best_score, 2),
#             "real_face": 1.0,  # Giả sử chưa anti-spoofing thì mặc định là real
#             "timestamp": timestamp
#         }

#         try:
#             response = requests.post(API_URL, json=payload)
#             if response.status_code == 200 or response.status_code == 201:
#                 print(f"Data sent to {identity}")
#             else:
#                 print(f"Send failed: {response.status_code} - {response.text}")
#         except Exception as e:
#             print(f"Error sending request: {e}")

#     # FPS
#     elapsed = time.perf_counter() - start_time
#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
#                 0.7, (0, 255, 255), 2)

#     cv2.imshow("Face Recognition (FAISS)", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ======= 5. Kết thúc =======
# cap.release()
# cv2.destroyAllWindows()

import time
import cv2
import numpy as np
import faiss
import pickle
import requests
import threading
from datetime import datetime
from insightface.app import FaceAnalysis

API_URL = "https://graduationproject-nx7m.onrender.com/api/v1/exam-attendance/"

# ======= 1. Load FAISS index và student_ids =======
faiss_path = "faiss_index/face_index.faiss"
ids_path = "faiss_index/student_ids.pkl"

print("📂 Đang tải FAISS index và student_ids...")
index = faiss.read_index(faiss_path)

with open(ids_path, "rb") as f:
    student_ids = pickle.load(f)

print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# ======= 2. Khởi tạo mô hình InsightFace =======
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ======= 3. Buffer + Thread gửi dữ liệu tuần tự =======
send_buffer = []
send_lock = threading.Lock()
send_interval = 3  # giây giữa mỗi lần quét buffer

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
                    print(f"✅ Sent: {record['name']} at {record['timestamp']}")
                else:
                    print(f"❌ Send failed: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"⚠️ Error sending record: {e}")

# Khởi động thread gửi dữ liệu
threading.Thread(target=send_data_batch, daemon=True).start()

# ======= 4. Mở webcam =======
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Không mở được webcam.")
    exit()

print("📷 Đang chạy realtime nhận diện... Nhấn 'q' để thoát.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Lỗi khi đọc webcam.")
        break

    start_time = time.perf_counter()
    faces = app.get(frame)

    for face in faces:
        bbox = face.bbox.astype(int)
        unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)
        unknown_embedding /= np.linalg.norm(unknown_embedding)

        D, I = index.search(unknown_embedding, 1)
        best_score = float(D[0][0])
        best_idx = int(I[0][0])

        identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"
        label_text = f"{identity} ({best_score:.2f})"

        # Vẽ khung và tên
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Nếu xác định được danh tính, thêm vào buffer
        if identity != "Unknown":
            payload = {
                "name": identity,
                "confidence": round(best_score, 2),
                "real_face": 1.0,
                "timestamp": datetime.now().isoformat()
            }

            with send_lock:
                send_buffer.append(payload)

    # Tính FPS
    elapsed = time.perf_counter() - start_time
    fps_text = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 255, 255), 2)

    cv2.imshow("Face Recognition (FAISS)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ======= 5. Giải phóng tài nguyên =======
cap.release()
cv2.destroyAllWindows()
