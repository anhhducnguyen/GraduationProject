"""
Mục đích: 
    - Duyệt qua tất cả thư mục con (mỗi thư mục ứng với 1 sinh viên).
    - Với mỗi thư mục, đọc ảnh, trích xuất embedding khuôn mặt bằng InsightFace.
    - Chuẩn hóa embedding, lưu vào bảng PostgreSQL.

Yêu cầu:
    - Cài insightface, psycopg2, opencv-python, numpy.
    - PostgreSQL có cột embedding kiểu vector (pgvector extension).
"""

import os
import cv2
import json
import psycopg2
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
from insightface.app import FaceAnalysis

"""
1. Cấu hình kết nối tới PostgreSQL
   - dbname, user, password, host, port cần thay theo thông tin của bạn.
   - sslmode='require' để đảm bảo kết nối bảo mật.
"""
conn = psycopg2.connect(
    dbname="defaultdb",
    user="avnadmin",
    password="AVNS_X7Gv-gc_chVFAaKGrLZ",
    host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
    port=10848,
    sslmode="require"
)
cursor = conn.cursor()

"""
2. Câu lệnh INSERT:
   - student_id: mã sinh viên (lấy từ tên thư mục).
   - embedding: vector (dưới dạng JSON) được chuyển thành kiểu vector của PostgreSQL.
"""
insert_query = """
    INSERT INTO student_face_embeddings_512 (student_id, embedding)
    VALUES (%s, %s::vector)
"""

"""
3. Tạo model InsightFace 1 lần
   - name='buffalo_sc': model nhận diện khuôn mặt nhanh và chính xác.
   - providers=['CPUExecutionProvider']: chạy trên CPU.
"""
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0)

"""
4. Hàm xử lý 1 thư mục sinh viên:
   - folder_path: đường dẫn đến thư mục chứa ảnh của 1 sinh viên.
   - Lấy student_id từ tên thư mục.
   - Duyệt từng ảnh, đọc bằng OpenCV, phát hiện khuôn mặt.
   - Nếu có khuôn mặt, trích xuất embedding, chuẩn hóa (L2 norm = 1).
   - Chuyển thành list rồi JSON để lưu vào DB.
   - Commit ngay sau mỗi INSERT để tránh mất dữ liệu nếu bị lỗi.
"""
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

            # Lấy embedding đầu tiên (giả sử mỗi ảnh chỉ có 1 khuôn mặt)
            embedding = faces[0].embedding.astype(np.float32)

            # Chuẩn hóa vector
            norm = np.linalg.norm(embedding)
            if norm == 0:
                continue
            normalized_embedding = embedding / norm

            # Chuyển thành JSON string để lưu
            vector_str = json.dumps(normalized_embedding.tolist())

            # Lưu vào DB
            cursor.execute(insert_query, (student_id, vector_str))
            conn.commit()

            print(f"{student_id} saved from {filename}")
            return 1  # Thành công, chỉ cần 1 ảnh mẫu là đủ

    print(f"{student_id} no valid photo.")
    return 0  # Không tìm thấy ảnh hợp lệ

"""
5. Chạy song song để tăng tốc:
   - ROOT_FOLDER: thư mục chứa tất cả các thư mục sinh viên.
   - Mỗi thư mục con là 1 student_id.
   - Sử dụng ThreadPoolExecutor để xử lý nhiều thư mục cùng lúc.
"""
ROOT_FOLDER = "E:/do_an_end/auth-service/Silent-Face-Anti-Spoofing/images/K15-CNTT4"
folders = [
    os.path.join(ROOT_FOLDER, d)
    for d in os.listdir(ROOT_FOLDER)
    if os.path.isdir(os.path.join(ROOT_FOLDER, d))
]

total_success = 0
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(process_student_folder, folder): folder for folder in folders}
    for future in as_completed(futures):
        total_success += future.result()

print(f"\nProcessed {total_success}/{len(folders)} students successfully.")

"""
6. Đóng kết nối DB
"""
cursor.close()
conn.close()
