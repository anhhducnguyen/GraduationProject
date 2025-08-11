face_recognition_config = {
    "model_path": "./resources/anti_spoof_models/2.7_80x80_MiniFASNetV2.pth",
    "threshold": 1.2,
    "faiss_path": "faiss_index/face_index.faiss",
    "ids_path": "faiss_index/student_ids.pkl",
    "api_url": "https://graduationproject-nx7m.onrender.com/api/v1/exam-attendance/",
    "device_id": 0,
    "send_interval": 3,
    "fake_upload_interval": 10
}
