# from kafka import KafkaConsumer, KafkaProducer
# import numpy as np
# import cv2
# import pickle
# import faiss
# import os
# from datetime import datetime
# from insightface.app import FaceAnalysis
# from src.anti_spoof_predict import AntiSpoofPredict
# from src.generate_patches import CropImage
# import json
# from src.utility import parse_model_name
# from colorama import Fore, Style, init

# # Khởi tạo colorama để in màu
# init(autoreset=True)

# # Kafka consumer cho frames
# consumer = KafkaConsumer(
#     "frames",
#     bootstrap_servers="127.0.0.1:9092",
#     value_deserializer=lambda v: v
# )

# # Kafka producer cho results
# producer = KafkaProducer(
#     bootstrap_servers="127.0.0.1:9092",
#     value_serializer=lambda v: json.dumps(v).encode("utf-8")
# )

# # Load model chống giả mạo
# modelPath = "./resources/anti_spoof_models/2.7_80x80_MiniFASNetV2.pth"
# anti_spoof_model = AntiSpoofPredict(0)
# image_cropper = CropImage()
# h_input, w_input, model_type, scale = parse_model_name(os.path.basename(modelPath))

# # Load FAISS index
# index = faiss.read_index("faiss_index/face_index.faiss")
# with open("faiss_index/student_ids.pkl", "rb") as f:
#     student_ids = pickle.load(f)

# # FaceAnalysis
# face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
# face_app.prepare(ctx_id=0, det_size=(320, 320))

# threshold = 1.2

# def verify_face(frame, bbox):
#     image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
#     param = {
#         "org_img": frame,
#         "bbox": image_bbox,
#         "scale": scale,
#         "out_w": w_input,
#         "out_h": h_input,
#         "crop": True if scale is not None else False,
#     }
#     spoof_input = image_cropper.crop(**param)
#     prediction = anti_spoof_model.predict(spoof_input, modelPath)
#     label = np.argmax(prediction)
#     confidence = prediction[0][label] / 2
#     return label == 1, confidence

# print(Fore.CYAN + "📥 Đang nghe frames từ Kafka...")

# for msg in consumer:
#     jpg_bytes = msg.value
#     frame = cv2.imdecode(np.frombuffer(jpg_bytes, np.uint8), cv2.IMREAD_COLOR)
#     faces = face_app.get(frame)

#     for face in faces:
#         bbox = face.bbox.astype(int)
#         is_real, confidence = verify_face(frame, bbox)

#         if is_real:
#             embedding = face.embedding.astype(np.float32).reshape(1, -1)
#             embedding /= np.linalg.norm(embedding)
#             D, I = index.search(embedding, 1)
#             dist = float(D[0][0])
#             idx = int(I[0][0])
#             identity = student_ids[idx] if dist < threshold else "Unknown"
#         else:
#             identity = "Fake Face"

#         result = {
#             "identity": identity,
#             "real_face": is_real,
#             "confidence": round(confidence, 2),
#             "timestamp": datetime.now().isoformat()
#         }

#         # Vẽ bbox và text trên frame
#         color = (0, 255, 0) if identity not in ["Fake Face", "Unknown"] else (0, 0, 255)
#         label_text = identity
#         if identity == "Fake Face":
#             label_text += f" ({result['confidence']})"
#         elif identity == "Unknown":
#             label_text += f" ({result['confidence']})"
#         else:
#             label_text += f" ({result['confidence']})"

#         cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
#         cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

#         # In kết quả nhận diện
#         if identity == "Fake Face":
#             print(Fore.RED + f"🚨 Phát hiện khuôn mặt giả! | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")
#         elif identity == "Unknown":
#             print(Fore.YELLOW + f"❓ Không nhận diện được | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")
#         else:
#             print(Fore.GREEN + f"✅ Nhận diện: {identity} | Thật: {is_real} | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")

#         # Gửi lên Kafka
#         producer.send("results", result)
#         print(Style.DIM + f"📤 Đã gửi kết quả lên Kafka: {result}")

#     # Hiển thị video có bbox + label
#     cv2.imshow("Consumer - Face Recognition", frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# producer.close()
# cv2.destroyAllWindows()

