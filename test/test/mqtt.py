# import time
# import cv2
# import numpy as np
# import faiss
# import pickle
# import os
# import warnings
# import requests
# import threading
# import cloudinary
# import cloudinary.uploader
# import queue
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# # ====== Thêm vào phần đầu ======
# import paho.mqtt.client as mqtt
# import json

# warnings.filterwarnings('ignore')

# # ====== Cloudinary config ======
# cloudinary.config(
#     cloud_name="dvc80qdie",
#     api_key="221435714784277",
#     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
#     secure=True
# )

# # MQTT_BROKER = "localhost"  # hoặc IP broker nếu dùng máy khác
# # MQTT_PORT = 1883
# # MQTT_TOPIC = "exam/attendance"
# MQTT_BROKER = "broker.hivemq.com"
# MQTT_PORT = 1883
# MQTT_TOPIC = "exam/attendance"


# mqtt_client = mqtt.Client()
# mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# # ====== Config ======
# MODEL_DIR = "./resources/anti_spoof_models"
# MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# DEVICE_ID = 0
# FAISS_PATH = "faiss_index/face_index.faiss"
# IDS_PATH = "faiss_index/student_ids.pkl"
# FAISS_THRESHOLD = 1.2
# API_URL = "http://localhost:5000/api/v1/exam-attendance/"


# # ====== Init models ======
# model_test = AntiSpoofPredict(DEVICE_ID)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# print("Loading FAISS index and student_ids")
# index = faiss.read_index(FAISS_PATH)
# with open(IDS_PATH, "rb") as f:
#     student_ids = pickle.load(f)
# print(f"FAISS index loaded ({index.ntotal} vectors)")

# app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# app.prepare(ctx_id=0, det_size=(320, 320))

# # ====== Send batch thread ======
# send_buffer = []
# send_lock = threading.Lock()
# send_interval = 3

# def send_data_batch():
#     while True:
#         time.sleep(send_interval)
#         with send_lock:
#             buffer_copy = send_buffer.copy()
#             send_buffer.clear()

#         for record in buffer_copy:
#             try:
#                 response = requests.post(API_URL, json=record)
#                 if response.status_code in [200, 201]:
#                     print(f"Gửi thành công: {record['name']} lúc {record['timestamp']}")
#                 else:
#                     print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
#             except Exception as e:
#                 print(f"Gửi lỗi: {e}")

# threading.Thread(target=send_data_batch, daemon=True).start()

# # ====== Upload fake face to Cloudinary ======
# # def upload_fake_face_to_cloudinary(frame, bbox):
# #     x1, y1, x2, y2 = bbox
# #     cropped_face = frame[y1:y2, x1:x2]
# #     _, img_encoded = cv2.imencode('.jpg', cropped_face)
# #     response = cloudinary.uploader.upload(
# #         img_encoded.tobytes(),
# #         folder="fake_faces",
# #         public_id=f"fakeface_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
# #         resource_type="image"
# #     )
# #     print(f"☁️ Fake face đã upload: {response.get('secure_url')}")
# #     return response.get("secure_url")

# def upload_fake_face_to_cloudinary(frame, bbox):
#     # Gửi toàn bộ khung hình (frame), không crop
#     _, img_encoded = cv2.imencode('.jpg', frame)

#     response = cloudinary.uploader.upload(
#         img_encoded.tobytes(),
#         folder="fake_faces_fullframe",
#         public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
#         resource_type="image"
#     )
#     print(f"Full frame photo containing uploaded fake face: {response.get('secure_url')}")
#     return response.get("secure_url")

# # ====== Fake face queue + thread ======
# fake_face_queue = queue.Queue()

# def fake_face_uploader():
#     while True:
#         frame, bbox = fake_face_queue.get()
#         if frame is None:
#             break
#         try:
#             upload_fake_face_to_cloudinary(frame, bbox)
#         except Exception as e:
#             print("Error when uploading fake photo:", e)

