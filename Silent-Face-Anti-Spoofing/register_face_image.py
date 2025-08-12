import cv2
import os

# Hàm chụp ảnh và lưu với tên thư mục dựa trên tên người dùng nhập
def capture_image(name):
    # Kiểm tra nếu chưa có thư mục 'K15-CNTT4' thì tạo mới
    if not os.path.exists('K15-CNTT4'):
        os.makedirs('K15-CNTT4')

    # Tạo thư mục con trong 'K15-CNTT4' với tên người dùng nhập
    folder_path = f'K15-CNTT4/{name}'
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Mở camera mặc định (0 là camera mặc định)
    cap = cv2.VideoCapture(0)
    
    # Nếu không mở được camera thì báo lỗi và thoát hàm
    if not cap.isOpened():
        print("Cannot open the camera.")
        return

    image_count = 0          # Đếm số ảnh đã chụp
    max_images = 1           # Số ảnh tối đa sẽ chụp (ở đây chỉ chụp 1 ảnh)

    while True:
        ret, frame = cap.read()  # Đọc từng frame từ camera
        
        # Nếu không lấy được frame thì thông báo lỗi và dừng
        if not ret:
            print("Failed to grab frame.")
            break

        # Hiển thị ảnh realtime lên cửa sổ với tiêu đề hướng dẫn
        cv2.imshow('Press C to capture, S to exit', frame)

        # Đợi người dùng nhấn phím, lấy mã phím 8 bit
        key = cv2.waitKey(1) & 0xFF

        # Nếu nhấn phím 'c' thì chụp ảnh
        if key == ord('c'):
            # Đặt tên file theo dạng 'thư_mục_con/số_ảnh.png'
            file_name = f"{folder_path}/{image_count}.png"
            # Lưu ảnh hiện tại ra file
            cv2.imwrite(file_name, frame)
            
            print(f"Saved: {file_name}")
            
            image_count += 1         # Tăng số ảnh đã chụp lên 1
            # Nếu đã đủ số ảnh cần chụp thì dừng vòng lặp
            if image_count >= max_images:
                print(f"Captured {max_images} image(s).")
                break

        # Nếu nhấn phím 's' thì thoát chương trình
        elif key == ord('s'):
            print("Exiting the program.")
            break

    # Giải phóng camera và đóng tất cả cửa sổ hiển thị
    cap.release()
    cv2.destroyAllWindows()

# Yêu cầu người dùng nhập tên để tạo thư mục lưu ảnh
name_input = input("Enter a name for the image set: ")
# Gọi hàm chụp ảnh với tên đã nhập
capture_image(name_input)


