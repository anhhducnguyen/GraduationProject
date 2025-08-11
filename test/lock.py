import os
import cv2
import numpy as np
import time
import warnings
import face_recognition
import pickle
import RPi.GPIO as GPIO  # <== Thêm thư viện điều khiển GPIO

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

KNOWN_FACE_PATH = "./known_faces/"
FRAME_SKIP = 5
THRESHOLD = 0.60  # Ngưỡng điểm nhận diện khuôn mặt
GPIO_PIN = 17     # GPIO sử dụng để mở cửa

# Thiết lập GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(GPIO_PIN, GPIO.OUT)
GPIO.output(GPIO_PIN, GPIO.LOW)  # Tắt ban đầu

def load_known_faces(pkl_file="known_faces.pkl"):
    with open(pkl_file, "rb") as f:
        known_faces = pickle.load(f)
    known_face_encodings = []
    known_face_names = []
    for name, encodings in known_faces.items():
        known_face_encodings.extend(encodings)
        known_face_names.extend([name] * len(encodings))
    return known_face_encodings, known_face_names

class FaceSpoofingProcessor:
    def __init__(self, model_dir, device_id, known_encodings, known_names):
        self.model_dir = model_dir
        self.device_id = device_id
        self.known_encodings = known_encodings
        self.known_names = known_names
        self.model_test = AntiSpoofPredict(device_id)
        self.image_cropper = CropImage()
        self.detector = Detection()
        self.frame_count = 0

    def process_frame(self, frame):
        self.frame_count += 1
        access_granted = False  # Mặc định không mở cửa

        if self.frame_count % FRAME_SKIP != 0:
            return frame, access_granted

        image_bboxes = self.detector.get_bboxes(frame)

        for i, image_bbox in enumerate(image_bboxes):
            x, y, w, h = image_bbox
            if x < 0 or y < 0 or w <= 0 or h <= 0:
                continue

            face_image = frame[y:y + h, x:x + w]
            if face_image.size == 0:
                continue

            rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
            encoding = face_recognition.face_encodings(rgb_face)

            face_identity = "Unknown"
            face_score = 0.0

            if len(encoding) > 0:
                matches = face_recognition.compare_faces(self.known_encodings, encoding[0], tolerance=0.5)
                face_distances = face_recognition.face_distance(self.known_encodings, encoding[0])
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    face_identity = self.known_names[best_match_index]
                    face_score = 1 - face_distances[best_match_index]

            prediction = np.zeros((1, 3))
            for model_name in os.listdir(self.model_dir):
                h_input, w_input, model_type, scale = parse_model_name(model_name)
                param = {
                    "org_img": frame,
                    "bbox": image_bbox,
                    "scale": scale,
                    "out_w": w_input,
                    "out_h": h_input,
                    "crop": True,
                }
                if scale is None:
                    param["crop"] = False
                img = self.image_cropper.crop(**param)
                prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

            label = np.argmax(prediction)
            value = prediction[0][label] / 2

            if label == 1:
                result_text = f"{face_identity} | RealFace Score: {face_score:.2f} | Anti-Spoof Score: {value:.2f}"
                if face_identity != "Unknown" and face_score >= THRESHOLD and value >= 0.99:
                    access_granted = True
            else:
                result_text = f"{face_identity} | FakeFace Score: {value:.2f}"

            print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

        return frame, access_granted


# ==== Main Loop ====
if __name__ == "__main__":
    model_dir = "./resources/anti_spoof_models"
    device_id = 0
    known_encodings, known_names = load_known_faces()

    cap = cv2.VideoCapture(0)
    processor = FaceSpoofingProcessor(model_dir, device_id, known_encodings, known_names)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame, access_granted = processor.process_frame(frame)

            if access_granted:
                print("Open lock")
                GPIO.output(GPIO_PIN, GPIO.HIGH)
                time.sleep(5)
            else:
                GPIO.output(GPIO_PIN, GPIO.LOW)

            cv2.imshow("Face Spoofing Detection", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        GPIO.cleanup()
