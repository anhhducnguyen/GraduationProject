const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const db = require('../../config/database'); 

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TZ = 'Asia/Ho_Chi_Minh';

const updateScheduleStatuses = async () => {
    const nowVN = dayjs().tz(LOCAL_TZ);

    try {
        const schedules = await db('examschedules')
            .select('schedule_id', 'start_time', 'end_time', 'status');

        for (const schedule of schedules) {
            // Bỏ qua lịch đã huỷ
            if (schedule.status === 'cancelled') continue;

            const start = dayjs.utc(schedule.start_time).tz(LOCAL_TZ);
            const end = dayjs.utc(schedule.end_time).tz(LOCAL_TZ);

            let newStatus;

            if (nowVN.isBefore(start)) {
                newStatus = 'scheduled';
            } else if (nowVN.isAfter(end)) {
                newStatus = 'completed';
            } else {
                newStatus = 'in_progress';
            }

            // Chỉ cập nhật nếu khác trạng thái hiện tại
            if (schedule.status !== newStatus) {
                await db('examschedules')
                    .where({ schedule_id: schedule.schedule_id })
                    .update({ status: newStatus });

                console.log(`[${nowVN.format('HH:mm:ss')}] Lịch ${schedule.schedule_id} chuyển sang trạng thái: ${newStatus}`);
            }
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái lịch thi:', error.message);
    }
};

// Hàm để khởi động cron job mỗi phút
const startScheduleStatusCron = () => {
    cron.schedule('* * * * *', updateScheduleStatuses);
    console.log('Cron job cập nhật trạng thái lịch thi đã khởi động.');
};

module.exports = startScheduleStatusCron;
