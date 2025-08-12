import os
from dotenv import load_dotenv

load_dotenv()

CLOUDINARY_CONFIG = {
    "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
    "api_key": os.getenv("CLOUDINARY_API_KEY"),
    "api_secret": os.getenv("CLOUDINARY_API_SECRET"),
    "secure": True,
}

MQTT_BROKER = os.getenv("MQTT_BROKER")
MQTT_PORT = int(os.getenv("MQTT_PORT"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC")

MODEL_DIR = os.getenv("MODEL_DIR")
MODEL_NAME = os.getenv("MODEL_NAME")
DEVICE_ID = int(os.getenv("DEVICE_ID"))
API_URL = os.getenv("API_URL")

COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", 0.6))
FAKE_UPLOAD_INTERVAL = int(os.getenv("FAKE_UPLOAD_INTERVAL", 10))
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "embeddings/embeddings.pkl")
