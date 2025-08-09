import time
import cv2
import numpy as np
import faiss
import pickle
import os
import warnings
import requests
import threading
import queue
import paho.mqtt.client as mqtt
import json
import cloudinary
import cloudinary.uploader
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

class FaceRecognitionService:
    def __init__(self, model_path, model_name, faiss_path, ids_path,
                 threshold, mqtt_broker, mqtt_port, mqtt_topic, api_url,
                 cloud_name, api_key, api_secret):
        self.modelPath = model_path
        self.modelName = model_name
        self.threshold = threshold
        self.faiss_path = faiss_path
        self.ids_path = ids_path
        self.api_url = api_url
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.mqtt_topic = mqtt_topic

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

        self.send_buffer = []
        self.send_lock = threading.Lock()
        self.send_interval = 3
        self.fake_face_queue = queue.Queue()

        # MQTT
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)

    def loadModel(self):
        # Load anti-spoofing model
        self.anti_spoof_model = AntiSpoofPredict(0)
        self.image_cropper = CropImage()
        self.h_input, self.w_input, self.model_type, self.scale = parse_model_name(self.modelName)

        # Load FAISS index
        print("Loading FAISS index and student_ids")
        self.index = faiss.read_index(self.faiss_path)
        with open(self.ids_path, "rb") as f:
            self.student_ids = pickle.load(f)
        print(f"FAISS index loaded ({self.index.ntotal} vectors)")

        # Load face recognition model
        self.face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
        self.face_app.prepare(ctx_id=0, det_size=(320, 320))

        # Start threads
        threading.Thread(target=self.send_data_batch, daemon=True).start()
        threading.Thread(target=self.fake_face_uploader, daemon=True).start()

    def extractEmbedding(self, frame):
        faces = self.face_app.get(frame)
        return faces

    def isMatch(self, face_embedding):
        embedding = face_embedding.astype(np.float32).reshape(1, -1)
        embedding /= np.linalg.norm(embedding)
        D, I = self.index.search(embedding, 1)
        distance = float(D[0][0])
        idx = int(I[0][0])
        if distance < self.threshold:
            return self.student_ids[idx], distance
        return "Unknown", distance

    def registerFace(self, student_id, embedding):
        self.student_ids.append(student_id)
        self.index.add(embedding)
        faiss.write_index(self.index, self.faiss_path)
        with open(self.ids_path, "wb") as f:
            pickle.dump(self.student_ids, f)

    def verifyFace(self, frame, bbox):
        image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
        param = {
            "org_img": frame,
            "bbox": image_bbox,
            "scale": self.scale,
            "out_w": self.w_input,
            "out_h": self.h_input,
            "crop": True if self.scale is not None else False,
        }
        spoof_input = self.image_cropper.crop(**param)
        prediction = self.anti_spoof_model.predict(spoof_input, os.path.join(self.modelPath, self.modelName))

        prob_fake = float(prediction[0][0])
        prob_real = float(prediction[0][1])
        spoof_percentage = prob_fake / (prob_fake + prob_real) * 100

        label = np.argmax(prediction)
        return label == 1, spoof_percentage

    def send_data_batch(self):
        while True:
            time.sleep(self.send_interval)
            with self.send_lock:
                buffer_copy = self.send_buffer.copy()
                self.send_buffer.clear()

            for record in buffer_copy:
                try:
                    response = requests.post(self.api_url, json=record)
                    if response.status_code in [200, 201]:
                        print(f"Gửi thành công: {record['name']} lúc {record['timestamp']}")
                    else:
                        print(f"❌ Lỗi gửi: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"Gửi lỗi: {e}")

    def fake_face_uploader(self):
        while True:
            frame, bbox = self.fake_face_queue.get()
            if frame is None:
                break
            try:
                self.upload_fake_face_to_cloudinary(frame)
            except Exception as e:
                print("Error when uploading fake photo:", e)

    def upload_fake_face_to_cloudinary(self, frame):
        _, img_encoded = cv2.imencode('.jpg', frame)
        response = cloudinary.uploader.upload(
            img_encoded.tobytes(),
            folder="fake_faces_fullframe",
            public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            resource_type="image"
        )
        print(f"Full frame photo containing uploaded fake face: {response.get('secure_url')}")
        return response.get("secure_url")

    def run(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Cannot open webcam.")
            return

        print("Realtime detection (press 'q' to exit)")

        last_spoof_check = 0
        spoof_result = None
        last_fake_upload_time = 0
        fake_upload_interval = 10

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            faces = self.extractEmbedding(frame)
            for face in faces:
                bbox = face.bbox.astype(int)

                if time.time() - last_spoof_check > 2:
                    is_real, confidence = self.verifyFace(frame, bbox)
                    spoof_result = (is_real, confidence)
                    last_spoof_check = time.time()

                is_real, confidence = spoof_result if spoof_result else (False, 0.0)

                if is_real:
                    identity, dist = self.isMatch(face.embedding)
                    label_text = f"{identity} ({dist:.2f})"
                    color = (0, 255, 0)

                    if identity != "Unknown" and dist < 0.7:
                        payload = {
                            "student_id": identity,
                            "confidence": round(dist, 2),
                            "real_face": 1.0,
                            "timestamp": datetime.now().isoformat()
                        }
                        self.mqtt_client.publish(self.mqtt_topic, json.dumps(payload))
                        print(f"Send: {payload}")
                else:
                    label_text = f"Fake Face ({confidence:.1f}%)"
                    color = (0, 0, 255)
                    current_time = time.time()
                    if current_time - last_fake_upload_time > fake_upload_interval:
                        self.fake_face_queue.put((frame.copy(), bbox))
                        last_fake_upload_time = current_time

                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            cv2.imshow("Anti-Spoof + Face Recognition", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        self.fake_face_queue.put((None, None))


# ====== Run service ======
if __name__ == "__main__":
    service = FaceRecognitionService(
        model_path="./resources/anti_spoof_models",
        model_name="2.7_80x80_MiniFASNetV2.pth",
        faiss_path="faiss_index/face_index.faiss",
        ids_path="faiss_index/student_ids.pkl",
        threshold=1.2,
        mqtt_broker="broker.hivemq.com",
        mqtt_port=1883,
        mqtt_topic="exam/attendance",
        api_url="http://localhost:5000/api/v1/exam-attendance/",
        cloud_name="dvc80qdie",
        api_key="221435714784277",
        api_secret="Zar2Kh6w0VBWp0rpQ5VYE-sbREI"
    )

    service.loadModel()
    service.run()
