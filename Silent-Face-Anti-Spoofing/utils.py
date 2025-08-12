import cv2
import threading
import queue
import cloudinary.uploader
from datetime import datetime
import requests
import time
import json
import os
import numpy as np

""" 
Import các thư viện cần thiết:
- cv2: thư viện xử lý ảnh/opencv
- threading, queue: để xử lý đa luồng và hàng đợi
- cloudinary.uploader: để upload ảnh lên Cloudinary (dịch vụ lưu trữ đám mây)
- datetime: xử lý thời gian
- requests: gửi HTTP request
- time: xử lý thời gian (delay, sleep)
- json, os: thao tác file, dữ liệu
- numpy: xử lý mảng, toán học
"""

fake_face_queue = queue.Queue()
send_buffer = []
send_lock = threading.Lock()

"""
- fake_face_queue: hàng đợi chứa các frame (ảnh) có face giả cần upload.
- send_buffer: bộ đệm chứa dữ liệu cần gửi lên server.
- send_lock: khóa để đồng bộ khi thao tác với send_buffer tránh race condition trong đa luồng.
"""

def upload_fake_face_to_cloudinary(frame):
    """
    Hàm upload ảnh frame (toàn khung chứa face giả) lên Cloudinary.
    - Mã hóa frame sang định dạng jpg.
    - Upload ảnh lên folder "fake_faces_fullframe" với tên file là thời gian hiện tại.
    - In ra URL ảnh đã upload.
    - Trả về URL ảnh để dùng nếu cần.
    """
    _, img_encoded = cv2.imencode('.jpg', frame)  # Encode ảnh thành .jpg dạng nhị phân
    response = cloudinary.uploader.upload(
        img_encoded.tobytes(),
        folder="fake_faces_fullframe",
        public_id=f"fakeframe_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        resource_type="image"
    )
    print(f"Ảnh toàn khung chứa face giả đã được upload: {response.get('secure_url')}")
    return response.get("secure_url")

def fake_face_uploader_worker():
    """
    Luồng (thread) chuyên lấy frame từ hàng đợi fake_face_queue và gọi hàm upload lên Cloudinary.
    - Chạy vô hạn (while True).
    - Nếu lấy được frame == None, thoát vòng lặp (dừng thread).
    - Bắt lỗi upload nếu có exception.
    """
    while True:
        frame = fake_face_queue.get()
        if frame is None:
            break
        try:
            upload_fake_face_to_cloudinary(frame)
        except Exception as e:
            print(f"Lỗi khi upload ảnh face giả: {e}")

def send_data_batch_worker(api_url, send_interval=3):
    """
    Luồng gửi dữ liệu batch lên server theo thời gian định kỳ.
    - Mỗi send_interval (mặc định 3s), lấy bản sao send_buffer rồi xóa send_buffer ban đầu (đồng bộ với send_lock).
    - Gửi từng record (bản ghi) trong buffer copy lên server qua POST request.
    - Kiểm tra status_code trả về để in thông báo gửi thành công hay lỗi.
    - Bắt lỗi nếu gửi request bị lỗi.
    """
    while True:
        time.sleep(send_interval)
        with send_lock:
            buffer_copy = send_buffer.copy()
            send_buffer.clear()
        for record in buffer_copy:
            try:
                response = requests.post(api_url, json=record)
                if response.status_code in [200, 201]:
                    print(f"Gửi thành công: {record['student_id']} lúc {record['timestamp']}")
                else:
                    print(f"Lỗi gửi dữ liệu: HTTP {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Lỗi khi gửi dữ liệu lên server: {e}")


