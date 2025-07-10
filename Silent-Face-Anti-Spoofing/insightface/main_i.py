# import time
# import cv2
# import json
# import os
# import pickle
# import psycopg2
# import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
# from insightface.app import FaceAnalysis

# # 1. Khởi tạo mô hình
# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # 2. Load ảnh cần nhận diện
# unknown_img = cv2.imread("ducanh.jpg")

# start_time = time.perf_counter()
# unknown_faces = app.get(unknown_img)

# # 3. Load embedding từ file pkl hoặc từ PostgreSQL nếu chưa có
# pkl_path = "/face_embeddings.pkl"

# if os.path.exists(pkl_path):
#     with open(pkl_path, "rb") as f:
#         rows = pickle.load(f)
#     print("✅ Loaded embeddings from face_embeddings.pkl")
# else:
#     print("🔄 Loading embeddings from PostgreSQL...")
#     conn = psycopg2.connect(
#         dbname="defaultdb",
#         user="avnadmin",
#         password="AVNS_X7Gv-gc_chVFAaKGrLZ",
#         host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
#         port=10848,
#         sslmode="require"
#     )
#     cursor = conn.cursor()
#     cursor.execute("SELECT student_id, embedding FROM student_face_embeddings_512")
#     rows = cursor.fetchall()
#     with open(pkl_path, "wb") as f:
#         pickle.dump(rows, f)
#     print("✅ Saved embeddings to face_embeddings.pkl")
#     cursor.close()
#     conn.close()

# # 4. Chuyển toàn bộ embeddings sang numpy
# student_ids = []
# embedding_list = []

# for student_id, emb_str in rows:
#     student_ids.append(student_id)
#     embedding_list.append(json.loads(emb_str))

# embedding_matrix = np.array(embedding_list, dtype=np.float32)  # shape (N, 512)

# # 5. Nhận diện
# results = []

# for i, face in enumerate(unknown_faces):
#     face_start = time.perf_counter()
#     unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)

#     # Tính cosine similarity toàn bộ embedding 1 lần
#     sims = cosine_similarity(unknown_embedding, embedding_matrix)[0]
#     best_idx = np.argmax(sims)
#     best_score = sims[best_idx]
#     best_match = student_ids[best_idx] if best_score > 0.6 else "Unknown"

#     elapsed = time.perf_counter() - face_start
#     results.append([i + 1, best_match, f"{best_score:.2f}", f"{elapsed:.4f}s"])

# # 6. In bảng kết quả (không dùng tabulate)
# print("{:<6} {:<15} {:<12} {:<10}".format("Face#", "Identity", "Similarity", "Time"))
# print("-" * 50)
# for row in results:
#     print("{:<6} {:<15} {:<12} {:<10}".format(*row))

# # 7. Tổng thời gian xử lý
# end_time = time.perf_counter()
# print(f"\n⏱️ Tổng thời gian xử lý (Tối ưu hóa): {end_time - start_time:.4f}s")


import time
import cv2
import json
import os
import pickle
import psycopg2
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from insightface.app import FaceAnalysis

# 1. Khởi tạo mô hình nhận diện InsightFace
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# 2. Load embeddings từ file hoặc PostgreSQL
pkl_path = "face_embeddings.pkl"  # không dùng absolute path "/face_embeddings.pkl"

if os.path.exists(pkl_path):
    with open(pkl_path, "rb") as f:
        rows = pickle.load(f)
    print("✅ Loaded embeddings from face_embeddings.pkl")
else:
    print("🔄 Loading embeddings from PostgreSQL...")
    conn = psycopg2.connect(
        dbname="defaultdb",
        user="avnadmin",
        password="AVNS_X7Gv-gc_chVFAaKGrLZ",
        host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
        port=10848,
        sslmode="require"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT student_id, embedding FROM student_face_embeddings_512")
    rows = cursor.fetchall()
    with open(pkl_path, "wb") as f:
        pickle.dump(rows, f)
    print("✅ Saved embeddings to face_embeddings.pkl")
    cursor.close()
    conn.close()

# 3. Chuyển sang numpy để tối ưu tính toán
student_ids = []
embedding_list = []

for student_id, emb_str in rows:
    student_ids.append(student_id)
    embedding_list.append(json.loads(emb_str))

embedding_matrix = np.array(embedding_list, dtype=np.float32)  # shape (N, 512)

# 4. Mở webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Không mở được webcam.")
    exit()

print("📷 Đang chạy realtime... Nhấn 'q' để thoát.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Lỗi khi đọc webcam.")
        break

    start_time = time.perf_counter()
    faces = app.get(frame)

    for i, face in enumerate(faces):
        bbox = face.bbox.astype(int)
        unknown_embedding = face.embedding.astype(np.float32).reshape(1, -1)

        # So sánh cosine
        sims = cosine_similarity(unknown_embedding, embedding_matrix)[0]
        best_idx = np.argmax(sims)
        best_score = sims[best_idx]
        identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"

        # Hiển thị lên frame
        label = f"{identity} ({best_score:.2f})"
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (0, 255, 0), 2)

    # Hiển thị FPS
    elapsed = time.perf_counter() - start_time
    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 255, 255), 2)

    # Hiển thị khung hình
    cv2.imshow("Face Recognition Realtime", frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 5. Kết thúc
cap.release()
cv2.destroyAllWindows()

