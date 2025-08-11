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
import cloudinary.uploader
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

class FaceRecognitionService:
    def __init__(self, config):
        warnings.filterwarnings('ignore')

        self.modelPath = config["model_path"]
        self.threshold = config["threshold"]
        self.faiss_path = config["faiss_path"]
        self.ids_path = config["ids_path"]
        self.api_url = config["api_url"]
        self.device_id = config["device_id"]
        self.send_interval = config["send_interval"]
        self.fake_upload_interval = config["fake_upload_interval"]

        self.send_buffer = []
        self.send_lock = threading.Lock()
        self.fake_face_queue = queue.Queue()

        self.anti_spoof_model = AntiSpoofPredict(self.device_id)
        self.image_cropper = CropImage()
        self.h_input, self.w_input, self.model_type, self.scale = parse_model_name(
            os.path.basename(self.modelPath)
        )

        self.face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
        self.face_app.prepare(ctx_id=0, det_size=(320, 320))

        self.index = None
        self.student_ids = []

    def loadModel(self):
        print("Đang tải FAISS index và student_ids...")
        self.index = faiss.read_index(self.faiss_path)
        with open(self.ids_path, "rb") as f:
            self.student_ids = pickle.load(f)
        print(f"Loaded FAISS index ({self.index.ntotal} vectors)")

    def extractEmbedding(self, frame):
        faces = self.face_app.get(frame)
        if faces:
            return faces[0].embedding
        return None

    def isMatch(self, embedding):
        embedding = embedding.astype(np.float32).reshape(1, -1)
        embedding /= np.linalg.norm(embedding)
        D, I = self.index.search(embedding, 1)
        distance = float(D[0][0])
        idx = int(I[0][0])
        if distance < self.threshold:
            return self.student_ids[idx], distance
        return "Unknown", distance

    def registerFace(self, studentId, embedding):
        embedding = embedding.astype(np.float32).reshape(1, -1)
        embedding /= np.linalg.norm(embedding)
        self.index.add(embedding)
        self.student_ids.append(studentId)
        faiss.write_index(self.index, self.faiss_path)
        with open(self.ids_path, "wb") as f:
            pickle.dump(self.student_ids, f)
        print(f"Added student {studentId} to database.")

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
        prediction = self.anti_spoof_model.predict(spoof_input, self.modelPath)
        label = np.argmax(prediction)
        confidence = prediction[0][label] / 2
        return label == 1, confidence

    def uploadFakeFace(self, frame):
        _, img_encoded = cv2.imencode('.jpg', frame)
        response = cloudinary.uploader.upload(
            img_encoded.tobytes(),
            folder="fake_faces_fullframe",
            public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            resource_type="image"
        )
        print(f"Ảnh fake face đã upload: {response.get('secure_url')}")
        return response.get("secure_url")

    def _send_data_batch(self):
        while True:
            time.sleep(self.send_interval)
            with self.send_lock:
                buffer_copy = self.send_buffer.copy()
                self.send_buffer.clear()
            for record in buffer_copy:
                try:
                    response = requests.post(self.api_url, json=record)
                    if response.status_code in [200, 201]:
                        print(f"Successfully sent: {record['name']} at {record['timestamp']}")
                    else:
                        print(f"Error sending: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"Send error: {e}")

    def _fake_face_uploader(self):
        while True:
            frame, _ = self.fake_face_queue.get()
            if frame is None:
                break
            try:
                self.uploadFakeFace(frame)
            except Exception as e:
                print("Error uploading fake face:", e)

    def run(self):
        threading.Thread(target=self._send_data_batch, daemon=True).start()
        threading.Thread(target=self._fake_face_uploader, daemon=True).start()

        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Cannot open webcam.")
            return

        print("Realtime detection (press 'q' to exit)")

        last_spoof_check = 0
        spoof_result = None
        last_fake_upload_time = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            faces = self.face_app.get(frame)
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
                    if identity != "Unknown":
                        payload = {
                            "name": identity,
                            "confidence": round(dist, 2),
                            "real_face": 1.0,
                            "timestamp": datetime.now().isoformat()
                        }
                        with self.send_lock:
                            self.send_buffer.append(payload)
                else:
                    label_text = f"Fake Face ({confidence:.2f})"
                    color = (0, 0, 255)
                    if time.time() - last_fake_upload_time > self.fake_upload_interval:
                        self.fake_face_queue.put((frame.copy(), bbox))
                        last_fake_upload_time = time.time()

                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            cv2.imshow("Anti-Spoof + Face Recognition", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        self.fake_face_queue.put((None, None))
