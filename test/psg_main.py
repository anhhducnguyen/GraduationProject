# # # import os
# # # import cv2
# # # import numpy as np
# # # import time
# # # import threading
# # # import warnings
# # # import face_recognition
# # # import psycopg2
# # # import ast

# # # from src.anti_spoof_predict import AntiSpoofPredict, Detection
# # # from src.generate_patches import CropImage
# # # from src.utility import parse_model_name

# # # warnings.filterwarnings("ignore")

# # # FRAME_SKIP = 5
# # # API_URL = "http://192.168.1.4:5000/api/v1/exam-attendance/"
# # # last_sent_time = {}
# # # send_lock = threading.Lock()

# # # # ===== Load face encodings from PostgreSQL =====
# # # def load_known_faces_from_postgres():
# # #     conn = psycopg2.connect(
# # #         dbname="defaultdb",
# # #         user="avnadmin",
# # #         password="AVNS_X7Gv-gc_chVFAaKGrLZ",
# # #         host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
# # #         port=10848,
# # #         sslmode="require"
# # #     )
# # #     cursor = conn.cursor()
# # #     cursor.execute("SELECT student_id, embedding FROM face_embeddings")
# # #     rows = cursor.fetchall()

# # #     known_encodings = []
# # #     known_names = []

# # #     for student_id, embedding in rows:
# # #         # Convert from string to list if needed
# # #         if isinstance(embedding, str):
# # #             embedding = ast.literal_eval(embedding)
# # #         known_encodings.append(np.array(embedding))
# # #         known_names.append(student_id)

# # #     cursor.close()
# # #     conn.close()
# # #     return known_encodings, known_names


# # # class FaceSpoofingProcessor:
# # #     def __init__(self, model_dir, device_id, known_encodings, known_names):
# # #         self.model_dir = model_dir
# # #         self.device_id = device_id
# # #         self.known_encodings = known_encodings
# # #         self.known_names = known_names
# # #         self.model_test = AntiSpoofPredict(device_id)
# # #         self.image_cropper = CropImage()
# # #         self.detector = Detection()
# # #         self.frame_count = 0

# # #     def process_frame(self, frame):
# # #         self.frame_count += 1
# # #         if self.frame_count % FRAME_SKIP != 0:
# # #             return frame

# # #         image_bboxes = self.detector.get_bboxes(frame)

# # #         for i, image_bbox in enumerate(image_bboxes):
# # #             x, y, w, h = image_bbox
# # #             if x < 0 or y < 0 or w <= 0 or h <= 0:
# # #                 continue

# # #             face_image = frame[y:y + h, x:x + w]
# # #             if face_image.size == 0:
# # #                 continue

# # #             rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
# # #             encodings = face_recognition.face_encodings(rgb_face)
# # #             face_identity = "Unknown"
# # #             face_score = 0.0

# # #             if len(encodings) > 0:
# # #                 encoding = encodings[0]
# # #                 distances = face_recognition.face_distance(self.known_encodings, encoding)
# # #                 min_distance = np.min(distances)
# # #                 best_match_index = np.argmin(distances)

# # #                 if min_distance < 0.5:  # tolerance
# # #                     face_identity = self.known_names[best_match_index]
# # #                     face_score = 1 - min_distance

# # #             # Anti-spoofing
# # #             prediction = np.zeros((1, 3))
# # #             for model_name in os.listdir(self.model_dir):
# # #                 h_input, w_input, model_type, scale = parse_model_name(model_name)
# # #                 param = {
# # #                     "org_img": frame,
# # #                     "bbox": image_bbox,
# # #                     "scale": scale,
# # #                     "out_w": w_input,
# # #                     "out_h": h_input,
# # #                     "crop": scale is not None,
# # #                 }
# # #                 img = self.image_cropper.crop(**param)
# # #                 prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

# # #             label = np.argmax(prediction)
# # #             spoof_score = prediction[0][label] / 2

# # #             if label == 1:
# # #                 result_text = f"{face_identity} | RealFace: {face_score:.2f} | AntiSpoof: {spoof_score:.2f}"
# # #             else:
# # #                 result_text = f"{face_identity} | FAKE | Score: {spoof_score:.2f}"

# # #             print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

# # #         return frame


