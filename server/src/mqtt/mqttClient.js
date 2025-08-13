const mqtt = require('mqtt');
const { MQTT_BROKER, MQTT_TOPIC } = require('../../config/mqtt');
// Import hàm xử lý logic khi nhận message (ví dụ xử lý điểm danh)
const handleAttendanceMessage = require('./handlers/handleAttendance');

// Hàm khởi động MQTT client
function startMQTT() {
  // 1. Kết nối tới MQTT Broker bằng URL cấu hình
  const client = mqtt.connect(MQTT_BROKER);

  // 2. Lắng nghe sự kiện 'connect' khi client kết nối thành công
  client.on('connect', () => {
    console.log('MQTT connected');
    // Sau khi kết nối, đăng ký (subscribe) vào topic mong muốn
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('Lỗi subscribe:', err);
      } else {
        console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
      }
    });
  });

  // 3. Lắng nghe sự kiện 'message' khi có message đến từ broker
  client.on('message', async (topic, message) => {
    // Nếu message không đến từ topic cần xử lý thì bỏ qua
    if (topic !== MQTT_TOPIC) return;
    try {
      // Chuyển message từ Buffer sang string rồi parse sang object JSON
      const parsed = JSON.parse(message.toString());
      // Gọi hàm xử lý logic (ví dụ: điểm danh)
      await handleAttendanceMessage(parsed);
    } catch (err) {
      console.error('Lỗi xử lý message:', err.message);
    }
  });
  
  // 4. Lắng nghe sự kiện 'error' của MQTT client
  client.on('error', (err) => {
    console.error('MQTT Client Error:', err.message);
  });
}

module.exports = startMQTT;
