// const cron = require('node-cron');
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');
// const db = require('../../config/database');

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const LOCAL_TZ = 'Asia/Ho_Chi_Minh';

// const updateRoomStatuses = async () => {
//     const nowVN = dayjs().tz(LOCAL_TZ);

//     try {
//         const schedules = await db('examschedules')
//             .select('schedule_id', 'room_id', 'start_time', 'end_time');

//         for (const schedule of schedules) {
//             const start = dayjs.utc(schedule.start_time).tz(LOCAL_TZ);
//             const end = dayjs.utc(schedule.end_time).tz(LOCAL_TZ);

//             let status;
//             if (nowVN.isBefore(start)) {
//                 status = 'scheduled';
//             } else if (nowVN.isAfter(end)) {
//                 status = 'available';
//             } else {
//                 status = 'in_use';
//             }

//             await db('examrooms')
//                 .where({ room_id: schedule.room_id })
//                 .update({ status });
//         }

//         console.log(`[${nowVN.format('HH:mm:ss')}] Trạng thái phòng đã được cập nhật.`);
//     } catch (error) {
//         console.error('Lỗi khi cập nhật trạng thái phòng:', error.message);
//     }
// };

// // Hàm để khởi động cron
// const startRoomStatusCron = () => {
//     cron.schedule('* * * * *', updateRoomStatuses);
// };

// module.exports = startRoomStatusCron;

const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween'); // ✅ đúng tên gói chính thức

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const db = require('../../config/database');


const LOCAL_TZ = 'Asia/Ho_Chi_Minh';

const updateRoomStatuses = async () => {
    const nowVN = dayjs().tz(LOCAL_TZ);

    try {
        const rooms = await db('examrooms').select('room_id');

        for (const room of rooms) {
            // Lấy toàn bộ lịch thi của phòng, trừ lịch đã hủy
            const schedules = await db('examschedules')
                .where({ room_id: room.room_id })
                .andWhereNot({ status: 'cancelled' })
                .orderBy('start_time', 'asc');

            let roomStatus = 'available'; // mặc định

            for (const schedule of schedules) {
                const start = dayjs.utc(schedule.start_time).tz(LOCAL_TZ);
                const end = dayjs.utc(schedule.end_time).tz(LOCAL_TZ);

                if (nowVN.isBetween(start, end)) {
                    roomStatus = 'in_use';
                    break; // đang thi, không cần xét thêm
                } else if (nowVN.isBefore(start)) {
                    roomStatus = 'scheduled';
                    break; // sắp thi, không cần xét thêm
                }
            }

            await db('examrooms')
                .where({ room_id: room.room_id })
                .update({ status: roomStatus });
        }

        console.log(`[${nowVN.format('HH:mm:ss')}] Trạng thái phòng đã được cập nhật.`);
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái phòng:', error.message);
    }
};

// Hàm để chạy cron job mỗi phút
const startRoomStatusCron = () => {
    cron.schedule('* * * * *', updateRoomStatuses);
    console.log('Cron job cập nhật trạng thái phòng thi đã khởi động.');
};

module.exports = startRoomStatusCron;
