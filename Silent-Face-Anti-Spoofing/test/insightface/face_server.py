# import socket
# import struct
# import cv2
# import numpy as np

# server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# server_socket.bind(("0.0.0.0", 9999))
# server_socket.listen(1)
# print("[INFO] Server đang chờ kết nối...")

# conn, addr = server_socket.accept()
# print(f"[INFO] Đã kết nối từ {addr}")

# try:
#     while True:
#         # Nhận kích thước ảnh (4 byte)
#         raw_size = conn.recv(4)
#         if not raw_size:
#             print("[WARNING] Không nhận được kích thước ảnh.")
#             break

#         img_size = struct.unpack("I", raw_size)[0]
#         if img_size <= 0 or img_size > 10**7:
#             print(f"[ERROR] Kích thước ảnh không hợp lệ: {img_size}")
#             break

#         # Nhận dữ liệu ảnh
#         img_data = b''
#         while len(img_data) < img_size:
#             packet = conn.recv(img_size - len(img_data))
#             if not packet:
#                 print("[WARNING] Mất kết nối trong khi nhận ảnh.")
#                 break
#             img_data += packet

#         if len(img_data) < img_size:
#             print("[WARNING] Nhận thiếu dữ liệu ảnh, bỏ qua frame.")
#             continue

#         # Giải mã ảnh
#         np_arr = np.frombuffer(img_data, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

#         if frame is None:
#             print("[ERROR] Không giải mã được ảnh, bỏ qua.")
#             continue

#         # Hiển thị ảnh
#         cv2.imshow("Server View", frame)

#         # Gửi phản hồi
#         conn.sendall("Ảnh đã nhận và xử lý.".encode())

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             print("[INFO] Người dùng nhấn 'q', thoát.")
#             break

# except Exception as e:
#     print(f"[ERROR] Server gặp lỗi: {e}")

# finally:
#     conn.close()
#     server_socket.close()
#     cv2.destroyAllWindows()
#     print("[INFO] Đã đóng server.")

import cv2
import numpy as np
import onnxruntime

# === 1. Load model ===
session = onnxruntime.InferenceSession("mobilefacenet.onnx", providers=["CPUExecutionProvider"])

# === 2. Hàm tiền xử lý ===
def preprocess(img):
    img = cv2.resize(img, (112, 112))
    img = img.astype(np.float32)
    img = (img - 127.5) / 128.0
    img = np.transpose(img, (2, 0, 1))
    return np.expand_dims(img, axis=0)

# === 3. Lấy embedding từ ảnh ===
def get_embedding(img_face):
    input_blob = preprocess(img_face)
    inputs = {session.get_inputs()[0].name: input_blob}
    output = session.run(None, inputs)[0]
    return output[0] / np.linalg.norm(output[0])  # chuẩn hóa vector

# === 4. Load ảnh gốc đã lưu sẵn ===
ref_img = cv2.imread("ducanh.jpg")  # ảnh bạn đã có trước
ref_embedding = get_embedding(ref_img)

# === 5. Mở camera và so sánh ảnh realtime ===
cap = cv2.VideoCapture(0)
print("📷 Mở camera... Nhấn 'q' để thoát")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Dùng Haar cascade để phát hiện khuôn mặt
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        if face.shape[0] < 112 or face.shape[1] < 112:
            continue

        emb = get_embedding(face)
        similarity = np.dot(ref_embedding, emb)

        label = "Matched" if similarity > 0.6 else "Not matched"
        color = (0, 255, 0) if similarity > 0.6 else (0, 0, 255)

        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        cv2.putText(frame, f"{label} ({similarity:.2f})", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    cv2.imshow("Face Verification", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