def is_real_face(frame, bbox, image_cropper, model_test, model_dir, model_name, scale, w_input, h_input):
    """
    Hàm kiểm tra một face có phải là "thật" hay "giả" (spoofing).
    - frame: ảnh gốc.
    - bbox: bounding box (x1, y1, x2, y2) vùng mặt trong frame.
    - image_cropper: đối tượng crop ảnh.
    - model_test: model dự đoán face giả thật.
    - model_dir, model_name: đường dẫn và tên model.
    - scale, w_input, h_input: các tham số chuẩn hóa ảnh đầu vào cho model.
    
    Thao tác:
    - Chuyển bbox sang định dạng (x, y, w, h).
    - Crop vùng ảnh theo bbox, scale.
    - Dự đoán spoofing qua model.
    - Lấy label dự đoán (1 = thật, 0 = giả).
    - Tính confidence (độ tin cậy) dự đoán.
    - Trả về True nếu là face thật, False nếu giả, cùng confidence.
    """
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
    prediction = model_test.predict(spoof_input, os.path.join(model_dir, model_name))
    label = np.argmax(prediction)
    confidence = prediction[0][label] / 2
    return label == 1, confidence

def recognize_face(face_embedding, embeddings, student_ids, cosine_threshold):
    """
    Hàm nhận diện khuôn mặt bằng cách tính tương đồng (cosine similarity) giữa embedding của face cần nhận diện và database embeddings.
    - face_embedding: vector embedding khuôn mặt cần nhận diện.
    - embeddings: mảng embedding đã lưu.
    - student_ids: danh sách ID tương ứng với embeddings.
    - cosine_threshold: ngưỡng độ tương đồng để xác định face trùng.
    
    Thao tác:
    - Chuẩn hóa vector face_embedding.
    - Tính dot product (cosine similarity) với tất cả embeddings.
    - Lấy index có similarity cao nhất.
    - Nếu similarity >= threshold, trả về student_id tương ứng và giá trị similarity.
    - Nếu không, trả về "Unknown" và similarity.
    """
    query = face_embedding.astype(np.float32)
    # Chuyển face_embedding sang dạng số thực 32 bit

    query /= np.linalg.norm(query)
    # Chuẩn hóa vector query để có độ dài bằng 1

    sims = np.dot(embeddings, query)
    # Tính độ giống (cosine similarity) giữa query và tất cả embeddings

    idx = int(np.argmax(sims))
    # Tìm vị trí embedding giống query nhất

    sim = float(sims[idx])
    # Lấy giá trị độ giống cao nhất

    if sim >= cosine_threshold:
        # Nếu độ giống đủ lớn thì trả về ID và điểm giống
        return student_ids[idx], sim

    # Ngược lại trả về Unknown và điểm giống cao nhất
    return "Unknown", sim

    # query = face_embedding.astype(np.float32)
    # query /= np.linalg.norm(query)
    # sims = np.dot(embeddings, query)
    # idx = int(np.argmax(sims))
    # sim = float(sims[idx])
    # if sim >= cosine_threshold:
    #     return student_ids[idx], sim
    # return "Unknown", sim

def send_data_batch(send_buffer, send_lock, api_url, send_interval):
    """
    Hàm gửi dữ liệu batch lên server tương tự send_data_batch_worker, có thể dùng cho thread hoặc gọi trực tiếp.
    - Cơ chế tương tự: chờ send_interval rồi gửi từng record trong send_buffer.
    - Đồng bộ truy cập với send_lock.
    - In log gửi thành công hoặc lỗi.
    """
    while True:
        time.sleep(send_interval)
        with send_lock:
            buffer_copy = send_buffer.copy()
            send_buffer.clear()

        for record in buffer_copy:
            try:
                response = requests.post(api_url, json=record)
                if response.status_code in [200, 201]:
                    print(f"Gửi thành công: {record['name']} lúc {record['timestamp']}")
                else:
                    print(f"Lỗi gửi: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Lỗi khi gửi dữ liệu lên server: {e}")

def draw_label(frame, bbox, label_text, color):
    """
    Vẽ bounding box và label lên ảnh.
    - frame: ảnh gốc.
    - bbox: tọa độ (x1, y1, x2, y2) để vẽ hình chữ nhật.
    - label_text: chuỗi text để hiển thị trên ảnh (ví dụ: tên người, trạng thái).
    - color: màu chữ nhật và text.
    """
    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
    cv2.putText(frame, label_text, (bbox[0], bbox[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
