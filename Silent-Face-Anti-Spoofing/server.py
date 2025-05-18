# server.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import face_recognition
import os
import pickle
from src.anti_spoof_predict import AntiSpoofPredict, Detection
from src.generate_patches import CropImage
from src.utility import parse_model_name

app = Flask(__name__)

# Load known faces
with open("known_faces.pkl", "rb") as f:
    known_faces = pickle.load(f)
known_encodings = []
known_names = []
for name, encs in known_faces.items():
    known_encodings.extend(encs)
    known_names.extend([name] * len(encs))

model_dir = "./resources/anti_spoof_models"
detector = Detection()
cropper = CropImage()
model_test = AntiSpoofPredict(0)

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    data = request.get_json()
    img_data = base64.b64decode(data['image'])
    nparr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = {
        "open": False,
        "identity": "Unknown",
        "face_score": 0,
        "anti_spoof_score": 0
    }

    image_bboxes = detector.get_bboxes(frame)
    for bbox in image_bboxes:
        x, y, w, h = bbox
        if x < 0 or y < 0 or w <= 0 or h <= 0:
            continue

        face_img = frame[y:y+h, x:x+w]
        if face_img.size == 0:
            continue

        rgb_face = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
        encoding = face_recognition.face_encodings(rgb_face)
        if len(encoding) == 0:
            continue

        matches = face_recognition.compare_faces(known_encodings, encoding[0], tolerance=0.5)
        distances = face_recognition.face_distance(known_encodings, encoding[0])
        best_match_index = np.argmin(distances)

        identity = "Unknown"
        score = 0
        if matches[best_match_index]:
            identity = known_names[best_match_index]
            score = 1 - distances[best_match_index]

        # Anti-spoof
        prediction = np.zeros((1, 3))
        for model_name in os.listdir(model_dir):
            h_in, w_in, model_type, scale = parse_model_name(model_name)
            param = {
                "org_img": frame,
                "bbox": bbox,
                "scale": scale,
                "out_w": w_in,
                "out_h": h_in,
                "crop": scale is not None
            }
            cropped = cropper.crop(**param)
            prediction += model_test.predict(cropped, os.path.join(model_dir, model_name))

        label = np.argmax(prediction)
        spoof_score = prediction[0][label] / 2

        if label == 1 and identity != "Unknown" and score >= 0.6 and spoof_score >= 0.99:
            result = {
                "open": True,
                "identity": identity,
                "face_score": round(score, 2),
                "anti_spoof_score": round(spoof_score, 2)
            }
            break

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)