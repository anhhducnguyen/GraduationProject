# build_faiss_index.py
import psycopg2
import numpy as np
import json
import faiss
import pickle
import os

# 1. Kết nối PostgreSQL
conn = psycopg2.connect(
    dbname="defaultdb",
    user="avnadmin",
    password="AVNS_X7Gv-gc_chVFAaKGrLZ",
    host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
    port=10848,
    sslmode="require"
)
cursor = conn.cursor()

# 2. Truy vấn embedding
cursor.execute("SELECT student_id, embedding FROM student_face_embeddings_512")
rows = cursor.fetchall()
cursor.close()
conn.close()

# 3. Tạo danh sách student_ids và embedding vectors
student_ids = []
embeddings = []

for student_id, embedding_str in rows:
    emb = np.array(json.loads(embedding_str), dtype=np.float32)
    student_ids.append(student_id)
    embeddings.append(emb)

embeddings = np.array(embeddings, dtype=np.float32)
faiss.normalize_L2(embeddings)

# 4. Tạo và lưu FAISS index
index = faiss.IndexFlatIP(embeddings.shape[1])
index.add(embeddings)

os.makedirs("faiss_index", exist_ok=True)
faiss.write_index(index, "faiss_index/face_index.faiss")

with open("faiss_index/student_ids.pkl", "wb") as f:
    pickle.dump(student_ids, f)

print(f"FAISS index saved. Total vectors: {index.ntotal}")
