const app = require("./app");
const http = require("http");
const { initSocket } = require("../config/socket");
const YAML = require('yamljs');
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');

const startRoomStatusCron = require('../src/cron/updateRoomStatus');
const startScheduleStatusCron = require('../src/cron/updateScheduleStatus');

const PORT = 5000;

// Cài cors cho swagger và api-docs nếu cần
app.use(cors({ origin: 'http://localhost:5174' }));

// Swagger
const swaggerDocument = YAML.load('src/docs/auth-service-api.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Tạo server http từ app
const server = http.createServer(app);

// Khởi tạo websocket
const io = initSocket(server);

// Chạy cron job
startRoomStatusCron();
startScheduleStatusCron();

// Khởi động server
server.listen(PORT, () => {
  console.log(`Auth service running on port http://localhost:${PORT}`);
  console.log(`Auth service - Api docs available at http://localhost:${PORT}/api-docs`);
});

// const startRoomStatusCron = require('../src/cron/updateRoomStatus');
// startRoomStatusCron();
// const startScheduleStatusCron = require('../src/cron/updateScheduleStatus');
// startScheduleStatusCron();
// const app = require("./app");
// const PORT = 5000;
// const YAML = require('yamljs');
// const cors = require('cors');

// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = YAML.load('src/docs/auth-service-api.yaml');

// const http = require("http");
// const { initSocket } = require("../config/socket");

// const server = http.createServer(app);
// const io = initSocket(server);

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use(cors({
//   origin: 'http://localhost:5174'
// }));

// app.use((req, res) => {
//   res.status(404).json({
//       message: "Page not found"
//   });
// });

// // Chạy server HTTP, không phải app
// server.listen(PORT, () => {
//   console.log(`Auth service running on port http://localhost:${PORT}`);
//   console.log(`Auth service - Api docs available at http://localhost:${PORT}/api-docs`);
// });
