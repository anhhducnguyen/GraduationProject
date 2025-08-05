const db = require('../../config/database');
const xlsx = require('xlsx');


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
const importFromExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const schedules = rows.map(row => ({
    start_time: new Date(row.start_time),
    end_time: new Date(row.end_time),
    name_schedule: row.name_schedule,
    status: row.status,
    room_id: row.room_id,
  }));

  let inserted = 0;
  let skipped = 0;

  for (const schedule of schedules) {
    const { start_time, end_time, name_schedule, status, room_id } = schedule;

    if (!start_time || !end_time || !name_schedule || !status || !room_id) {
      skipped++;
      continue;
    }

    await db('examschedules').insert(schedule);
    inserted++;
  }

  return { inserted, skipped };
};

module.exports = {
    getExamScheduleById,
    queryExamSchedule,
    importFromExcel,
};