# # # # ===== MAIN LOOP =====
# # # if __name__ == "__main__":
# # #     model_dir = "./resources/anti_spoof_models"
# # #     device_id = 0
# # #     print("[INFO] Loading embeddings from PostgreSQL...")
# # #     known_encodings, known_names = load_known_faces_from_postgres()
# # #     print(f"[INFO] Loaded {len(known_encodings)} embeddings")

# # #     cap = cv2.VideoCapture(0)
# # #     processor = FaceSpoofingProcessor(model_dir, device_id, known_encodings, known_names)

# # #     while True:
# # #         ret, frame = cap.read()
# # #         if not ret:
# # #             break

# # #         frame = processor.process_frame(frame)
# # #         cv2.imshow("Face Spoofing Detection", frame)

# # #         if cv2.waitKey(1) & 0xFF == ord("q"):
# # #             break

# # #     cap.release()
# # #     cv2.destroyAllWindows()


# # # import os
# # # import cv2
# # # import numpy as np
# # # import time
# # # import threading
# # # import warnings
# # # import face_recognition
# # # import psycopg2

# # # from src.anti_spoof_predict import AntiSpoofPredict, Detection
# # # from src.generate_patches import CropImage
# # # from src.utility import parse_model_name

# # # warnings.filterwarnings("ignore")

# # # FRAME_SKIP = 5
# # # API_URL = "http://192.168.1.4:5000/api/v1/exam-attendance/"
# # # last_sent_time = {}
# # # send_lock = threading.Lock()

# # # # ===== Hàm truy vấn embedding gần nhất từ PostgreSQL =====
# # # def find_closest_embedding(encoding_vector):
# # #     conn = psycopg2.connect(
# # #         dbname="defaultdb",
# # #         user="avnadmin",
# # #         password="AVNS_X7Gv-gc_chVFAaKGrLZ",
# # #         host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
# # #         port=10848,
# # #         sslmode="require"
# # #     )
# # #     cursor = conn.cursor()

# # #     vector_str = "[" + ",".join([str(x) for x in encoding_vector]) + "]"

# # #     query = f"""
# # #         SELECT student_id, embedding <-> '{vector_str}'::vector AS distance
# # #         FROM face_embeddings
# # #         ORDER BY embedding <-> '{vector_str}'::vector
# # #         LIMIT 1;
# # #     """
# # #     cursor.execute(query)
# # #     result = cursor.fetchone()

# # #     cursor.close()
# # #     conn.close()

# # #     if result and result[1] < 0.5:  # Ngưỡng nhận diện
# # #         student_id, distance = result
# # #         return student_id, 1 - distance
# # #     else:
# # #         return "Unknown", 0.0


# # # # ===== Class xử lý khuôn mặt và chống giả mạo =====
# # # class FaceSpoofingProcessor:
# # #     def __init__(self, model_dir, device_id):
# # #         self.model_dir = model_dir
# # #         self.device_id = device_id
# # #         self.model_test = AntiSpoofPredict(device_id)
# # #         self.image_cropper = CropImage()
# # #         self.detector = Detection()
# # #         self.frame_count = 0

# # #     def process_frame(self, frame):
# # #         self.frame_count += 1
# # #         if self.frame_count % FRAME_SKIP != 0:
# # #             return frame

# # #         image_bboxes = self.detector.get_bboxes(frame)

# # #         for i, image_bbox in enumerate(image_bboxes):
# # #             x, y, w, h = image_bbox
# # #             if x < 0 or y < 0 or w <= 0 or h <= 0:
# # #                 continue

# # #             face_image = frame[y:y + h, x:x + w]
# # #             if face_image.size == 0:
# # #                 continue

# # #             rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
# # #             encodings = face_recognition.face_encodings(rgb_face)
# # #             face_identity = "Unknown"
# # #             face_score = 0.0

# # #             if len(encodings) > 0:
# # #                 encoding = encodings[0]
# # #                 face_identity, face_score = find_closest_embedding(encoding)

# # #             # Anti-spoofing
# # #             prediction = np.zeros((1, 3))
# # #             for model_name in os.listdir(self.model_dir):
# # #                 h_input, w_input, model_type, scale = parse_model_name(model_name)
# # #                 param = {
# # #                     "org_img": frame,
# # #                     "bbox": image_bbox,
# # #                     "scale": scale,
# # #                     "out_w": w_input,
# # #                     "out_h": h_input,
# # #                     "crop": scale is not None,
# # #                 }
# # #                 img = self.image_cropper.crop(**param)
# # #                 prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

