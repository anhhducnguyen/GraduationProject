import os
import cv2
import json
import psycopg2
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
from insightface.app import FaceAnalysis

# ========== Cấu hình DB ==========
conn = psycopg2.connect(
    dbname="defaultdb",
    user="avnadmin",
    password="AVNS_X7Gv-gc_chVFAaKGrLZ",
    host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
    port=10848,
    sslmode="require"
)
cursor = conn.cursor()

insert_query = """
    INSERT INTO student_face_embeddings_512 (student_id, embedding)
    VALUES (%s, %s::vector)
"""

# ========== Tạo model 1 lần ==========
app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0)

# ========== Hàm xử lý 1 thư mục ==========
def process_student_folder(folder_path):
    student_id = os.path.basename(folder_path)
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(folder_path, filename)
            img = cv2.imread(img_path)
            if img is None:
                continue

            faces = app.get(img)
            if not faces:
                continue

            embedding = faces[0].embedding.astype(np.float32)
            norm = np.linalg.norm(embedding)
            if norm == 0:
                continue
            normalized_embedding = embedding / norm
            vector_str = json.dumps(normalized_embedding.tolist())

            cursor.execute(insert_query, (student_id, vector_str))
            conn.commit()
            print(f"✅ {student_id} saved from {filename}")
            return 1  # Thành công

    print(f"⚠️ {student_id} không có ảnh hợp lệ.")
    return 0  # Thất bại

# ========== Chạy song song ==========
ROOT_FOLDER = "E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/know_face"  # Thay bằng đường dẫn của bạn
folders = [os.path.join(ROOT_FOLDER, d) for d in os.listdir(ROOT_FOLDER)
           if os.path.isdir(os.path.join(ROOT_FOLDER, d))]

total_success = 0
with ThreadPoolExecutor(max_workers=8) as executor:  # Sửa số luồng nếu CPU bạn mạnh hơn
    futures = {executor.submit(process_student_folder, folder): folder for folder in folders}
    for future in as_completed(futures):
        total_success += future.result()

print(f"\n🎉 Đã xử lý xong {total_success}/{len(folders)} sinh viên thành công.")

cursor.close()
conn.close()
