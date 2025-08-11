import os
import psycopg2
from pgvector.psycopg2 import register_vector
from pgvector import Vector  # ✅ chính xác ở bản mới

import face_recognition


# Cấu hình kết nối
conn = psycopg2.connect(
    dbname="defaultdb",
    user="avnadmin",
    password="AVNS_X7Gv-gc_chVFAaKGrLZ",
    host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
    port=10848,
    sslmode="require"
)
register_vector(conn)
cur = conn.cursor()

def save_to_postgres(student_id, vector):
    # Lưu từng vector riêng biệt
    cur.execute("""
        INSERT INTO face_embeddings (student_id, embedding)
        VALUES (%s, %s)
    """, (student_id, Vector(vector)))

def load_known_faces_and_store(main_dir):
    for subdir in os.listdir(main_dir):
        subdir_path = os.path.join(main_dir, subdir)
        if os.path.isdir(subdir_path):
            for filename in os.listdir(subdir_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    image_path = os.path.join(subdir_path, filename)
                    image = face_recognition.load_image_file(image_path)
                    face_encodings = face_recognition.face_encodings(image)
                    
                    if face_encodings:
                        save_to_postgres(subdir, face_encodings[0])
                        print(f"Đã lưu vector cho {subdir} - {filename}")

    conn.commit()
    print("✅ Hoàn tất lưu toàn bộ dữ liệu vào PostgreSQL.")

# Gọi hàm
load_known_faces_and_store("know_face")

# Đóng kết nối
cur.close()
conn.close()