# # #             label = np.argmax(prediction)
# # #             spoof_score = prediction[0][label] / 2

# # #             if label == 1:
# # #                 result_text = f"{face_identity} | RealFace: {face_score:.2f} | AntiSpoof: {spoof_score:.2f}"
# # #             else:
# # #                 result_text = f"{face_identity} | FAKE | Score: {spoof_score:.2f}"

# # #             print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

# # #         return frame


# # # # ===== MAIN LOOP =====
# # # if __name__ == "__main__":
# # #     model_dir = "./resources/anti_spoof_models"
# # #     device_id = 0

# # #     print("[INFO] Camera starting...")
# # #     cap = cv2.VideoCapture(0)
# # #     processor = FaceSpoofingProcessor(model_dir, device_id)

# # #     while True:
# # #         ret, frame = cap.read()
# # #         if not ret:
# # #             break

# # #         frame = processor.process_frame(frame)
# # #         cv2.imshow("Face Spoofing Detection", frame)

# # #         if cv2.waitKey(1) & 0xFF == ord("q"):
# # #             break

# # #     cap.release()
# # #     cv2.destroyAllWindows()


# # import os
# # import cv2
# # import numpy as np
# # import time
# # import threading
# # import warnings
# # import face_recognition
# # import psycopg2
# # import redis
# # import json
# # import hashlib

# # from src.anti_spoof_predict import AntiSpoofPredict, Detection
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name

# # warnings.filterwarnings("ignore")

# # # ====== CONFIG ======
# # FRAME_SKIP = 5
# # REDIS_HOST = "localhost"
# # REDIS_PORT = 6379
# # REDIS_DB = 0
# # REDIS_EXPIRE = 600  # seconds
# # DISTANCE_THRESHOLD = 0.5

# # # ====== REDIS CACHE INIT ======
# # redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

# # # ===== Query PostgreSQL Only If Cache Miss =====
# # def find_closest_embedding(encoding_vector):
# #     # Check Redis cache first
# #     key = "face:" + hashlib.md5(encoding_vector.tobytes()).hexdigest()
# #     cached = redis_client.get(key)
# #     if cached:
# #         data = json.loads(cached)
# #         return data["student_id"], data["score"]

# #     # Not found in Redis -> Query PostgreSQL
# #     conn = psycopg2.connect(
# #         dbname="defaultdb",
# #         user="avnadmin",
# #         password="AVNS_X7Gv-gc_chVFAaKGrLZ",
# #         host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
# #         port=10848,
# #         sslmode="require"
# #     )
# #     cursor = conn.cursor()

# #     vector_str = "[" + ",".join([str(x) for x in encoding_vector]) + "]"
# #     query = f"""
# #         SELECT student_id, embedding <-> '{vector_str}'::vector AS distance
# #         FROM face_embeddings
# #         ORDER BY embedding <-> '{vector_str}'::vector
# #         LIMIT 1;
# #     """
# #     cursor.execute(query)
# #     result = cursor.fetchone()

# #     cursor.close()
# #     conn.close()

# #     if result and result[1] < DISTANCE_THRESHOLD:
# #         student_id, distance = result
# #         score = 1 - distance
# #         redis_client.setex(key, REDIS_EXPIRE, json.dumps({"student_id": student_id, "score": score}))
# #         return student_id, score
# #     else:
# #         return "Unknown", 0.0

# # # ===== Face Processing & Anti-Spoofing =====
# # class FaceSpoofingProcessor:
# #     def __init__(self, model_dir, device_id):
# #         self.model_dir = model_dir
# #         self.device_id = device_id
# #         self.model_test = AntiSpoofPredict(device_id)
# #         self.image_cropper = CropImage()
# #         self.detector = Detection()
# #         self.frame_count = 0

# #     def process_frame(self, frame):
# #         self.frame_count += 1
# #         if self.frame_count % FRAME_SKIP != 0:
# #             return frame

# #         image_bboxes = self.detector.get_bboxes(frame)

