import os
import cv2
import numpy as np
import argparse
import warnings
import time
import math
import face_recognition

from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name
import pickle


warnings.filterwarnings('ignore')

SAMPLE_IMAGE_PATH = "./images/sample/"
KNOWN_FACE_PATH = "./known_faces/"


def check_image(image):
    height, width, channel = image.shape
    desired_width = int(height * 3 / 4)
    if width != desired_width:
        image = cv2.resize(image, (desired_width, height))
    return True

def load_known_faces(pkl_file="known_faces.pkl"):
    with open(pkl_file, "rb") as f:
        known_faces = pickle.load(f)

    known_face_encodings = []
    known_face_names = []

    for name, encodings in known_faces.items():
        known_face_encodings.extend(encodings)
        known_face_names.extend([name] * len(encodings))

    return known_face_encodings, known_face_names


def test(image_name, model_dir, device_id):
    model_test = AntiSpoofPredict(device_id)
    image_cropper = CropImage()
    detector = Detection()
    known_encodings, known_names = load_known_faces("known_faces.pkl")

    image = cv2.imread(SAMPLE_IMAGE_PATH + image_name)
    result = check_image(image)
    if not result:
        return

    image_bboxes = detector.get_bboxes(image)
    print(f"Found {len(image_bboxes)} face(s) in image.")
    test_speed_total = 0

    for i, image_bbox in enumerate(image_bboxes):
        x, y, w, h = image_bbox
        face_image = image[y:y + h, x:x + w]
        rgb_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
        encoding = face_recognition.face_encodings(rgb_face)

        face_identity = "Unknown"
        if len(encoding) > 0:
            matches = face_recognition.compare_faces(known_encodings, encoding[0], tolerance=0.5)
            face_distances = face_recognition.face_distance(known_encodings, encoding[0])
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                face_identity = known_names[best_match_index]

        prediction = np.zeros((1, 3))
        test_speed = 0

        for model_name in os.listdir(model_dir):
            h_input, w_input, model_type, scale = parse_model_name(model_name)
            param = {
                "org_img": image,
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
            result_text = f"{face_identity} | RealFace Score: {value:.2f}"
            color = (0, 255, 0)
        else:
            result_text = f"{face_identity} | FakeFace Score: {value:.2f}"
            color = (0, 0, 255)

        print(f"[Face {i + 1}] {result_text} - Time: {test_speed:.2f}s - Bounding Box: x={x}, y={y}, w={w}, h={h}")

        cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
        cv2.putText(image, result_text, (x, y - 10),
                    cv2.FONT_HERSHEY_COMPLEX, 0.5 * image.shape[0] / 1024, color, 1)

    print("Total prediction time: {:.2f}s".format(test_speed_total))

    format_ = os.path.splitext(image_name)[-1]
    result_image_name = image_name.replace(format_, "_result" + format_)
    cv2.imwrite(SAMPLE_IMAGE_PATH + result_image_name, image)


if __name__ == "__main__":
    desc = "Silent Face Anti-Spoofing + Recognition Test"
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument("--device_id", type=int, default=0, help="which gpu id, [0/1/2/3]")
    parser.add_argument("--model_dir", type=str, default="./resources/anti_spoof_models", help="model_lib used to test")
    parser.add_argument("--image_name", type=str, default="F2-test.jpg", help="image used to test")
    args = parser.parse_args()

    test(args.image_name, args.model_dir, args.device_id)
