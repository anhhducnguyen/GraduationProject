import logging
import cv2
import numpy as np
import pickle
from ultralytics import YOLO
import face_recognition
from datetime import datetime

# Tắt logging của ultralytics
logging.getLogger("ultralytics").setLevel(logging.WARNING)

# Load YOLO Pose model
pose_model = YOLO("yolo11n-pose.pt", verbose=False)

# Load known face encodings
def load_known_faces(pkl_file="known_faces.pkl"):
    with open(pkl_file, "rb") as f:
        known_faces = pickle.load(f)

    known_encodings, known_names = [], []
    for name, encodings in known_faces.items():
        known_encodings.extend(encodings)
        known_names.extend([name] * len(encodings))
    return known_encodings, known_names

# Kiểm tra hành vi gian lận
def detect_cheating_behavior(kp, annotated_frame, face_identity):
    if kp.shape[0] < 17:
        return

    nose = kp[0][:2]
    left_eye = kp[1][:2]
    right_eye = kp[2][:2]
    left_shoulder = kp[5][:2]
    right_shoulder = kp[6][:2]

    current_time = datetime.now().strftime("%H:%M:%S")

    # --- Quay đầu ---
    head_vector = left_eye - right_eye
    shoulder_vector = left_shoulder - right_shoulder
    angle_diff = np.abs(np.arctan2(head_vector[1], head_vector[0]) -
                        np.arctan2(shoulder_vector[1], shoulder_vector[0])) * 180 / np.pi

    if angle_diff > 25:
        cv2.putText(annotated_frame,
                    f"{face_identity} - Head Turned @ {current_time}",
                    (int(nose[0]), int(nose[1]) - 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        print(f"[{current_time}] {face_identity} Head Turned")

# Biến lưu danh tính cuối cùng
last_identity = ["Unknown"]  # Dùng list để có thể cập nhật từ trong hàm

# Xử lý frame
def process_frame(frame, known_encodings, known_names):
    results = pose_model(frame)
    annotated_frame = results[0].plot()
    keypoints = results[0].keypoints

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    face_identity = "Unknown"

    if face_encodings:
        for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
            distances = face_recognition.face_distance(known_encodings, encoding)
            best_match_index = np.argmin(distances)
            if matches[best_match_index]:
                face_identity = known_names[best_match_index]
                face_score = 1 - distances[best_match_index]

                # Vẽ khung và tên
                cv2.rectangle(annotated_frame, (left, top), (right, bottom), (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"{face_identity} ({face_score:.2f})", (left, top - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                last_identity[0] = face_identity  # ✅ Cập nhật danh tính mới

    # Nếu không có khuôn mặt thì dùng tên lần cuối
    current_identity = last_identity[0]

    for kp in keypoints.data:
        detect_cheating_behavior(kp, annotated_frame, current_identity)

    return annotated_frame

# Main function
def main():
    known_encodings, known_names = load_known_faces("known_faces.pkl")
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Không mở được webcam.")
        return

    print("🎥 Đang giám sát... Bấm 'q' để thoát.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Lỗi khi đọc khung hình.")
            break

        frame = process_frame(frame, known_encodings, known_names)
        cv2.imshow('Exam Monitoring System', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
