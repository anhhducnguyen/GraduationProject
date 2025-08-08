const db = require('../../config/database');
const xlsx = require('xlsx');
const { DateTime } = require('luxon');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TZ = 'Asia/Ho_Chi_Minh';

// Lấy lịch thi theo mã lịch thi
const getExamScheduleById = async (schedule_id) => {
    try {
        const examSchedule = await db('examschedules').where({ schedule_id }).first();
        return examSchedule;
    } catch (error) {
        throw new Error('Error fetching examschedules: ' + error.message);
    }
};

// Lấy danh sách lịch thi lọc bởi start_time and end_time
const queryExamSchedule = async (filter, options) => {
  const { sortBy = 'schedule_id:asc', limit = 100, page = 1, _start, _end } = options;
  const [sortField, sortOrder] = sortBy.split(':');

  const queryExamSchedule = db('examschedules')
    .join('examrooms', 'examrooms.room_id', 'examschedules.room_id')
    .select(
      'examschedules.schedule_id',
      'examschedules.start_time',
      'examschedules.end_time',
      'examschedules.room_id',
      'examschedules.status',
      'examschedules.name_schedule',
      'examrooms.room_name'
    );

  if (filter.status) {
    queryExamSchedule.where('status', 'like', `%${filter.status}%`);
  }

  if (_start && _end) {
    queryExamSchedule.whereBetween('start_time', [_start, _end]);
  }

  const offset = (page - 1) * limit;
  const data = await queryExamSchedule.orderBy(sortField, sortOrder).limit(limit).offset(offset);

  return {
    results: data,
    page,
    limit,
  };
};

// Import lịch thi từ file Excel
// const importFromExcel = async (filePath) => {
//   const workbook = xlsx.readFile(filePath);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rows = xlsx.utils.sheet_to_json(sheet);

//   const schedules = rows.map(row => ({
//     start_time: new Date(row.start_time),
//     end_time: new Date(row.end_time),
//     name_schedule: row.name_schedule,
//     status: row.status,
//     room_id: row.room_id,
//   }));

//   let inserted = 0;
//   let skipped = 0;

//   for (const schedule of schedules) {
//     const { start_time, end_time, name_schedule, status, room_id } = schedule;

//     if (!start_time || !end_time || !name_schedule || !status || !room_id) {
//       skipped++;
//       continue;
//     }

//     await db('examschedules').insert(schedule);
//     inserted++;
//   }

//   return { inserted, skipped };
// };
// function excelDateToJSDate(serial) {
//   const utc_days = Math.floor(serial - 25569);
//   const utc_value = utc_days * 86400; // seconds
//   const date_info = new Date(utc_value * 1000);

//   const fractional_day = serial - Math.floor(serial) + 0.0000001;
//   let total_seconds = Math.floor(86400 * fractional_day);

//   const seconds = total_seconds % 60;
//   total_seconds -= seconds;
//   const hours = Math.floor(total_seconds / (60 * 60));
//   const minutes = Math.floor((total_seconds - hours * 3600) / 60);

//   date_info.setHours(hours);
//   date_info.setMinutes(minutes);
//   date_info.setSeconds(seconds);

//   return date_info;
// }

// const importFromExcel = async (filePath) => {
//   const workbook = xlsx.readFile(filePath);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rows = xlsx.utils.sheet_to_json(sheet);

//   let inserted = 0;
//   let skipped = 0;

//   for (const row of rows) {
//     const { start_time, end_time, name_schedule, room_id } = row;

//     if (!start_time || !end_time || !name_schedule || !room_id) {
//       skipped++;
//       continue;
//     }

//     // Convert serial to Date if needed
//     const startJS = typeof start_time === 'number' ? excelDateToJSDate(start_time) : new Date(start_time);
//     const endJS = typeof end_time === 'number' ? excelDateToJSDate(end_time) : new Date(end_time);

//     // Chuyển giờ Việt Nam → UTC
//     const startUTC = dayjs.tz(startJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');
//     const endUTC = dayjs.tz(endJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');

//     // Tính trạng thái hiện tại
//     const nowVN = dayjs().tz(LOCAL_TZ);
//     const startVN = dayjs.tz(startJS, LOCAL_TZ);
//     const endVN = dayjs.tz(endJS, LOCAL_TZ);

//     let computedStatus;
//     if (nowVN.isBefore(startVN)) {
//       computedStatus = 'scheduled';
//     } else if (nowVN.isAfter(endVN)) {
//       computedStatus = 'completed';
//     } else {
//       computedStatus = 'in_progress';
//     }

//     try {
//       await db('examschedules').insert({
//         start_time: startUTC,
//         end_time: endUTC,
//         name_schedule,
//         room_id,
//         status: computedStatus,
//       });

//       inserted++;
//     } catch (error) {
//       skipped++;
//       console.error(`❌ Lỗi khi chèn lịch thi '${name_schedule}': ${error.message}`);
//     }
//   }

