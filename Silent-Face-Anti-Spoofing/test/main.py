

import os
import cv2
import numpy as np
import argparse
import warnings
import time
import face_recognition
from concurrent.futures import ThreadPoolExecutor

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name
import pickle

warnings.filterwarnings('ignore')

KNOWN_FACE_PATH = "./known_faces/"

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


# Hàm kiểm tra và chuẩn bị ảnh
def check_image(image):
    height, width, channel = image.shape
    desired_width = int(height * 3 / 4)
    if width != desired_width:
        image = cv2.resize(image, (desired_width, height))
    return True

# def process_frame(frame, model_dir, device_id, known_encodings, known_names):
#     model_test = AntiSpoofPredict(device_id)
#     image_cropper = CropImage()
#     detector = Detection()

#     image_bboxes = detector.get_bboxes(frame)
#     # print(f"Found {len(image_bboxes)} face(s) in frame.")
#     test_speed_total = 0

#     for i, image_bbox in enumerate(image_bboxes):
#         x, y, w, h = image_bbox

#         # Kiểm tra xem bounding box có hợp lệ không (không phải giá trị âm hoặc quá nhỏ)
#         if x < 0 or y < 0 or w <= 0 or h <= 0:
#             continue

#         # Trích xuất ảnh khuôn mặt từ khung hình
#         face_image = frame[y:y + h, x:x + w]
        
#         # Kiểm tra xem face_image có hợp lệ không
#         if face_image.size == 0:
#             continue  # Bỏ qua nếu không có khuôn mặt hợp lệ

#         rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
#         encoding = face_recognition.face_encodings(rgb_face)

#         face_identity = "Unknown"
#         if len(encoding) > 0:
#             matches = face_recognition.compare_faces(known_encodings, encoding[0], tolerance=0.5)
#             face_distances = face_recognition.face_distance(known_encodings, encoding[0])
#             best_match_index = np.argmin(face_distances)
#             if matches[best_match_index]:
#                 face_identity = known_names[best_match_index]

#         prediction = np.zeros((1, 3))
#         test_speed = 0

#         for model_name in os.listdir(model_dir):
#             h_input, w_input, model_type, scale = parse_model_name(model_name)
#             param = {
#                 "org_img": frame,
#                 "bbox": image_bbox,
#                 "scale": scale,
#                 "out_w": w_input,
#                 "out_h": h_input,
#                 "crop": True,
#             }
#             if scale is None:
#                 param["crop"] = False
#             img = image_cropper.crop(**param)
#             start = time.time()
#             prediction += model_test.predict(img, os.path.join(model_dir, model_name))
#             test_speed += time.time() - start

#         test_speed_total += test_speed
#         label = np.argmax(prediction)
#         value = prediction[0][label] / 2
#         if label == 1:
#             result_text = f"{face_identity} | RealFace Score: {value:.2f}"
#             color = (0, 255, 0)
#         else:
#             result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
#             color = (0, 0, 255)

#         # print(f"[Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

#         cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
#         cv2.putText(frame, result_text, (x, y - 10),
#                     cv2.FONT_HERSHEY_COMPLEX, 0.5 * frame.shape[0] / 1024, color, 1)

#     # print("Total prediction time: {:.2f}s".format(test_speed_total))

#     return frame


def process_frame(frame, model_dir, device_id, known_encodings, known_names):
    model_test = AntiSpoofPredict(device_id)
    image_cropper = CropImage()
    detector = Detection()

    image_bboxes = detector.get_bboxes(frame)
    test_speed_total = 0

    for i, image_bbox in enumerate(image_bboxes):
        x, y, w, h = image_bbox

        # Kiểm tra xem bounding box có hợp lệ không (không phải giá trị âm hoặc quá nhỏ)
        if x < 0 or y < 0 or w <= 0 or h <= 0:
            continue

        # Trích xuất ảnh khuôn mặt từ khung hình
        face_image = frame[y:y + h, x:x + w]
        
        # Kiểm tra xem face_image có hợp lệ không
        if face_image.size == 0:
            continue  # Bỏ qua nếu không có khuôn mặt hợp lệ

        rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
        encoding = face_recognition.face_encodings(rgb_face)

        face_identity = "Unknown"
        face_score = 0.0  # Chưa xác định điểm số

        if len(encoding) > 0:
            matches = face_recognition.compare_faces(known_encodings, encoding[0], tolerance=0.5)
            face_distances = face_recognition.face_distance(known_encodings, encoding[0])
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                face_identity = known_names[best_match_index]
                face_score = 1 - face_distances[best_match_index]  # RealFace Score: 1 - distance

        prediction = np.zeros((1, 3))
        test_speed = 0

        for model_name in os.listdir(model_dir):
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
            img = image_cropper.crop(**param)
            start = time.time()
            prediction += model_test.predict(img, os.path.join(model_dir, model_name))
            test_speed += time.time() - start

        test_speed_total += test_speed
        label = np.argmax(prediction)
        value = prediction[0][label] / 2
        if label == 1:
            result_text = f"{face_identity} | RealFace Score: {face_score:.2f} | Anti-Spoof Score: {value:.2f}"
            color = (0, 255, 0)
        else:
            result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
            color = (0, 0, 255)

        print(f"[Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

        # Hiển thị thông tin lên frame
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        cv2.putText(frame, result_text, (x, y - 10),
                    cv2.FONT_HERSHEY_COMPLEX, 0.5 * frame.shape[0] / 1024, color, 1)
        
    print("Total prediction time: {:.2f}s".format(test_speed_total))

    return frame



def main(model_dir, device_id):
    # Load known faces
    known_encodings, known_names = load_known_faces("known_faces.pkl")

    # Open webcam (or video)
    cap = cv2.VideoCapture(0)  # Open the webcam (use 'video.mp4' for video file)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Error: Failed to capture frame.")
            break

        # Process each frame for face recognition and anti-spoofing
        frame = process_frame(frame, model_dir, device_id, known_encodings, known_names)

        # Display the processed frame
        cv2.imshow('Face Anti-Spoofing and Recognition', frame)

        # Exit on pressing 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    desc = "Silent Face Anti-Spoofing + Recognition Test in Real-time"
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument("--device_id", type=int, default=0, help="which GPU id, [0/1/2/3]")
    parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model library used for testing")
    args = parser.parse_args()

    main(args.model_dir, args.device_id)
