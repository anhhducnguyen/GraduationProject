const startRoomStatusCron = require('../src/cron/updateRoomStatus');
startRoomStatusCron();
const startScheduleStatusCron = require('../src/cron/updateScheduleStatus');
startScheduleStatusCron();
const app = require("./app");
const PORT = 5000;
const YAML = require('yamljs');
const cors = require('cors');

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load('src/docs/auth-service-api.yaml');

const http = require("http");
const { initSocket } = require("../config/socket");

const server = http.createServer(app);
const io = initSocket(server);

const { startWorker } = require("../src/queue/scheduler");
require("../config/ws-server"); // Khởi động WebSocket server
startWorker(); // Bắt đầu xử lý job

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({
  origin: 'http://localhost:5174'
}));

app.use((req, res) => {
  res.status(404).json({
      message: "Page not found"
  });
});

// Chạy server HTTP, không phải app
server.listen(PORT, () => {
  console.log(`Auth service running on port http://localhost:${PORT}`);
  console.log(`Auth service - Api docs available at http://localhost:${PORT}/api-docs`);
});
