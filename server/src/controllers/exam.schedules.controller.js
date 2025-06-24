const {
    queryExamSchedules,
    countExamSchedules,
    deleteScheduleById,
    create,
    getStudentsInExamScheduleService,
    filterValidStudentIds,
    filterStudentsInExam,
    addStudentsToExamScheduleService,
    deleteStudentFromExamScheduleService
} = require('../services/exam.schedules.service');
const pick = require('../utils/pick');
const { parseQueryOptions } = require("../utils/queryParser");
const { clearExamScheduleCache } = require('../utils/cache');
const db = require('../../config/database');

// Lấy danh sách lịch thi 
const getExamSchedules = async (req, res) => {
    try {
        const filter = pick(req.query, ['name_schedule_like', 'status_like', 'start_time_like', 'end_time_like']);
        const { page, limit, sort } = parseQueryOptions(req.query);

        const count = await countExamSchedules();

        res.set('X-Total-Count', count);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        const result = await queryExamSchedules(filter, { page, limit, sort });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xóa lịch thi theo ID
const deletedExamSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExamSchedule = await deleteScheduleById(id);
        if (!deletedExamSchedule) {
            return res.status(404).json({ message: 'Exam schedule not found' });
        }

        await clearExamScheduleCache();

        return res.status(200).json({ message: 'Exam schedule deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo lịch thi mới
const createExamSchedule = async (req, res) => {
    const {
        start_time,
        end_time,
        name_schedule,
        status,
        room,
        // room_id 
    } = req.body;
    const room_id = room?.room_id;

    if (!room_id) {
        return res.status(400).json({ message: "room_id is required" });
    }
    try {
        const newExamSchedule = await create({
            start_time,
            end_time,
            name_schedule,
            status,
            room_id
        });

        await clearExamScheduleCache();

        return res.status(201).json(newExamSchedule);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh sach sinh viên trong ca thi
const getStudentsInExamSchedule = async (req, res) => {
  const schedule_id = req.params.id;

  try {
    const students = await getStudentsInExamScheduleService(schedule_id);
    res.json({
      results: students.map((student) => ({
        id: String(student.student_id),
        firstName: student.first_name,
        lastName: student.last_name,
        status: student.is_present === 1 ? 'present' : 'absent',
        confidence: 100, // tuỳ bạn có muốn truyền dữ liệu thật không
        checkInTime: student.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Thêm sinh viên vào ca thi
const addStudentsToExamSchedule = async (req, res) => {
  const schedule_id = req.params.id;
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'Danh sách mã sinh viên không hợp lệ' });
  }

  try {
    // 1. Lọc ra student_id hợp lệ từ bảng users
    const existingUsers = await filterValidStudentIds(studentIds);
    const validUserIds = existingUsers.map(user => user.id);

    // 2. Lọc bỏ các student đã có trong ca thi
    const existingInExam = await filterStudentsInExam(validUserIds, schedule_id);
    const alreadyInExamIds = existingInExam.map(row => row.student_id);
    const newStudentIds = validUserIds.filter(id => !alreadyInExamIds.includes(id));

    if (newStudentIds.length === 0) {
      return res.status(200).json({ message: 'Không có sinh viên nào hợp lệ để thêm' });
    }
    
    const insertData = newStudentIds.map(student_id => ({
      schedule_id,
      student_id,
      is_present: 0,
    }));

    await addStudentsToExamScheduleService(insertData);

    res.status(201).json({
      message: `Đã thêm ${insertData.length} sinh viên vào ca thi`,
      invalidIds: studentIds.filter(id => !validUserIds.includes(id)), // optional: báo id không tồn tại
    });
  } catch (error) {
    console.error('Lỗi khi thêm sinh viên vào ca thi:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm sinh viên' });
  }
};

// Xóa sinh viên khỏi ca thi
const deleteStudentFromExamSchedule = async (req, res) => {
  const { studentIds } = req.body;
  const schedule_id = req.params.id;

  if (!Array.isArray(studentIds) || !schedule_id) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  try {
    await deleteStudentFromExamScheduleService(studentIds, schedule_id);

    res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    console.error("Lỗi xoá sinh viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
    getExamSchedules,
    deletedExamSchedule,
    createExamSchedule,
    deleteStudentFromExamSchedule,
    getStudentsInExamSchedule,
    addStudentsToExamSchedule
};
