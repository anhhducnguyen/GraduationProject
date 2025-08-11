import paho.mqtt.client as mqtt
import json
from datetime import datetime

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

client = mqtt.Client()
client.on_connect = on_connect
client.connect("localhost", 1883, 60)
client.loop_start()

payload = {
    "student_id": "test_student",
    "confidence": 0.5,
    "real_face": 1.0,
    "timestamp": datetime.now().isoformat()
}
result = client.publish("exam/attendance", json.dumps(payload))
if result.rc == mqtt.MQTT_ERR_SUCCESS:
    print("Test MQTT message sent successfully")
else:
    print("Failed to send MQTT message")

client.loop_stop()
client.disconnect()
