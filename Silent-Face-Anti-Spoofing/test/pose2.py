from ultralytics import YOLO
import cv2

# Load mô hình YOLO Pose
model = YOLO("yolo11n-pose.pt")

# Mở webcam hoặc video lớp học
cap = cv2.VideoCapture(0)  # Thay 0 bằng đường dẫn video nếu cần

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Dự đoán Pose
    results = model(frame)

    # Hiển thị kết quả
    annotated_frame = results[0].plot()
    cv2.imshow("Pose Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
