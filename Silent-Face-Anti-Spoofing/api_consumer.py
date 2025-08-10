from kafka import KafkaConsumer
import json
import requests

consumer = KafkaConsumer(
    "results",
    bootstrap_servers="127.0.0.1:9092",
    value_deserializer=lambda v: json.loads(v.decode("utf-8"))
)

API_URL = "https://graduationproject-nx7m.onrender.com/api/v1/exam-attendance/"

print("📥 Đang nghe kết quả từ Kafka...")
for msg in consumer:
    result = msg.value
    try:
        response = requests.post(API_URL, json=result)
        print("✅ Đã gửi API:", result, "Trạng thái:", response.status_code)
    except Exception as e:
        print("❌ Lỗi gửi API:", e)
