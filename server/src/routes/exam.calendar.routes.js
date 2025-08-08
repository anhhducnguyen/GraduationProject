/**
 QUẢN LÝ LỊCH THI
**/
const express = require('express');
const router = express.Router();
const {
  getExamSchedule,
  getAll,
  importSchedulesFromExcel
} = require('../controllers/exam.calendar.controller');
const db = require('../../config/database');
const upload = require('../middlewares/upload.xlsx.middleware');

// const {
//   authenticate,
// } = require("../../src/utils/auth/index");
// router.use(authenticate);
// const permission = require("../../src/constants/permission");

// Lấy danh sách lịch thi với cache
router.get(
  '/',
  // permission,
  getAll
);

// Lấy danh sách lịch thi của sinh viên với cache
const redisClient = require('../utils/redis'); // Redis instance
const pick = require('../utils/pick'); // Hàm lọc key từ object (giống Lodash pick)
const verifyJWT = require('../middlewares/authJWT');


// GET /exam-schedules
router.get('/sss', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id; // 👈 Đây là user_id bạn cần

    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', '_start', '_end']);

    const cacheKey = `examSchedules:${userId}:${JSON.stringify(filter)}:${JSON.stringify(options)}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await queryExamSchedules(userId, filter, options);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Truy vấn lịch thi có lọc & phân trang
const queryExamSchedules = async (userId, filter, options) => {
  const { sortBy = 'schedule_id:asc', limit = 100, page = 1, _start, _end } = options;
  const [sortField, sortOrder] = sortBy.split(':');

  const query = db('examschedules')
    .join('examrooms', 'examrooms.room_id', 'examschedules.room_id')
    .join('exam_attendance', 'exam_attendance.schedule_id', 'examschedules.schedule_id')
    .select(
      'examschedules.schedule_id',
      'examschedules.name_schedule',
      'examschedules.status',
      'examschedules.start_time',
      'examschedules.end_time',
      'examschedules.room_id',
      'examrooms.room_name'
    )
    .where('exam_attendance.student_id', userId); 

  if (filter.status) {
    query.where('examschedules.status', 'like', `%${filter.status}%`);
  }

  if (_start && _end) {
    query.whereBetween('examschedules.start_time', [_start, _end]);
  }

  const offset = (page - 1) * limit;

  const data = await query
    .orderBy(sortField, sortOrder)
    .limit(Number(limit))
    .offset(Number(offset));

  return {
    results: data,
    page: Number(page),
    limit: Number(limit),
  };
};

// Hiển thị chi tiết lịch thi
router.get(
  '/:id',
  getExamSchedule
);

// Thêm lịch thi từ file excel
router.post('/import', upload.single('file'), importSchedulesFromExcel);


module.exports = router;