# threading.Thread(target=fake_face_uploader, daemon=True).start()

# # ====== Anti-spoofing ======
# def is_real_face(frame, bbox):
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True if scale is not None else False,
#     }
#     spoof_input = image_cropper.crop(**param)
#     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
#     label = np.argmax(prediction)
#     confidence = prediction[0][label] / 2
#     return label == 1, confidence

# # ====== Face recognition ======
# def recognize_face(face_embedding):
#     embedding = face_embedding.astype(np.float32).reshape(1, -1)
#     embedding /= np.linalg.norm(embedding)
#     D, I = index.search(embedding, 1)
#     distance = float(D[0][0])
#     idx = int(I[0][0])
#     if distance < FAISS_THRESHOLD:
#         return student_ids[idx], distance
#     return "Unknown", distance

# # ====== Draw label ======
# def draw_label(frame, bbox, label_text, color):
#     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # ====== Camera ======
# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Cannot open webcam.")
#     exit()

# print("Realtime detection (press 'q' to exit)")

# frame_count = 0
# face_count = 0
# total_elapsed_time = 0.0
# total_face_time = 0.0
# last_spoof_check = 0
# spoof_result = None

# last_fake_upload_time = 0
# fake_upload_interval = 10  # giây, khoảng cách giữa các lần gửi fake face

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Error reading webcam.")
#         break

#     frame_start_time = time.perf_counter()
#     faces = app.get(frame)
#     face_count += len(faces)

#     for face in faces:
#         bbox = face.bbox.astype(int)

#         if time.time() - last_spoof_check > 2:
#             is_real, confidence = is_real_face(frame, bbox)
#             spoof_result = (is_real, confidence)
#             last_spoof_check = time.time()

#         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

#         face_start_time = time.perf_counter()

#         if is_real:
#             identity, dist = recognize_face(face.embedding)
#             label_text = f"{identity} ({dist:.2f})"
#             color = (0, 255, 0)

#             if identity != "Unknown" and dist < 0.7:
#                 payload = {
#                     "student_id": identity,
#                     "confidence": round(dist, 2),
#                     "real_face": 1.0,
#                     "timestamp": datetime.now().isoformat()
#                 }
#                 mqtt_client.publish(MQTT_TOPIC, json.dumps(payload))
#                 print(f"Send: {payload}")
#         else:
#             label_text = f"Fake Face ({confidence:.2f})"
#             color = (0, 0, 255)

#             # 🧵 Gửi ảnh fake vào queue xử lý upload riêng
#             # fake_face_queue.put((frame.copy(), bbox))
#             current_time = time.time()
#             if current_time - last_fake_upload_time > fake_upload_interval:
#                 fake_face_queue.put((frame.copy(), bbox))
#                 last_fake_upload_time = current_time

#         draw_label(frame, bbox, label_text, color)

#         face_time = time.perf_counter() - face_start_time
#         total_face_time += face_time

#     frame_count += 1
#     elapsed = time.perf_counter() - frame_start_time
#     total_elapsed_time += elapsed

#     fps = f"FPS: {1 / elapsed:.2f}"
#     cv2.putText(frame, fps, (10, 30),
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

#     cv2.imshow("Anti-Spoof + Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # ====== Cleanup ======
# cap.release()
# cv2.destroyAllWindows()
# fake_face_queue.put((None, None))  # kết thúc thread upload nếu cần

# print("\n===== PERFORMANCE STATISTICS =====")
# print(f"Total frames: {frame_count}")
# print(f"Total faces: {face_count}")
# print(f"Running time (seconds): {total_elapsed_time:.2f}s")
# print(f"Average FPS: {frame_count / total_elapsed_time:.2f}")
# if face_count > 0:
#     print(f"Average time/face: {total_face_time / face_count:.4f} seconds")

