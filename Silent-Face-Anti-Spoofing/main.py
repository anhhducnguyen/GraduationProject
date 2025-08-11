from src.face_recognition_service import FaceRecognitionService
from src.config.cloudinary_config import config_cloudinary
from src.config.face_recognition_config import face_recognition_config

if __name__ == "__main__":
    config_cloudinary()
    service = FaceRecognitionService(face_recognition_config)
    service.loadModel()
    service.run()