from kafka import KafkaConsumer, KafkaProducer
import numpy as np
import cv2
import pickle
import faiss
import os
from datetime import datetime
from insightface.app import FaceAnalysis
from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
import json
from src.utility import parse_model_name
from colorama import Fore, Style, init

# Khởi tạo colorama để in màu
init(autoreset=True)

# Kafka consumer cho frames
consumer = KafkaConsumer(
    "frames",
    bootstrap_servers="127.0.0.1:9092",
    value_deserializer=lambda v: v
)

# Kafka producer cho results
producer = KafkaProducer(
    bootstrap_servers="127.0.0.1:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

# Load model chống giả mạo
modelPath = "./resources/anti_spoof_models/2.7_80x80_MiniFASNetV2.pth"
anti_spoof_model = AntiSpoofPredict(0)
image_cropper = CropImage()
h_input, w_input, model_type, scale = parse_model_name(os.path.basename(modelPath))

# Load FAISS index
index = faiss.read_index("faiss_index/face_index.faiss")
with open("faiss_index/student_ids.pkl", "rb") as f:
    student_ids = pickle.load(f)

# FaceAnalysis
face_app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(320, 320))

threshold = 1.2

def verify_face(frame, bbox):
    image_bbox = [bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]]
    param = {
        "org_img": frame,
        "bbox": image_bbox,
        "scale": scale,
        "out_w": w_input,
        "out_h": h_input,
        "crop": True if scale is not None else False,
    }
    spoof_input = image_cropper.crop(**param)
    prediction = anti_spoof_model.predict(spoof_input, modelPath)
    label = np.argmax(prediction)
    confidence = prediction[0][label] / 2
    return label == 1, confidence

print(Fore.CYAN + "📥 Đang nghe frames từ Kafka...")

for msg in consumer:
    jpg_bytes = msg.value
    print(f"📥 Nhận frame bytes size: {len(jpg_bytes)}")

    frame = cv2.imdecode(np.frombuffer(jpg_bytes, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        print(Fore.RED + "❌ Frame giải mã trả về None, có thể dữ liệu gửi không phải ảnh JPEG hợp lệ.")
        continue
    else:
        print(Fore.GREEN + f"✅ Frame giải mã thành công với shape: {frame.shape}")

    faces = face_app.get(frame)

    if not faces:
        print(Fore.YELLOW + "⚠️ Không phát hiện khuôn mặt nào trong frame.")
    else:
        print(Fore.BLUE + f"🔵 Phát hiện {len(faces)} khuôn mặt.")

    for face in faces:
        bbox = face.bbox.astype(int)
        is_real, confidence = verify_face(frame, bbox)

        if is_real:
            embedding = face.embedding.astype(np.float32).reshape(1, -1)
            embedding /= np.linalg.norm(embedding)
            D, I = index.search(embedding, 1)
            dist = float(D[0][0])
            idx = int(I[0][0])
            identity = student_ids[idx] if dist < threshold else "Unknown"
        else:
            identity = "Fake Face"

        result = {
            "identity": identity,
            "real_face": is_real,
            "confidence": round(confidence, 2),
            "timestamp": datetime.now().isoformat()
        }

        # Vẽ bbox và text trên frame
        color = (0, 255, 0) if identity not in ["Fake Face", "Unknown"] else (0, 0, 255)
        label_text = identity
        label_text += f" ({result['confidence']})"

        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
        cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # In kết quả nhận diện
        if identity == "Fake Face":
            print(Fore.RED + f"🚨 Phát hiện khuôn mặt giả! | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")
        elif identity == "Unknown":
            print(Fore.YELLOW + f"❓ Không nhận diện được | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")
        else:
            print(Fore.GREEN + f"✅ Nhận diện: {identity} | Thật: {is_real} | Độ tin cậy: {result['confidence']} | Thời gian: {result['timestamp']}")

        # Gửi lên Kafka
        producer.send("results", result)
        print(Style.DIM + f"📤 Đã gửi kết quả lên Kafka: {result}")

    # Hiển thị video có bbox + label
    cv2.imshow("Consumer - Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

producer.close()
cv2.destroyAllWindows()