import os
import time
import cv2
import numpy as np
import pickle
import warnings
import requests
import threading
import cloudinary
import cloudinary.uploader
import queue
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name
import paho.mqtt.client as mqtt
import json

warnings.filterwarnings('ignore')

# ====== Cloudinary config ======
cloudinary.config(
    cloud_name="dvc80qdie",
    api_key="221435714784277",
    api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
    secure=True
)

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "exam/attendance"

mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# ====== Config ======
MODEL_DIR = "./resources/anti_spoof_models"
MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
DEVICE_ID = 0
API_URL = "http://localhost:5000/api/v1/exam-attendance/"

COSINE_THRESHOLD = 0.6  # Ngưỡng similarity nhận diện mặt

# ====== Init models ======
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

print("Loading embeddings.pkl...")
with open("embeddings/embeddings.pkl", "rb") as f:
    data = pickle.load(f)
embeddings = np.array(data["embeddings"], dtype=np.float32)
student_ids = data["student_ids"]
print(f"Loaded {len(student_ids)} student embeddings.")

app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# ====== Send batch thread ======
send_buffer = []
send_lock = threading.Lock()
send_interval = 3

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
                    print(f"Gửi thành công: {record['student_id']} lúc {record['timestamp']}")
                else:
                    print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Gửi lỗi: {e}")

threading.Thread(target=send_data_batch, daemon=True).start()

# ====== Upload fake face to Cloudinary ======
def upload_fake_face_to_cloudinary(frame, bbox):
    _, img_encoded = cv2.imencode('.jpg', frame)
    response = cloudinary.uploader.upload(
        img_encoded.tobytes(),
        folder="fake_faces_fullframe",
        public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        resource_type="image"
    )
    print(f"Full frame photo containing uploaded fake face: {response.get('secure_url')}")
    return response.get("secure_url")

# ====== Fake face queue + thread ======
fake_face_queue = queue.Queue()

def fake_face_uploader():
    while True:
        frame, bbox = fake_face_queue.get()
        if frame is None:
            break
        try:
            upload_fake_face_to_cloudinary(frame, bbox)
        except Exception as e:
            print("Error when uploading fake photo:", e)

threading.Thread(target=fake_face_uploader, daemon=True).start()

# ====== Anti-spoofing ======
def is_real_face(frame, bbox):
    image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
    param = {
        "org_img": frame,
        "bbox": image_bbox,
        "scale": scale,
        "out_w": w_input,
        "out_h": h_input,
        "crop": True if scale is not None else False,
    }
    spoof_input = image_cropper.crop(**param)
    prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
    label = np.argmax(prediction)
    confidence = prediction[0][label] / 2
    return label == 1, confidence

# ====== Face recognition ======
def recognize_face(face_embedding):
    """
    So sánh face_embedding với toàn bộ embeddings đã load.
    Trả về student_id gần nhất và giá trị similarity.
    """
    query = face_embedding.astype(np.float32)
    query /= np.linalg.norm(query)
    sims = np.dot(embeddings, query)  # vector cosine similarity
    idx = int(np.argmax(sims))
    sim = float(sims[idx])

    if sim >= COSINE_THRESHOLD:
        return student_ids[idx], sim
    return "Unknown", sim

# ====== Draw label ======
def draw_label(frame, bbox, label_text, color):
    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
    cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# ====== Camera ======
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open webcam.")
    exit()

print("Realtime detection (press 'q' to exit)")

frame_count = 0
face_count = 0
total_elapsed_time = 0.0
total_face_time = 0.0
last_spoof_check = 0
spoof_result = None

