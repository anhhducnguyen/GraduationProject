# from kafka import KafkaProducer
# import cv2
# import time
# import json

# producer = KafkaProducer(
#     bootstrap_servers='127.0.0.1:9092',
#     value_serializer=lambda v: v
# )

# cap = cv2.VideoCapture(0)
# if not cap.isOpened():
#     print("Không mở được camera")
#     exit()

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         break

#     _, buffer = cv2.imencode('.jpg', frame)
#     producer.send("frames", buffer.tobytes())
#     print("Gửi frame lên Kafka")

#     time.sleep(0.05)  # Giảm tải, ~20 FPS

# cap.release()
# producer.close()

from kafka import KafkaProducer
import cv2
import time

producer = KafkaProducer(
    bootstrap_servers='127.0.0.1:9092',
    value_serializer=lambda v: v
)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Không mở được camera")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Hiển thị video tại producer
    cv2.imshow("Producer - Camera", frame)

    # Gửi frame lên Kafka
    _, buffer = cv2.imencode('.jpg', frame)
    producer.send("frames", buffer.tobytes())
    print("📤 Gửi frame lên Kafka")

    # Nhấn Q để thoát
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    time.sleep(0.05)  # ~20 FPS

cap.release()
cv2.destroyAllWindows()
producer.close()
