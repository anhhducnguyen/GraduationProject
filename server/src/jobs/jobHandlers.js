const db = require('../../config/database'); // hoặc knex/sequelize của bạn
const { broadcast } = require('../../config/ws-server');

const updateRoomStatus = async (job) => {
    const { room_id, status } = job.data;

    await db('examrooms')
        .where({ room_id })
        .update({ status });

    console.log(`Phòng ${room_id} → ${status}`);

    // Gửi WebSocket event
    broadcast({
        type: "ROOM_STATUS_UPDATED",
        payload: { room_id, status },
    });
};

module.exports = {
    updateRoomStatus,
};