last_fake_upload_time = 0
fake_upload_interval = 10  # giây

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error reading webcam.")
        break

    frame_start_time = time.perf_counter()
    faces = app.get(frame)
    face_count += len(faces)

    for face in faces:
        bbox = face.bbox.astype(int)

        if time.time() - last_spoof_check > 2:
            is_real, confidence = is_real_face(frame, bbox)
            spoof_result = (is_real, confidence)
            last_spoof_check = time.time()

        is_real, confidence = spoof_result if spoof_result else (False, 0.0)

        face_start_time = time.perf_counter()

        if is_real:
            identity, similarity = recognize_face(face.embedding)
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown" and similarity >= COSINE_THRESHOLD:
                payload = {
                    "student_id": identity,
                    "confidence": round(similarity, 2),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                mqtt_client.publish(MQTT_TOPIC, json.dumps(payload))
                print(f"Send: {payload}")
        else:
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)

            current_time = time.time()
            if current_time - last_fake_upload_time > fake_upload_interval:
                fake_face_queue.put((frame.copy(), bbox))
                last_fake_upload_time = current_time

        draw_label(frame, bbox, label_text, color)

        face_time = time.perf_counter() - face_start_time
        total_face_time += face_time

    frame_count += 1
    elapsed = time.perf_counter() - frame_start_time
    total_elapsed_time += elapsed

    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ====== Cleanup ======
cap.release()
cv2.destroyAllWindows()
fake_face_queue.put((None, None))  # kết thúc thread upload nếu cần

print("\n===== PERFORMANCE STATISTICS =====")
print(f"Total frames: {frame_count}")
print(f"Total faces: {face_count}")
print(f"Running time (seconds): {total_elapsed_time:.2f}s")
print(f"Average FPS: {frame_count / total_elapsed_time:.2f}")
if face_count > 0:
    print(f"Average time/face: {total_face_time / face_count:.4f} seconds")





# # import os
# # from dotenv import load_dotenv
# # # Load biến môi trường từ file .env
# # load_dotenv()
# # import time
# # import cv2
# # import numpy as np
# # import pickle
# # import warnings
# # import requests
# # import threading
# # import cloudinary
# # import cloudinary.uploader
# # import queue
# # from datetime import datetime
# # from insightface.app import FaceAnalysis
# # from src.anti_spoof_predict import AntiSpoofPredict
# # from src.generate_patches import CropImage
# # from src.utility import parse_model_name
# # import paho.mqtt.client as mqtt
# # import json

# # warnings.filterwarnings('ignore')

# # cloudinary.config(
# #     cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
# #     api_key=os.getenv("CLOUDINARY_API_KEY"),
# #     api_secret=os.getenv("CLOUDINARY_API_SECRET"),
# #     secure=True
# # )

# # MQTT_BROKER = os.getenv("MQTT_BROKER")
# # MQTT_PORT = int(os.getenv("MQTT_PORT"))
# # MQTT_TOPIC = os.getenv("MQTT_TOPIC")

# # mqtt_client = mqtt.Client()
# # mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# # MODEL_DIR = os.getenv("MODEL_DIR")
# # MODEL_NAME = os.getenv("MODEL_NAME")
# # DEVICE_ID = int(os.getenv("DEVICE_ID"))
# # API_URL = os.getenv("API_URL")

# # # cloudinary.config(
# # #     cloud_name="dvc80qdie",
# # #     api_key="221435714784277",
# # #     api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI",
# # #     secure=True
# # # )

# # # MQTT_BROKER = "broker.hivemq.com"
# # # MQTT_PORT = 1883
# # # MQTT_TOPIC = "exam/attendance"

# # # mqtt_client = mqtt.Client()
# # # mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# # # MODEL_DIR = "./resources/anti_spoof_models"
# # # MODEL_NAME = "2.7_80x80_MiniFASNetV2.pth"
# # # DEVICE_ID = 0
# # # API_URL = "http://localhost:5000/api/v1/exam-attendance/"

# # COSINE_THRESHOLD = 0.6  # Ngưỡng similarity để xác định mặt giống (bạn có thể điều chỉnh phù hợp)

# # # Khởi tạo mô hình phát hiện mặt giả (anti-spoofing) và bộ crop ảnh
# # model_test = AntiSpoofPredict(DEVICE_ID)
# # image_cropper = CropImage()
# # h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

