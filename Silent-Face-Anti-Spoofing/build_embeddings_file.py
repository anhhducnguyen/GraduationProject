# build_embeddings_file.py
import psycopg2
import numpy as np
import json
import pickle
import os
from dotenv import load_dotenv

"""
1. KẾT NỐI CƠ SỞ DỮ LIỆU POSTGRESQL
-----------------------------------
- Sử dụng psycopg2 để kết nối đến database PostgreSQL trên Aiven (hoặc server khác).
- Thông tin kết nối gồm: dbname, user, password, host, port, sslmode.
- sslmode="require" để bắt buộc kết nối an toàn (SSL).
"""
load_dotenv()

# PostgreSQL (ưu điểm)

# Có pgvector – lưu trữ và tìm kiếm vector native.
# Có index vector (IVFFlat, HNSW) → truy vấn top-k nhanh.
# Tích hợp tốt với AI/ML – được cộng đồng AI khuyến nghị.

# MySQL (nhược điểm)

# Không có kiểu dữ liệu vector → phải lưu JSON/BLOB.
# Không có index vector → tìm kiếm chậm khi dữ liệu lớn.
# Không hỗ trợ phép đo khoảng cách vector → phải xử lý ở ứng dụng.

conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    sslmode=os.getenv("DB_SSLMODE")
)
cursor = conn.cursor()

"""
2. TRUY VẤN DỮ LIỆU EMBEDDING TỪ DATABASE
-----------------------------------------
- Lấy ra cột student_id và embedding (lưu dưới dạng chuỗi JSON trong DB).
- Bảng: student_face_embeddings_512
"""
cursor.execute("SELECT student_id, embedding FROM student_face_embeddings_512")
rows = cursor.fetchall()
cursor.close()
conn.close()

"""
3. CHUYỂN ĐỔI DỮ LIỆU SANG DẠNG NUMPY ARRAY
-------------------------------------------
- student_ids: danh sách ID sinh viên.
- embeddings: danh sách vector embedding (mỗi vector là 512 chiều, kiểu float32).
- json.loads(): chuyển chuỗi JSON trong DB thành list Python.
- np.array(..., dtype=np.float32): đảm bảo dữ liệu ở dạng float32 để tiết kiệm RAM và tăng tốc xử lý.
"""
student_ids = []
embeddings = []

for student_id, embedding_str in rows:
    emb = np.array(json.loads(embedding_str), dtype=np.float32)
    student_ids.append(student_id)
    embeddings.append(emb)

embeddings = np.array(embeddings, dtype=np.float32)

"""
4. CHUẨN HÓA VECTOR EMBEDDING
------------------------------
- Chuẩn hóa từng vector embedding về độ dài 1 (unit vector).
- Giúp tính cosine similarity chính xác và đồng nhất.
"""
embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

"""
5. LƯU DỮ LIỆU RA FILE PICKLE
------------------------------
- Thư mục 'embeddings' sẽ chứa file embeddings.pkl.
- File pickle chứa dictionary gồm:
  + 'student_ids': danh sách ID sinh viên.
  + 'embeddings': mảng numpy chứa vector embedding đã chuẩn hóa.
- Dùng pickle.dump() để lưu dữ liệu dạng nhị phân, giúp load nhanh hơn JSON.
"""
os.makedirs("embeddings", exist_ok=True)
with open("embeddings/embeddings.pkl", "wb") as f:
    pickle.dump({
        "student_ids": student_ids,
        "embeddings": embeddings
    }, f)

print(f"Embeddings file saved: embeddings/embeddings.pkl ({len(student_ids)} vectors)")