//   return { inserted, skipped };
// };

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400; // seconds
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds - hours * 3600) / 60);

  date_info.setUTCHours(hours);
  date_info.setUTCMinutes(minutes);
  date_info.setUTCSeconds(seconds);

  return date_info;
}

const importFromExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const { start_time, end_time, name_schedule, room_id } = row;

    if (!start_time || !end_time || !name_schedule || !room_id) {
      skipped++;
      continue;
    }

    // 1️⃣ Chuyển giá trị từ Excel thành JS Date
    const startJS = typeof start_time === 'number'
      ? excelDateToJSDate(start_time)
      : new Date(start_time);

    const endJS = typeof end_time === 'number'
      ? excelDateToJSDate(end_time)
      : new Date(end_time);

    // 2️⃣ Ép hiểu giờ này là giờ VN, rồi chuyển sang UTC string
    const startUTC = dayjs.tz(startJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');
    const endUTC = dayjs.tz(endJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');

    // 3️⃣ Tính trạng thái hiện tại (theo giờ VN)
    const nowVN = dayjs().tz(LOCAL_TZ);
    const startVN = dayjs.tz(startJS, LOCAL_TZ);
    const endVN = dayjs.tz(endJS, LOCAL_TZ);

    let computedStatus;
    if (nowVN.isBefore(startVN)) {
      computedStatus = 'scheduled';
    } else if (nowVN.isAfter(endVN)) {
      computedStatus = 'completed';
    } else {
      computedStatus = 'in_progress';
    }

    // 4️⃣ Lưu vào DB (UTC)
    try {
      await db('examschedules').insert({
        start_time: startUTC,
        end_time: endUTC,
        name_schedule,
        room_id,
        status: computedStatus,
      });

      inserted++;
    } catch (error) {
      skipped++;
      console.error(`❌ Lỗi khi chèn lịch thi '${name_schedule}': ${error.message}`);
    }
  }

  return { inserted, skipped };
};

// Hàm chuyển serial Excel → JavaScript Date
// function excelDateToJSDate(serial) {
//   const utc_days = Math.floor(serial - 25569);
//   const utc_value = utc_days * 86400; // seconds
//   const date_info = new Date(utc_value * 1000);

//   const fractional_day = serial - Math.floor(serial) + 0.0000001;
//   let total_seconds = Math.floor(86400 * fractional_day);

//   const seconds = total_seconds % 60;
//   total_seconds -= seconds;
//   const hours = Math.floor(total_seconds / (60 * 60));
//   const minutes = Math.floor((total_seconds - hours * 3600) / 60);

//   date_info.setHours(hours);
//   date_info.setMinutes(minutes);
//   date_info.setSeconds(seconds);

//   return date_info;
// }

// const importFromExcel = async (filePath) => {
//   const workbook = xlsx.readFile(filePath);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rows = xlsx.utils.sheet_to_json(sheet);

//   let inserted = 0;
//   let skipped = 0;

//   for (const row of rows) {
//     const { start_time, end_time, name_schedule, room_id } = row;

//     if (!start_time || !end_time || !name_schedule || !room_id) {
//       skipped++;
//       continue;
//     }

//     // Chuyển serial → Date nếu là số
//     const startJS = typeof start_time === 'number' ? excelDateToJSDate(start_time) : new Date(start_time);
//     const endJS = typeof end_time === 'number' ? excelDateToJSDate(end_time) : new Date(end_time);

//     // 🇻🇳 Chuyển giờ Việt Nam → 🌍 UTC
//     const startUTC = dayjs.tz(startJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');
//     const endUTC = dayjs.tz(endJS, LOCAL_TZ).utc().format('YYYY-MM-DD HH:mm:ss');

//     // Tính trạng thái hiện tại
//     const nowVN = dayjs().tz(LOCAL_TZ);
//     const startVN = dayjs.tz(startJS, LOCAL_TZ);
//     const endVN = dayjs.tz(endJS, LOCAL_TZ);

//     let computedStatus;
//     if (nowVN.isBefore(startVN)) {
//       computedStatus = 'scheduled';
//     } else if (nowVN.isAfter(endVN)) {
//       computedStatus = 'completed';
//     } else {
//       computedStatus = 'in_progress';
//     }

//     try {
//       await db('examschedules').insert({
//         name_schedule,
//         start_time: startUTC,
//         end_time: endUTC,
//         room_id,
//         status: computedStatus,
//       });

//       inserted++;
//     } catch (error) {
//       skipped++;
//       console.error(`❌ Lỗi khi chèn lịch thi '${name_schedule}': ${error.message}`);
//     }
//   }

//   return { inserted, skipped };
// };





module.exports = {
    getExamScheduleById,
    queryExamSchedule,
    importFromExcel,
};