# # print("Loading embeddings.pkl...")
# # with open("embeddings/embeddings.pkl", "rb") as f:
# #     data = pickle.load(f)
# # embeddings = np.array(data["embeddings"], dtype=np.float32)
# # student_ids = data["student_ids"]
# # print(f"Loaded {len(student_ids)} student embeddings.")

# # # Khởi tạo mô hình nhận diện khuôn mặt insightface
# # app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# # app.prepare(ctx_id=0, det_size=(320, 320))

# # # Buffer và khóa để gửi dữ liệu batch lên API tránh gửi quá nhiều lần trong thời gian ngắn
# # send_buffer = []
# # send_lock = threading.Lock()
# # send_interval = 3  # Thời gian gửi dữ liệu batch (giây)

# # def send_data_batch():
# #     """
# #     Thread này chạy liên tục,
# #     mỗi send_interval giây, gửi toàn bộ dữ liệu hiện có trong send_buffer lên API.
# #     Dùng khóa để tránh tranh chấp khi thêm dữ liệu từ luồng chính.
# #     """
# #     while True:
# #         time.sleep(send_interval)
# #         with send_lock:
# #             buffer_copy = send_buffer.copy()
# #             send_buffer.clear()
# #         for record in buffer_copy:
# #             try:
# #                 response = requests.post(API_URL, json=record)
# #                 if response.status_code in [200, 201]:
# #                     print(f"Gửi thành công: {record['student_id']} lúc {record['timestamp']}")
# #                 else:
# #                     print(f"Lỗi gửi dữ liệu: HTTP {response.status_code} - {response.text}")
# #             except Exception as e:
# #                 print(f"Lỗi khi gửi dữ liệu lên server: {e}")

# # # Khởi chạy thread gửi dữ liệu không đồng bộ
# # threading.Thread(target=send_data_batch, daemon=True).start()

# # def upload_fake_face_to_cloudinary(frame, bbox):
# #     """
# #     Upload toàn bộ khung hình chứa face giả lên Cloudinary.
# #     Việc upload ảnh lớn, nên được xử lý bất đồng bộ qua queue.
# #     """
# #     _, img_encoded = cv2.imencode('.jpg', frame)
# #     response = cloudinary.uploader.upload(
# #         img_encoded.tobytes(),
# #         folder="fake_faces_fullframe",
# #         public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
# #         resource_type="image"
# #     )
# #     print(f"Ảnh toàn khung chứa face giả đã được upload: {response.get('secure_url')}")
# #     return response.get("secure_url")

# # # Queue và thread upload ảnh face giả riêng biệt để không làm gián đoạn luồng chính
# # fake_face_queue = queue.Queue()

# # def fake_face_uploader():
# #     """
# #     Thread xử lý queue ảnh face giả,
# #     nhận frame và bbox rồi upload lên Cloudinary.
# #     """
# #     while True:
# #         frame, bbox = fake_face_queue.get()
# #         if frame is None:
# #             break
# #         try:
# #             upload_fake_face_to_cloudinary(frame, bbox)
# #         except Exception as e:
# #             print(f"Lỗi khi upload ảnh face giả: {e}")

# # threading.Thread(target=fake_face_uploader, daemon=True).start()

# # def is_real_face(frame, bbox):
# #     """
# #     Kiểm tra khuôn mặt có phải là mặt thật hay giả dựa trên mô hình anti-spoofing.
# #     Tham số bbox là tọa độ bounding box (x1,y1,x2,y2).
# #     Trả về (True, confidence) nếu là mặt thật, ngược lại là mặt giả.
# #     """
# #     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
# #     param = {
# #         "org_img": frame,
# #         "bbox": image_bbox,
# #         "scale": scale,
# #         "out_w": w_input,
# #         "out_h": h_input,
# #         "crop": True if scale is not None else False,
# #     }
# #     spoof_input = image_cropper.crop(**param)
# #     prediction = model_test.predict(spoof_input, os.path.join(MODEL_DIR, MODEL_NAME))
# #     label = np.argmax(prediction)
# #     confidence = prediction[0][label] / 2
# #     return label == 1, confidence

