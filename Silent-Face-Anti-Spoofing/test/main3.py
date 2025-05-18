import os
import cv2
import numpy as np
import time
import datetime
import warnings
import face_recognition
import pickle
import threading

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

KNOWN_FACE_PATH = "./known_faces/"
FRAME_SKIP = 3

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
            test_speed = 0

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
                start = time.time()
                prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))
                test_speed += time.time() - start

            label = np.argmax(prediction)
            value = prediction[0][label] / 2
            current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if label == 1:
                result_text = f"{face_identity} | RealFace Score: {face_score:.2f} | Anti-Spoof Score: {value:.2f}"
            else:
                result_text = f"{face_identity} | FakeFace Score: {value:.2f}"

            print(f"[{current_time}] [Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - BBox: x={x}, y={y}, w={w}, h={h}")

        return frame


# ====== Main App with threading for smooth display ======

display_frame = None  # Shared variable for display

def show_frame():
    global display_frame
    while True:
        if display_frame is not None:
            cv2.imshow("Face Spoofing Detection", display_frame)
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
    cv2.destroyAllWindows()

if __name__ == "__main__":
    model_dir = "./resources/anti_spoof_models"
    device_id = 0
    known_encodings, known_names = load_known_faces()

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Windows users; on Linux, try cv2.CAP_V4L2
    processor = FaceSpoofingProcessor(model_dir, device_id, known_encodings, known_names)

    threading.Thread(target=show_frame, daemon=True).start()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 480))  # Resize to improve performance
        processed_frame = processor.process_frame(frame)
        display_frame = processed_frame.copy()

    cap.release()
