import cv2
import os

# Hàm để chụp và lưu ảnh với tên file dựa trên tên được nhập
def capture_images(name):
    # Tạo thư mục "images" nếu chưa tồn tại
    if not os.path.exists('images'):
        os.makedirs('images')
    
    # Tạo thư mục bên trong "images" với tên là giá trị nhập vào
    folder_path = f'images/{name}'
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Mở webcam (0 là camera mặc định)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Không thể mở camera.")
        return

    num_images = 0
    max_images = 10  # Chụp 20 ảnh (đánh số từ 0-19)
    
    while True:
        ret, frame = cap.read()  # Đọc khung hình từ webcam
        
        if not ret:
            print("Không thể nhận diện khung hình.")
            break

        # Hiển thị khung hình hiện tại
        cv2.imshow('Chụp ảnh (nhấn c để chụp, q để thoát)', frame)

        # Lắng nghe sự kiện phím
        key = cv2.waitKey(1) & 0xFF

        if key == ord('c'):  # Nhấn phím 'c' để chụp ảnh
            file_name = f"{folder_path}/{num_images}.png"  # Đặt tên file và lưu vào thư mục đã tạo
            cv2.imwrite(file_name, frame)  # Lưu ảnh vào file
            
            print(f"Đã lưu: {file_name}")
            
            num_images += 1
            if num_images > max_images:
                print(f"Đã chụp đủ {max_images + 1} ảnh.")  # Chụp đủ từ 0 đến 20 (21 ảnh)
                break

        elif key == ord('s'):  # Nhấn phím 'q' để thoát
            print("Thoát chương trình.")
            break

    # Giải phóng camera và đóng cửa sổ
    cap.release()
    cv2.destroyAllWindows()

# Yêu cầu người dùng nhập tên
name_input = input("Nhập tên cho bộ ảnh: ")
capture_images(name_input)



























# import cv2
# import os
# import torch
# from ultralytics import YOLO
# import sys
# import logging
# logging.getLogger("ultralytics").setLevel(logging.WARNING)

# torch.set_printoptions(profile="default") 

# # Load mô hình YOLOv8 đã được huấn luyện để nhận diện khuôn mặt
# # model = YOLO("yolov11n-face.pt")  # Bạn có thể thay bằng bản lớn hơn như yolov8m-face.pt

# # Tắt log của YOLO
# sys.stdout = open(os.devnull, 'w')  # Tắt toàn bộ stdout
# model = YOLO("yolov11n-face.pt", verbose=False)
# sys.stdout = sys.__stdout__  # Bật lại stdout


# # Hàm xử lý ảnh trước khi lưu
# def preprocess_image(frame, bbox):
#     x1, y1, x2, y2 = map(int, bbox)  # Chuyển tọa độ về số nguyên
#     face = frame[y1:y2, x1:x2]  # Cắt khuôn mặt

#     # Kiểm tra kích thước tránh lỗi
#     if face.shape[0] == 0 or face.shape[1] == 0:
#         return None  

#     # Làm mịn ảnh để giảm nhiễu
#     face = cv2.bilateralFilter(face, d=10, sigmaColor=50, sigmaSpace=50)

#     # Chuyển ảnh sang RGB (OpenCV mặc định là BGR)
#     face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)

#     # Resize về kích thước chuẩn (150x150)
#     face = cv2.resize(face, (150, 150))

#     return face

# # Hàm để chụp và lưu ảnh
# def capture_images(name):
#     if not os.path.exists('images'):
#         os.makedirs('images')
    
#     folder_path = f'images/{name}'
#     if not os.path.exists(folder_path):
#         os.makedirs(folder_path)
    
#     cap = cv2.VideoCapture(0)
    
#     if not cap.isOpened():
#         print("Không thể mở camera.")
#         return

#     num_images = 0
#     max_images = 10
    
#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             print("Không thể nhận diện khung hình.")
#             break

#         # Dùng YOLO phát hiện khuôn mặt
#         results = model(frame)

#         # Lấy danh sách bounding boxes của các khuôn mặt
#         for result in results:
#             for box in result.boxes.xyxy:
#                 x1, y1, x2, y2 = map(int, box.tolist())

#                 # Vẽ khung chữ nhật quanh khuôn mặt
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

#         cv2.imshow('Chụp ảnh (Nhấn C để chụp, Q để thoát)', frame)

#         key = cv2.waitKey(1) & 0xFF

#         if key == ord('c'):
#             if len(results[0].boxes) > 0:  # Chỉ lưu nếu phát hiện khuôn mặt
#                 processed_face = preprocess_image(frame, results[0].boxes[0].xyxy[0])
#                 if processed_face is not None:
#                     file_name = f"{folder_path}/{num_images}.png"
#                     cv2.imwrite(file_name, processed_face)
#                     print(f"Đã lưu: {file_name}")
#                     num_images += 1

#                 if num_images >= max_images:
#                     print(f"Đã chụp đủ {max_images} ảnh.")
#                     break
#             else:
#                 print("Không tìm thấy khuôn mặt, hãy thử lại.")

#         elif key == ord('q'):
#             print("Thoát chương trình.")
#             break

#     cap.release()
#     cv2.destroyAllWindows()

# # Yêu cầu nhập tên
# name_input = input("Nhập tên cho bộ ảnh: ")
# capture_images(name_input)
