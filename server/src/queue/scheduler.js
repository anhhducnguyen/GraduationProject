const { Queue, Worker } = require("bullmq");
const Redis = require("ioredis");
const { updateRoomStatus } = require("../jobs/jobHandlers");

const connection = new Redis();

const roomQueue = new Queue("room-status", { connection });

// Tạo job: chạy vào thời điểm cụ thể
const scheduleRoomStatusUpdate = async ({ room_id, status, runAt }) => {
    await roomQueue.add("update", { room_id, status }, { delay: runAt - Date.now() });
};

const startWorker = () => {
    const worker = new Worker("room-status", updateRoomStatus, { connection });
};

module.exports = {
    scheduleRoomStatusUpdate,
    startWorker,
};
