# import os
# import cv2
# import numpy as np
# import time
# import warnings
# import face_recognition
# import pickle

# from src.anti_spoof_predict import AntiSpoofPredict, Detection
# from src.generate_patches import CropImage
# from src.utility import parse_model_name
# import threading

# warnings.filterwarnings('ignore')

# KNOWN_FACE_PATH = "./known_faces/"
# FRAME_SKIP = 5  # Số frame bỏ qua trước khi kiểm tra

# API_URL = "http://192.168.1.4:5000/api/v1/exam-attendance/"
# last_sent_time = {}
# send_lock = threading.Lock()

# # Load known faces from pickle
# def load_known_faces(pkl_file="known_faces.pkl"):
#     with open(pkl_file, "rb") as f:
#         known_faces = pickle.load(f)

#     known_face_encodings = []
#     known_face_names = []

#     for name, encodings in known_faces.items():
#         known_face_encodings.extend(encodings)
#         known_face_names.extend([name] * len(encodings))

#     return known_face_encodings, known_face_names


# def check_image(image):
#     height, width, channel = image.shape
#     desired_width = int(height * 3 / 4)
#     if width != desired_width:
#         image = cv2.resize(image, (desired_width, height))
#     return True


# class FaceSpoofingProcessor:
#     def __init__(self, model_dir, device_id, known_encodings, known_names):
#         self.model_dir = model_dir
#         self.device_id = device_id
#         self.known_encodings = known_encodings
#         self.known_names = known_names
#         self.model_test = AntiSpoofPredict(device_id)
#         self.image_cropper = CropImage()
#         self.detector = Detection()
#         self.frame_count = 0

#     def process_frame(self, frame):
#         self.frame_count += 1

#         # Chỉ xử lý mỗi 5 frame
#         if self.frame_count % FRAME_SKIP != 0:
#             return frame  # Không thay đổi frame, không xử lý gì cả

#         image_bboxes = self.detector.get_bboxes(frame)
#         test_speed_total = 0

#         for i, image_bbox in enumerate(image_bboxes):
#             x, y, w, h = image_bbox
#             if x < 0 or y < 0 or w <= 0 or h <= 0:
#                 continue

#             face_image = frame[y:y + h, x:x + w]
#             if face_image.size == 0:
#                 continue

#             rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
#             encoding = face_recognition.face_encodings(rgb_face)

#             face_identity = "Unknown"
#             face_score = 0.0

#             if len(encoding) > 0:
#                 matches = face_recognition.compare_faces(self.known_encodings, encoding[0], tolerance=0.5)
#                 face_distances = face_recognition.face_distance(self.known_encodings, encoding[0])
#                 best_match_index = np.argmin(face_distances)
#                 if matches[best_match_index]:
#                     face_identity = self.known_names[best_match_index]
#                     face_score = 1 - face_distances[best_match_index]

#             prediction = np.zeros((1, 3))
#             test_speed = 0

#             for model_name in os.listdir(self.model_dir):
#                 h_input, w_input, model_type, scale = parse_model_name(model_name)
#                 param = {
#                     "org_img": frame,
#                     "bbox": image_bbox,
#                     "scale": scale,
#                     "out_w": w_input,
#                     "out_h": h_input,
#                     "crop": True,
#                 }
#                 if scale is None:
#                     param["crop"] = False
#                 img = self.image_cropper.crop(**param)
#                 start = time.time()
#                 prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))
#                 test_speed += time.time() - start

#             test_speed_total += test_speed
#             label = np.argmax(prediction)
#             value = prediction[0][label] / 2
#             if label == 1:
#                 result_text = f"{face_identity} | RealFace Score: {face_score:.2f} | Anti-Spoof Score: {value:.2f}"
#             else:
#                 result_text = f"{face_identity} | FakeFace Score: {value:.2f}"

#             print(f"[Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - BBox: x={x}, y={y}, w={w}, h={h}")

#         return frame


# # ==== Example Main Loop ====
# if __name__ == "__main__":
#     model_dir = "./resources/anti_spoof_models"
#     device_id = 0
#     known_encodings, known_names = load_known_faces()

