
const express = require('express');
const router = express.Router();

const {
    getExamSchedules,
    deletedExamSchedule,
    createExamSchedule,
} = require('../controllers/exam.schedules.controller');
const db = require('../../config/database');

// const {
//     authenticate,
//     authorize
// } = require("../../../libs/auth/index");

// const ROLES = require("../../../libs/constants/roles");
// router.use(authenticate);
// const permission = authorize([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);

router.route('/')
    .get(
        // permission, 
        getExamSchedules)
    .post(
        // permission, 
        createExamSchedule);

router.route('/:id')
    //     .get(permission, getExamRoom)
    //     .put(permission, updateExamRoom)
    .delete(
        // permission, 
        deletedExamSchedule);

// router.get('/students/:byIdExamScheduleId', async (req, res) => {
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // const rows = await db('examschedules')

        const rows = await db('exam_attendance')
            .join('examschedules', 'exam_attendance.schedule_id', 'examschedules.schedule_id')
            .join('examrooms', 'examschedules.room_id', 'examrooms.room_id')
            .join('users', 'exam_attendance.student_id', 'users.id')
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
        // res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;










