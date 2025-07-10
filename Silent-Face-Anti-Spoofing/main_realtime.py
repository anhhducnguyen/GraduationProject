import time
import cv2
import numpy as np
import faiss
import pickle
from insightface.app import FaceAnalysis

# ======= 1. Load FAISS index và student_ids =======
faiss_path = "faiss_index/face_index.faiss"
ids_path = "faiss_index/student_ids.pkl"

print("📂 Đang tải FAISS index và student_ids...")
index = faiss.read_index(faiss_path)

with open(ids_path, "rb") as f:
    student_ids = pickle.load(f)  # List[str] theo thứ tự embedding

print(f"✅ Đã load FAISS index ({index.ntotal} vectors)")

# ======= 2. Khởi tạo mô hình InsightFace =======
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ======= 3. Mở webcam =======
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

        # Chuẩn hóa
        unknown_embedding /= np.linalg.norm(unknown_embedding)

        # Truy vấn FAISS
        D, I = index.search(unknown_embedding, 1)  # top-1
        best_score = float(D[0][0])
        best_idx = int(I[0][0])

        identity = student_ids[best_idx] if best_score > 0.6 else "Unknown"
        label = f"{identity} ({best_score:.2f})"

        # Hiển thị nhãn
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, label, (bbox[0], bbox[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # FPS
    elapsed = time.perf_counter() - start_time
    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 255, 255), 2)

    cv2.imshow("Face Recognition (FAISS)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ======= 4. Kết thúc =======
cap.release()
cv2.destroyAllWindows()
