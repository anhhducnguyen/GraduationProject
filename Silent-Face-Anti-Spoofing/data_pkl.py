# import os
# import pickle
# import face_recognition

# def load_known_faces(main_dir, output_pkl="known_faces.pkl"):
#     """
#     Tải dữ liệu khuôn mặt từ thư mục và lưu vào file .pkl.
    
#     Args:
#         main_dir (str): Đường dẫn tới thư mục chứa các thư mục con.
#         output_pkl (str): Tên file pickle để lưu dữ liệu.
#     """
#     known_faces = {}

#     for subdir in os.listdir(main_dir):
#         subdir_path = os.path.join(main_dir, subdir)
#         if os.path.isdir(subdir_path):  # Chỉ xử lý thư mục
#             embeddings = []  # Danh sách lưu tất cả embeddings của người này

#             for filename in os.listdir(subdir_path):
#                 if filename.endswith(('.jpg', '.jpeg', '.png')):
#                     image_path = os.path.join(subdir_path, filename)
#                     image = face_recognition.load_image_file(image_path)
#                     face_encodings = face_recognition.face_encodings(image)
                    
#                     if face_encodings:  # Nếu tìm thấy khuôn mặt
#                         embeddings.append(face_encodings[0])  # Giữ dạng numpy array

#             if embeddings:  # Chỉ lưu nếu có ít nhất một encoding
#                 known_faces[subdir] = embeddings

#     with open(output_pkl, "wb") as f:
#         pickle.dump(known_faces, f)
    
#     print(f"Dữ liệu đã được lưu vào {output_pkl}")

# load_known_faces("known_faces")


# import os
# import pickle
# import face_recognition

# def load_known_faces(main_dir, output_pkl="known_faces.pkl"):
#     """
#     Tải dữ liệu khuôn mặt từ thư mục và lưu vào file .pkl.
    
#     Args:
#         main_dir (str): Đường dẫn tới thư mục chứa các thư mục con.
#         output_pkl (str): Tên file pickle để lưu dữ liệu.
#     """
#     known_faces = {}

#     for subdir in os.listdir(main_dir):
#         subdir_path = os.path.join(main_dir, subdir)
#         if os.path.isdir(subdir_path):  # Chỉ xử lý thư mục
#             embeddings = []  # Danh sách lưu tất cả embeddings của người này

#             for filename in os.listdir(subdir_path):
#                 if filename.endswith(('.jpg', '.jpeg', '.png')):
#                     image_path = os.path.join(subdir_path, filename)
#                     image = face_recognition.load_image_file(image_path)
#                     face_encodings = face_recognition.face_encodings(image)
                    
#                     if face_encodings:  # Nếu tìm thấy khuôn mặt
#                         embeddings.append(face_encodings[0])  # Giữ dạng numpy array

#             if embeddings:  # Chỉ lưu nếu có ít nhất một encoding
#                 known_faces[subdir] = embeddings

#     with open(output_pkl, "wb") as f:
#         pickle.dump(known_faces, f)
    
#     print(f"Dữ liệu đã được lưu vào {output_pkl}")

# load_known_faces("imgs")

import os
import pickle
import face_recognition
from multiprocessing import Pool, cpu_count


def process_person_folder(args):
    person_name, subdir_path = args
    embeddings = []

    for filename in os.listdir(subdir_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            image_path = os.path.join(subdir_path, filename)
            try:
                image = face_recognition.load_image_file(image_path)
                face_encodings = face_recognition.face_encodings(image)
                if face_encodings:
                    embeddings.append(face_encodings[0])
            except Exception as e:
                print(f"Lỗi khi xử lý {image_path}: {e}")

    return (person_name, embeddings) if embeddings else None


def load_known_faces_parallel(main_dir, output_pkl="known_faces.pkl"):
    known_faces = {}

    # Tạo danh sách tuple (tên người, đường dẫn thư mục con)
    person_dirs = [
        (subdir, os.path.join(main_dir, subdir))
        for subdir in os.listdir(main_dir)
        if os.path.isdir(os.path.join(main_dir, subdir))
    ]

    with Pool(processes=cpu_count()) as pool:
        results = pool.map(process_person_folder, person_dirs)

    for result in results:
        if result:
            name, embeddings = result
            known_faces[name] = embeddings

    with open(output_pkl, "wb") as f:
        pickle.dump(known_faces, f)

    print(f"✅ Đã lưu dữ liệu vào {output_pkl}")


# Chạy
load_known_faces_parallel("imgs")
