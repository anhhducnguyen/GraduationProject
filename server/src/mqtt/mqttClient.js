const mqtt = require('mqtt');
const { MQTT_BROKER, MQTT_TOPIC } = require('../../config/mqtt');
const handleAttendanceMessage = require('./handlers/handleAttendance');

function startMQTT() {
  const client = mqtt.connect(MQTT_BROKER);

  client.on('connect', () => {
    console.log('MQTT connected');
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('Lỗi subscribe:', err);
      } else {
        console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });

  client.on('message', async (topic, message) => {
    if (topic !== MQTT_TOPIC) return;

    try {
      const parsed = JSON.parse(message.toString());
      await handleAttendanceMessage(parsed);
    } catch (err) {
      console.error('Lỗi xử lý message:', err.message);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Client Error:', err.message);
  });
}

module.exports = startMQTT;
