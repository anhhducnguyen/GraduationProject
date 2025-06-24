## 🚀 Topic: **Building a student identity authentication system using facial recognition in testing**

## 🌟 Introduction

The topic is to build a student identity authentication system based on facial recognition technology for testing (at Phenikaa University) to ensure accuracy, transparency and safety in exams

### Demo, Report and Slide:

- [Demo](https://graduation-project-g77v.vercel.app/)

- [Report](https://drive.google.com/drive/folders/1McMyjsh_j6sM73bt2YO14lyoNT0qciUn?usp=sharing)
  
- [Video demo]()

- [Video demo RestfulAPT]()

## Author
<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f50ae9b1-d56b-4ab6-b8d5-577bffdc9f15" alt="Thành viên 1"  height="110" /></td>
    <!-- <td><img src="https://avatars.githubusercontent.com/u/140246455?v=4" alt="Thành viên 1"  height="110" /></td> -->
    <td><img src="https://avatars.githubusercontent.com/u/165644902?v=4" alt="Thành viên 2"  height="110" /></td>
  <!-- <td><img src="https://i.ytimg.com/vi/g5Vki3T8clw/maxresdefault.jpg" alt="Product"  height="110" /></td> -->
  </tr>

  <tr>
    <td>
        <a href="https://github.com/anhhducnguyen" target="_blank">Nguyen Duc Anh</a>
    </td>
    <td>Instructor:
      <a href="https://github.com/lethunguyen" target="_blank">TS. Nguyen Le Thu</a>
    </td>
  </tr>
</table>

## Framework

<table>
  <tr>
    <td><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5tzpUX3l9HzU3Mky3pyyEOvfvELBsmn3PlQ&s" alt="a"  height="110" /></td>
    <td><img src="https://avatars.githubusercontent.com/u/104967037?s=280&v=4" alt="b"  height="110" /></td>
    <td><img src="https://miro.medium.com/v2/resize:fit:1400/1*poaGV4iICp06Q-yTlA2g_g.png" alt="c"  height="110" /></td>
  </tr>

  <tr>
    <td>
        <a href="https://expressjs.com/" target="_blank">Express + NodeJS</a>
    </td>
    <td>
      <a href="https://refine.dev/" target="_blank">Refine</a>
    </td>
    <td>
      <a href="https://vite.dev/guide/" target="_blank">React + TypeScript + Vite</a>
    </td>
  </tr>
</table>

## Deployment Platforms (With Free Tier)

<table>
  <tr>
    <td><img src="https://logowik.com/content/uploads/images/vercel1868.jpg" alt="a" width="150" height="110" /></td>
    <td><img src="https://www.bvp.com/assets/uploads/2023/06/portfolio-render-updated.png" alt="b" width="150" height="110" /></td>
    <td><img src="https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2022/05/Aiven-logo.jpg" alt="c"  width="170" height="110" /></td>
    <td><img src="https://redis.io/wp-content/uploads/2024/04/Logotype.svg?auto=webp&quality=85,75&width=120" alt="c" width="150" height="110" /></td>
  </tr>

  <tr>
    <td>
        <a href="https://logowik.com/content/uploads/images/vercel1868.jpg" target="_blank">Vercel</a>
    </td>
    <td>
      <a href="https://github.com/user-attachments/assets/56d13bfd-ae77-4745-8cb2-7c9532576214" target="_blank">Render</a>
    </td>
    <td>
      <a href="https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2022/05/Aiven-logo.jpg" target="_blank">Aiven</a>
    </td>
     <td>
      <a href="https://redis.io/wp-content/uploads/2024/04/Logotype.svg?auto=webp&quality=85,75&width=120" target="_blank">Redis</a>
    </td>
  </tr>
</table>


## 🛠️ Prerequisites
Before you start, make sure you have the following prerequisites installed on your system:

- [NodeJS](https://nodejs.org/en/download) _(version 20.18.0 or higher)_
- [MySQL](https://www.mysql.com/downloads/) _(or any other supported database system)_
- [Python](https://www.python.org/) _(version 3.12.0 or higher)_
- [opencv_python](https://opencv.org/) _(version 4.10.0.84 or higher)_
- [dlib](https://github.com/davisking/dlib) _(here I got an error when trying `pip install dlib`, if you get an access error [Dlib_Windows_Python3.x](https://github.com/z-mahmud22/Dlib_Windows_Python3.x) to install manually following the instructions)_
- [face-recognition](https://github.com/ageitgey/face_recognition) _(version 1.3.0 or higher)_
- [Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) _(author: minivision-ai)_

## 🔧 Step-by-step installation
#### **Step 1**: 🚀 Install NodeJS

- Make sure `NodeJS` is installed. You can check their version with the following commands:

```bash
node -v
```

#### **Step 2**: 📁 After installing `NodeJS`, you can download the project:

```bash
git clone https://github.com/anhhducnguyen/Face-Auth-Exam-System-v2.git
```

#### **Step 3**: ⚙️ Reconfigure the `.env` file according to the following information
- If you want to use `MySQL`, update the `DB_`* variables in the `server\.env` configuration file as follows:
  
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


#### **Step 4**: <a href="#"><img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1.svg?logo=MySQL&logoColor=white"></a> Create the database

#### **Step 5**: 🏃‍♂️ Once the project has been created

```bash
cd Face-Auth-Exam-System-v2
```

```bash
cd server
npm install
npm run dev 
```

```bash
cd admin
npm install
npm run dev 
```

```bash
cd client
npm install
npm run dev 
```

```bash
cd Silent-Face-Anti-Spoofing
pip install -r requirements.txt
python main.py
```



See details at our [Issue](https://github.com/anhhducnguyen/Face-Auth-Exam-System-v2/issues/1)



