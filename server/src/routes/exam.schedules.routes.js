
const express = require('express');
const router = express.Router();

const {
    getExamSchedules,
    deletedExamSchedule,
    createExamSchedule,
    deleteStudentFromExamSchedule,
    getStudentsInExamSchedule,
    addStudentsToExamSchedule,
    updateExamSchedule
} = require('../controllers/exam.schedules.controller');
const db = require('../../config/database');

// const {
//     authenticate,
// } = require("../../src/utils/auth/index");
// router.use(authenticate);
// const permission = require("../../src/constants/permission");

/**
- Lấy danh sách lịch thi
- Thêm mới lịch thi 
**/
router.route('/')
    .get(
        // permission, 
        getExamSchedules)
    .post(
        // permission, 
        createExamSchedule);

/**
- Hiển thị thông tin chi tiết lịch thi theo mã lịch thi
- Cập nhật thông tin lịch thi theo mã lịch thi
- Xóa lịch thi theo mã lịch thi
**/
router.route('/:id')
    //     .get(permission, getExamRoom)
        .put(
            // permission, 
            updateExamSchedule)
    .delete(
        // permission, 
        deletedExamSchedule);

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await db('examschedules')
            .leftJoin('exam_attendance', 'exam_attendance.schedule_id', 'examschedules.schedule_id')
            .leftJoin('examrooms', 'examschedules.room_id', 'examrooms.room_id')
            .leftJoin('users', 'exam_attendance.student_id', 'users.id')
            .select(
                'examschedules.schedule_id',
                'examschedules.name_schedule',
                'examschedules.status',
                'examschedules.start_time',
                'examschedules.end_time',

                'examrooms.room_id',
                'examrooms.room_name',
                'examrooms.capacity',

                'users.id as student_id',
                'users.first_name',
                'users.last_name',

                'exam_attendance.is_present',
                'exam_attendance.updated_at'
            )
            .where('examschedules.schedule_id', id);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Exam schedule not found' });
        }

        const {
            schedule_id,
            name_schedule,
            status,
            start_time,
            end_time,
            room_id,    
            room_name,
            capacity
        } = rows[0];

        const students = rows
            .map(row => ({
                student_id: row.student_id,
                first_name: row.first_name,
                last_name: row.last_name,
                is_present: row.is_present,
                updated_at: row.updated_at
            }))
            .sort((a, b) => a.first_name.localeCompare(b.first_name));

        const response = {
            schedule_id,
            name_schedule,
            status,
            start_time,
            end_time,
            room: {
                room_id,
                room_name,
                capacity
            },
            students
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy danh sách sinh viên trong ca thi
router.get('/:id/students', getStudentsInExamSchedule);

// Xóa sinh viên khỏi ca thi
router.post('/:id/students/delete', deleteStudentFromExamSchedule);

// Thêm sinh viên vào ca thi bằng dữ liệu excel 
router.post('/:id/students/import-ids', addStudentsToExamSchedule);

module.exports = router;










