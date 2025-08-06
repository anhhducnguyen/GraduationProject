const express = require('express');
const router = express.Router();
const { 
    getAll,  
    getById,
    create,
    update,
    deleteExamAttendanceController,
    updateE,
    getByScheduleId,
    assignStudentToExam,
    getExamAttendances
  } = require('../controllers/exam.attendance.controller');
  
// Lấy danh sách điểm danh thi  
router.get(
    '/', 
    getExamAttendances
);

// router.put("/", updateE);

// Lấy điểm danh thi theo ID
router.get(
    '/:scheduleId', 
    getByScheduleId
);

// Thêm sinh viên vào lịch thi
router.post(
    '/assign', 
    assignStudentToExam
);

// Thực hiện điểm danh thi
router.post(
    '/',
    create
);

// router.put(
//     '/:id',
//     updateE
// );

router.delete(
    '/:id',
    deleteExamAttendanceController
)

module.exports = router;
