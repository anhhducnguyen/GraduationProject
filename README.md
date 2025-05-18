# Overview

## 🚀 Topic: **Xây dựng hệ thống xác thực danh tính sinh viên bằng nhận diện khuôn mặt trong khảo thí**

### 🌟 Giới thiệu

### Bản demo, Báo cáo và Slide: 

- [Demo]()

- [Report]()

- [Video demo]()

- [Video demo RestfulAPT]()


## 🛠️ Điều kiện tiên quyết
Trước khi bắt đầu, hãy đảm bảo rằng bạn đã cài đặt các điều kiện tiên quyết sau trên hệ thống của mình:

- [NodeJS](https://nodejs.org/en/download) (version 20.18.0 or higher)
- [MySQL](https://www.mysql.com/downloads/) (or any other supported database system)

## Cài đặt từng bước
#### **Step 1**: 🚀 Cài đặt NodeJS

- Đảm bảo `NodeJS` đã được cài đặt. Bạn có thể kiểm tra phiên bản của chúng bằng các lệnh sau:
  
```bash
node -v
```

#### **Step 2**: 📁 Sau khi cài đặt `NodeJS`, bạn có thể tải xuống dự án:

```bash
git clone https://github.com/anhhducnguyen/Face-Auth-Exam-System-v2.git
```


#### **Step 3**: ⚙️ Cấu hình lại tệp `.env` theo thông tin sau
- Nếu bạn muốn sử dụng `MySQL`, hãy cập nhật các biến `DB_`* trong tệp cấu hình `server\.env` như sau:
  
    ```php
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_db_password
    DB_NAME=exammanagement_do_an

    TOKEN_SECRET=your_token_secret

    EMAIL_USER=your_email@example.com	
    EMAIL_PASS=your_email_password

    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

    SESSION_SECRET=your_session_secret
    JWT_SECRET=your_jwt_secret
    ```


#### **Step 4**: Tạo cơ sở dữ liệu

#### **Step 5**: 🏃‍♂️ Sau khi dự án đã được tạo

```bash
cd Face-Auth-Exam-System-v2
```

```bash
cd server
npm run dev 
```

```bash
cd admin
npm run dev 
```

```bash
cd client
npm run dev 
```

See details at our [Wiki]()