# # def recognize_face(face_embedding):
# #     """
# #     So sánh face_embedding với embeddings đã lưu để nhận diện.
# #     Trả về student_id gần nhất và độ tương đồng similarity.
# #     """
# #     query = face_embedding.astype(np.float32)
# #     query /= np.linalg.norm(query)
# #     sims = np.dot(embeddings, query)  # Tính cosine similarity với tất cả embeddings
# #     idx = int(np.argmax(sims))        # Chỉ số vector gần nhất
# #     sim = float(sims[idx])             # Giá trị similarity cao nhất

# #     if sim >= COSINE_THRESHOLD:
# #         return student_ids[idx], sim
# #     return "Unknown", sim

# # def draw_label(frame, bbox, label_text, color):
# #     """
# #     Vẽ bounding box và label lên frame hiển thị.
# #     """
# #     cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
# #     cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
# #                 cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# # cap = cv2.VideoCapture(0)
# # if not cap.isOpened():
# #     print("Không thể mở webcam.")
# #     exit()

# # print("Realtime detection (nhấn 'q' để thoát)")

# # last_spoof_check = 0
# # spoof_result = None
# # last_fake_upload_time = 0
# # fake_upload_interval = 10  # giây giữa các lần upload ảnh face giả

# # while True:
# #     ret, frame = cap.read()
# #     if not ret:
# #         print("Lỗi khi đọc webcam.")
# #         break

# #     frame_start_time = time.perf_counter()
# #     faces = app.get(frame)

# #     for face in faces:
# #         bbox = face.bbox.astype(int)

# #         # Kiểm tra anti-spoofing mỗi 2 giây để giảm tải
# #         if time.time() - last_spoof_check > 2:
# #             is_real, confidence = is_real_face(frame, bbox)
# #             spoof_result = (is_real, confidence)
# #             last_spoof_check = time.time()

# #         is_real, confidence = spoof_result if spoof_result else (False, 0.0)

# #         if is_real:
# #             identity, similarity = recognize_face(face.embedding)
# #             label_text = f"{identity} ({similarity:.2f})"
# #             color = (0, 255, 0)

# #             # Nếu nhận diện được người quen với similarity đủ cao, gửi dữ liệu qua MQTT
# #             if identity != "Unknown" and similarity >= COSINE_THRESHOLD:
# #                 payload = {
# #                     "student_id": identity,
# #                     "confidence": round(similarity, 2),
# #                     "real_face": 1.0,
# #                     "timestamp": datetime.now().isoformat()
# #                 }
# #                 mqtt_client.publish(MQTT_TOPIC, json.dumps(payload))
# #                 print(f"Send: {payload}")
# #         else:
# #             label_text = f"Fake Face ({confidence:.2f})"
# #             color = (0, 0, 255)

# #             # Upload ảnh face giả mỗi fake_upload_interval giây
# #             current_time = time.time()
# #             if current_time - last_fake_upload_time > fake_upload_interval:
# #                 fake_face_queue.put((frame.copy(), bbox))
# #                 last_fake_upload_time = current_time

# #         draw_label(frame, bbox, label_text, color)

# #     elapsed = time.perf_counter() - frame_start_time
# #     fps = f"FPS: {1 / elapsed:.2f}"
# #     cv2.putText(frame, fps, (10, 30),
# #                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

# #     cv2.imshow("Anti-Spoof + Face Recognition", frame)
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # cap.release()
# # cv2.destroyAllWindows()
# # fake_face_queue.put((None, None))  # Dừng thread upload ảnh face giả khi thoát


