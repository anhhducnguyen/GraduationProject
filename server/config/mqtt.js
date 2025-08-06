require('dotenv').config();

module.exports = {
  MQTT_BROKER: process.env.MQTT_BROKER,
  MQTT_TOPIC: process.env.MQTT_TOPIC,
};