#     cap = cv2.VideoCapture(0)
#     processor = FaceSpoofingProcessor(model_dir, device_id, known_encodings, known_names)

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         frame = processor.process_frame(frame)
#         cv2.imshow("Face Spoofing Detection", frame)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

import os
import cv2
import numpy as np
import time
import warnings
import face_recognition
import pickle
import requests
import threading

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name

warnings.filterwarnings('ignore')

KNOWN_FACE_PATH = "./known_faces/"
FRAME_SKIP = 5
API_URL = "http://192.168.1.4:5000/api/v1/exam-attendance/"
last_sent_time = {}
send_lock = threading.Lock()

# Load known faces from pickle
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

    # def send_data_to_api(self, name, face_score, spoof_score):
    #     timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    #     with send_lock:
    #         last_time = last_sent_time.get(name, 0)
    #         if time.time() - last_time < 10:
    #             return  # Không gửi liên tục trong thời gian ngắn

    #         payload = {
    #             "name": name,
    #             "confidence": round(face_score, 2),
    #             # "real_face": round(spoof_score, 2),
    #             "real_face": bool(label == 1 and spoof_score >= 0.5),
    #             "timestamp": timestamp
    #         }

    #         try:
    #             response = requests.post(API_URL, json=payload)
    #             print(f"[API] Gửi dữ liệu cho {name}: {payload} - Trạng thái: {response.status_code}")
    #             if response.status_code == 200:
    #                 last_sent_time[name] = time.time()
    #             else:
    #                 print(f"[API] Lỗi gửi dữ liệu: {response.text}")
    #         except Exception as e:
    #             print(f"[API] Lỗi kết nối: {e}")
    def send_data_to_api(self, name, face_score, spoof_score, label):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        with send_lock:
            last_time = last_sent_time.get(name, 0)
            if time.time() - last_time < 10:
                return

            payload = {
                "name": name,
                "confidence": round(face_score, 2),
                "real_face": 1.0 if label == 1 and spoof_score >= 0.5 else 0.0,
                "timestamp": timestamp
            }

            try:
                response = requests.post(API_URL, json=payload)
                print(f"[API] Gửi dữ liệu cho {name}: {payload} - Trạng thái: {response.status_code}")
                if response.status_code == 200:
                    last_sent_time[name] = time.time()
                else:
                    print(f"[API] Lỗi gửi dữ liệu: {response.text}")
            except Exception as e:
                print(f"[API] Lỗi kết nối: {e}")


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
            for model_name in os.listdir(self.model_dir):
                h_input, w_input, model_type, scale = parse_model_name(model_name)
                param = {
                    "org_img": frame,
                    "bbox": image_bbox,
                    "scale": scale,
                    "out_w": w_input,
                    "out_h": h_input,
                    "crop": True if scale else False,
                }
                img = self.image_cropper.crop(**param)
                prediction += self.model_test.predict(img, os.path.join(self.model_dir, model_name))

            label = np.argmax(prediction)
            value = prediction[0][label] / 2

            if label == 1:
                result_text = f"{face_identity} | RealFace Score: {face_score:.2f} | Anti-Spoof Score: {value:.2f}"
                print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")
                if face_identity != "Unknown":
                    # self.send_data_to_api(face_identity, face_score, value)
                    self.send_data_to_api(face_identity, face_score, value, label)

            else:
                result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
                if face_identity != "Unknown":
                    # self.send_data_to_api(face_identity, face_score, value)
                    self.send_data_to_api(face_identity, face_score, value, label)
                print(f"[Face {i + 1}] {result_text} - BBox: x={x}, y={y}, w={w}, h={h}")

        return frame


if __name__ == "__main__":
    model_dir = "./resources/anti_spoof_models"
    device_id = 0
    known_encodings, known_names = load_known_faces()

    cap = cv2.VideoCapture(0)
    processor = FaceSpoofingProcessor(model_dir, device_id, known_encodings, known_names)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = processor.process_frame(frame)
        cv2.imshow("Face Spoofing Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