# #         for i, image_bbox in enumerate(image_bboxes):
# #             x, y, w, h = image_bbox
# #             if x < 0 or y < 0 or w <= 0 or h <= 0:
# #                 continue

# #             face_image = frame[y:y + h, x:x + w]
# #             if face_image.size == 0:
# #                 continue

# #             rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
# #             encodings = face_recognition.face_encodings(rgb_face)
# #             face_identity = "Unknown"
# #             face_score = 0.0

# #             if len(encodings) > 0:
# #                 encoding = encodings[0]
# #                 face_identity, face_score = find_closest_embedding(encoding)

# #             prediction = np.zeros((1, 3))
# #             for model_name in os.listdir(self.model_dir):
# #                 h_input, w_input, model_type, scale = parse_model_name(model_name)
# #                 param = {
# #                     "org_img": frame,
# #                     "bbox": image_bbox,
# #                     "scale": scale,
# #                     "out_w": w_input,
# #                     "out_h": h_input,
# #                     "crop": scale is not None,
# #                 }
# #                 img = self.image_cropper.crop(**param)
# #                 prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

# #             label = np.argmax(prediction)
# #             spoof_score = prediction[0][label] / 2

# #             if label == 1:
# #                 result_text = f"{face_identity} | RealFace: {face_score:.2f} | AntiSpoof: {spoof_score:.2f}"
# #             else:
# #                 result_text = f"{face_identity} | FAKE | Score: {spoof_score:.2f}"

# #             print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

# #         return frame

# # # ===== MAIN LOOP =====
# # if __name__ == "__main__":
# #     model_dir = "./resources/anti_spoof_models"
# #     device_id = 0

# #     print("[INFO] Camera starting...")
# #     cap = cv2.VideoCapture(0)
# #     processor = FaceSpoofingProcessor(model_dir, device_id)

# #     while True:
# #         ret, frame = cap.read()
# #         if not ret:
# #             break

# #         frame = processor.process_frame(frame)
# #         cv2.imshow("Face Spoofing Detection", frame)

# #         if cv2.waitKey(1) & 0xFF == ord("q"):
# #             break

# #     cap.release()
# #     cv2.destroyAllWindows()

import os
import cv2
import numpy as np
import time
import warnings
import face_recognition
import psycopg2
import redis
import json
import hashlib

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings("ignore")

# ====== CONFIG ======
FRAME_SKIP = 5
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_EXPIRE = 600  # seconds
DISTANCE_THRESHOLD = 0.5

# ====== REDIS CACHE INIT ======
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

# ===== Query PostgreSQL Only If Cache Miss =====
def find_closest_embedding(encoding_vector):
    key = "face:" + hashlib.md5(encoding_vector.tobytes()).hexdigest()
    cached = redis_client.get(key)
    if cached:
        data = json.loads(cached)
        return data["student_id"], data["score"]

    conn = psycopg2.connect(
        dbname="defaultdb",
        user="avnadmin",
        password="AVNS_X7Gv-gc_chVFAaKGrLZ",
        host="pg-3daa1eb1-anhnguyen2k373-3703.e.aivencloud.com",
        port=10848,
        sslmode="require"
    )
    cursor = conn.cursor()

    vector_str = "[" + ",".join([str(x) for x in encoding_vector]) + "]"
    query = f"""
        SELECT student_id, embedding <-> '{vector_str}'::vector AS distance
        FROM face_embeddings
        ORDER BY embedding <-> '{vector_str}'::vector
        LIMIT 1;
    """
    cursor.execute(query)
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result and result[1] < DISTANCE_THRESHOLD:
        student_id, distance = result
        score = 1 - distance
        redis_client.setex(key, REDIS_EXPIRE, json.dumps({"student_id": student_id, "score": score}))
        return student_id, score
    else:
        return "Unknown", 0.0

