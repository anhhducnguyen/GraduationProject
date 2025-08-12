import threading
import time
import cv2
from datetime import datetime
import numpy as np
import pickle
import os
from dotenv import load_dotenv
load_dotenv() 
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name
import requests


import utils 

# --- Load configs từ biến môi trường hoặc file config ---
API_URL = os.getenv("API_URL")
MODEL_DIR = os.getenv("MODEL_DIR")
MODEL_NAME = os.getenv("MODEL_NAME")
DEVICE_ID = int(os.getenv("DEVICE_ID"))
COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", 0.6))
SEND_INTERVAL = int(os.getenv("SEND_INTERVAL", 1))
FAKE_UPLOAD_INTERVAL = int(os.getenv("FAKE_UPLOAD_INTERVAL", 10))

# o day
def send_data_realtime(api_url, record):
    try:
        response = requests.post(api_url, json=record)
        if response.status_code in [200, 201]:
            print(f"[REALTIME] Gửi thành công: {record['student_id']} lúc {record['timestamp']}")
        else:
            print(f"[REALTIME] Lỗi gửi dữ liệu: HTTP {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[REALTIME] Lỗi khi gửi dữ liệu: {e}")

# --- Khởi tạo ---
model_test = AntiSpoofPredict(DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(MODEL_NAME)

with open("embeddings/embeddings.pkl", "rb") as f:
    data = pickle.load(f)
embeddings = np.array(data["embeddings"], dtype=np.float32)
student_ids = data["student_ids"]
embeddings /= np.linalg.norm(embeddings, axis=1, keepdims=True)

app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(320, 320))

# --- Start worker threads ---
# threading.Thread(target=utils.send_data_batch_worker, args=(API_URL, SEND_INTERVAL), daemon=True).start()
threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

last_spoof_check = 0
spoof_result = None
last_fake_upload_time = 0

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Không thể mở webcam.")
    exit()

print("Realtime detection (ấn 'q' để thoát)")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Lỗi khi đọc webcam.")
        break

    faces = app.get(frame)

    for face in faces:
        bbox = face.bbox.astype(int)

        if time.time() - last_spoof_check > 2:
            is_real, confidence = utils.is_real_face(frame, bbox, image_cropper, model_test, MODEL_DIR, MODEL_NAME, scale, w_input, h_input)
            spoof_result = (is_real, confidence)
            last_spoof_check = time.time()

        is_real, confidence = spoof_result if spoof_result else (False, 0.0)

        if is_real:
            identity, similarity = utils.recognize_face(face.embedding, embeddings, student_ids, COSINE_THRESHOLD)
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown":
                payload = {
                    "name": identity,
                    "confidence": float(round(similarity, 2)),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                # o day
                send_data_realtime(API_URL, payload)
                with utils.send_lock:
                    utils.send_buffer.append(payload)

        else:
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)
            current_time = time.time()
            if current_time - last_fake_upload_time > FAKE_UPLOAD_INTERVAL:
                utils.fake_face_queue.put(frame.copy())
                last_fake_upload_time = current_time

        utils.draw_label(frame, bbox, label_text, color)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
utils.fake_face_queue.put(None)  # Dừng thread upload ảnh fake
