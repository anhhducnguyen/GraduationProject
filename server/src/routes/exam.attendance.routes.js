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
    assignStudentToExam
  } = require('../controllers/exam.attendance.controller');
  
router.get(
    '/', 
    getAll
);

router.put("/", updateE);

router.get(
    '/:scheduleId', 
    // getById
    getByScheduleId
);

router.post(
    '/assign', 
    assignStudentToExam
);

router.post(
    '/',
    create
);

router.put(
    '/:id',
    updateE
);

router.delete(
    '/:id',
    deleteExamAttendanceController
)

module.exports = router;