# ===== Face Processing & Anti-Spoofing =====
class FaceSpoofingProcessor:
    def __init__(self, model_dir, device_id):
        self.model_dir = model_dir
        self.device_id = device_id
        self.model_test = AntiSpoofPredict(device_id)
        self.image_cropper = CropImage()
        self.detector = Detection()
        self.frame_count = 0
        self.time_logs = []

    def process_frame(self, frame):
        start_time = time.time()

        self.frame_count += 1
        if self.frame_count % FRAME_SKIP != 0:
            return frame

        image_bboxes = self.detector.get_bboxes(frame)

        for i, image_bbox in enumerate(image_bboxes):
            x, y, w, h = image_bbox
            if x < 0 or y < 0 or w <= 0 or h <= 0:
                continue

            face_image = frame[y:y + h, x:x + w]
            if face_image.size == 0:
                continue

            rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_face)
            face_identity = "Unknown"
            face_score = 0.0

            if len(encodings) > 0:
                encoding = encodings[0]
                face_identity, face_score = find_closest_embedding(encoding)

            prediction = np.zeros((1, 3))
            for model_name in os.listdir(self.model_dir):
                h_input, w_input, model_type, scale = parse_model_name(model_name)
                param = {
                    "org_img": frame,
                    "bbox": image_bbox,
                    "scale": scale,
                    "out_w": w_input,
                    "out_h": h_input,
                    "crop": scale is not None,
                }
                img = self.image_cropper.crop(**param)
                prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

            label = np.argmax(prediction)
            spoof_score = prediction[0][label] / 2

            if label == 1:
                result_text = f"{face_identity} | RealFace: {face_score:.2f} | AntiSpoof: {spoof_score:.2f}"
            else:
                result_text = f"{face_identity} | FAKE | Score: {spoof_score:.2f}"

            print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

        # === Thời gian xử lý ===
        end_time = time.time()
        duration = (end_time - start_time) * 1000
        self.time_logs.append(duration)
        print(f"[INFO] Frame processed in {duration:.2f} ms")

        if len(self.time_logs) >= 10:
            avg_time = sum(self.time_logs) / len(self.time_logs)
            fps = 1000 / avg_time
            print(f"[INFO] ⏱️ Avg time: {avg_time:.2f} ms | FPS ≈ {fps:.2f}")
            self.time_logs = []

        return frame

# ===== MAIN LOOP =====
if __name__ == "__main__":
    model_dir = "./resources/anti_spoof_models"
    device_id = 0

    print("[INFO] Camera starting...")
    cap = cv2.VideoCapture(0)
    processor = FaceSpoofingProcessor(model_dir, device_id)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = processor.process_frame(frame)
        cv2.imshow("Face Spoofing Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


# import cv2
# import numpy as np
# import time
# import os
# import warnings

# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# warnings.filterwarnings('ignore')

# def check_image(image):
#     height, width, _ = image.shape
#     return width / height == 3 / 4

# def process_frame(frame, model_test, image_cropper, model_dir):
#     prediction = np.zeros((1, 3))
#     image_bbox = model_test.get_bbox(frame)
    
#     for model_name in os.listdir(model_dir):
#         h_input, w_input, model_type, scale = parse_model_name(model_name)
#         param = {
#             "org_img": frame,
#             "bbox": image_bbox,
#             "scale": scale,
#             "out_w": w_input,
#             "out_h": h_input,
#             "crop": True,
#         }
#         if scale is None:
#             param["crop"] = False
#         img = image_cropper.crop(**param)

#         start = time.time()
#         prediction += model_test.predict(img, os.path.join(model_dir, model_name))
        
#     label = np.argmax(prediction)
#     value = prediction[0][label] / 2
    
#     if label == 1:
#         result_text = "Real Face: {:.2f}".format(value)
#         color = (0, 255, 0)
#     else:
#         result_text = "Fake Face: {:.2f}".format(value)
#         color = (0, 0, 255)
    
#     # Vẽ kết quả lên khung hình
#     cv2.rectangle(frame, (image_bbox[0], image_bbox[1]), 
#                   (image_bbox[0] + image_bbox[2], image_bbox[1] + image_bbox[3]), color, 2)
#     cv2.putText(frame, result_text, (image_bbox[0], image_bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#     return frame

# if __name__ == "__main__":
#     model_dir = "./resources/anti_spoof_models"
#     device_id = 0  # GPU ID
#     model_test = AntiSpoofPredict(device_id)
#     image_cropper = CropImage()

#     cap = cv2.VideoCapture(0)
    
#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break
        
#         frame = process_frame(frame, model_test, image_cropper, model_dir)
#         cv2.imshow("Anti-Spoofing Detection", frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
    
#     cap.release()
#     cv2.destroyAllWindows()