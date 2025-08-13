
import cv2
from datetime import datetime
import json
import time
import threading
from insightface.app import FaceAnalysis
import cloudinary
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name
import paho.mqtt.client as mqtt
import pickle
import numpy as np

import config
import utils

# Cấu hình Cloudinary để upload ảnh
cloudinary.config(**config.CLOUDINARY_CONFIG)

# MQTT client
mqtt_client = mqtt.Client()
mqtt_client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)

# Model anti-spoof
model_test = AntiSpoofPredict(config.DEVICE_ID)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(config.MODEL_NAME)

# Load embeddings
with open(config.EMBEDDINGS_PATH, "rb") as f:
    data = pickle.load(f)
embeddings = np.array(data["embeddings"], dtype=np.float32)
student_ids = data["student_ids"]

# FaceAnalysis
app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
app.prepare(ctx_id=-1, det_size=(320, 320))

# Thread nền
threading.Thread(target=utils.send_data_batch_worker, args=(config.API_URL,), daemon=True).start()
threading.Thread(target=utils.fake_face_uploader_worker, daemon=True).start()

# Webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Không thể mở webcam.")
    exit()

print("Realtime detection (nhấn 'q' để thoát)")

# Lưu kết quả spoof cho từng khuôn mặt
spoof_results = {}  # key: bbox tuple, value: (is_real, confidence, last_check_time)
last_fake_upload_time = 0
SPOOF_INTERVAL = 0.5  # giây, kiểm tra lại anti-spoofing sau mỗi khoảng thời gian này

while True:
    ret, frame = cap.read()
    if not ret:
        print("Lỗi khi đọc webcam.")
        break

    frame_start_time = time.perf_counter()
    faces = app.get(frame)

    if not faces:
        print("Không phát hiện khuôn mặt nào")

    for face in faces:
        bbox = tuple(face.bbox.astype(int))

        now = time.time()
        if bbox not in spoof_results or now - spoof_results[bbox][2] > SPOOF_INTERVAL:
            # Kiểm tra anti-spoofing cho khuôn mặt này
            is_real, confidence = utils.is_real_face(
                frame, np.array(bbox), image_cropper, model_test,
                config.MODEL_DIR, config.MODEL_NAME,
                scale, w_input, h_input
            )
            spoof_results[bbox] = (is_real, confidence, now)
        else:
            is_real, confidence, _ = spoof_results[bbox]

        if is_real:
            # Nhận diện khuôn mặt thật
            identity, similarity = utils.recognize_face(
                face.embedding, embeddings, student_ids, config.COSINE_THRESHOLD
            )
            label_text = f"{identity} ({similarity:.2f})"
            color = (0, 255, 0)

            if identity != "Unknown" and similarity >= config.COSINE_THRESHOLD:
                payload = {
                    "student_id": identity,
                    "confidence": round(similarity, 2),
                    "real_face": 1.0,
                    "timestamp": datetime.now().isoformat()
                }
                mqtt_client.publish(config.MQTT_TOPIC, json.dumps(payload))
                print(f"Send: {payload}")
        else:
            # Face giả
            label_text = f"Fake Face ({confidence:.2f})"
            color = (0, 0, 255)

            if now - last_fake_upload_time > config.FAKE_UPLOAD_INTERVAL:
                utils.fake_face_queue.put(frame.copy())
                last_fake_upload_time = now

        # Vẽ bounding box + label
        utils.draw_label(frame, np.array(bbox), label_text, color)

    # Hiển thị FPS
    elapsed = time.perf_counter() - frame_start_time
    fps = f"FPS: {1 / elapsed:.2f}"
    cv2.putText(frame, fps, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
utils.fake_face_queue.put(None)


