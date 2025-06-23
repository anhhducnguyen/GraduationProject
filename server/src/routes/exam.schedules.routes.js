
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
// router.get('/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const rows = await db('exam_attendance')
//             .join('examschedules', 'exam_attendance.schedule_id', 'examschedules.schedule_id')
//             .join('examrooms', 'examschedules.room_id', 'examrooms.room_id')
//             .join('users', 'exam_attendance.student_id', 'users.id')
//             .select(
//                 'examschedules.schedule_id',
//                 'examschedules.name_schedule',
//                 'examschedules.status',
//                 'examschedules.start_time',
//                 'examschedules.end_time',

//                 'examrooms.room_id',
//                 'examrooms.room_name',
//                 'examrooms.capacity',

//                 'users.id as student_id',
//                 'users.first_name',
//                 'users.last_name',

//                 'exam_attendance.is_present',
//                 'exam_attendance.updated_at'
//             )
//             .where('examschedules.schedule_id', id);

        

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'Exam schedule not found' });
//         }

//         const {
//             schedule_id,
//             name_schedule,
//             status,
//             start_time,
//             end_time,
//             room_id,    
//             room_name,
//             capacity
//         } = rows[0];

//         const students = rows
//             .map(row => ({
//                 student_id: row.student_id,
//                 first_name: row.first_name,
//                 last_name: row.last_name,
//                 is_present: row.is_present,
//                 updated_at: row.updated_at
//             }))
//             .sort((a, b) => a.first_name.localeCompare(b.first_name));

//         const response = {
//             schedule_id,
//             name_schedule,
//             status,
//             start_time,
//             end_time,
//             room: {
//                 room_id,
//                 room_name,
//                 capacity
//             },
//             students
//         };

//         res.status(200).json(response);
//         // res.status(200).json(rows)
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // const rows = await db('exam_attendance')
        //     .join('examschedules', 'exam_attendance.schedule_id', 'examschedules.schedule_id')
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
        // res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/v1/exam-schedules/:id/students
// router.get('/:id/students', async (req, res) => {
//     const schedule_id = req.params.id;

//     try {
//         const students = await db('exam_attendance')
//             .join('users', 'exam_attendance.student_id', '=', 'users.id')
//             .where('exam_attendance.schedule_id', schedule_id)
//             .select(
//                 'users.id as student_id',
//                 'users.first_name',
//                 'users.last_name',
//                 'exam_attendance.is_present',
//                 'exam_attendance.updated_at'
//             );

//         // res.status(200).json(students);
//         res.json({ results: students })
//     } catch (error) {
//         console.error('Error fetching students:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

router.get('/:id/students', async (req, res) => {
  const schedule_id = req.params.id;

  try {
    const students = await db('exam_attendance')
      .join('users', 'exam_attendance.student_id', '=', 'users.id')
      .where('exam_attendance.schedule_id', schedule_id)
      .orderBy('users.first_name', 'asc')
      .select(
        'users.id as student_id',
        'users.first_name',
        'users.last_name',
        'exam_attendance.is_present',
        'exam_attendance.updated_at'
      );

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
});

router.post('/:id/students/delete', async (req, res) => {
  const { studentIds } = req.body;
  const schedule_id = req.params.id;

  if (!Array.isArray(studentIds) || !schedule_id) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  try {
    await db('exam_attendance')
      .whereIn('student_id', studentIds)
      .andWhere('schedule_id', schedule_id)
      .del();

    res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    console.error("Lỗi xoá sinh viên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// POST /api/v1/exam-schedules/:id/students/import-ids
// router.post('/:id/students/import-ids', async (req, res) => {
//   const schedule_id = req.params.id;
//   const { studentIds } = req.body;
//   console.log('Received studentIds:', studentIds);

//   if (!Array.isArray(studentIds) || studentIds.length === 0) {
//     return res.status(400).json({ message: 'Danh sách mã sinh viên không hợp lệ' });
//   }

//   try {
//     const insertData = studentIds.map(student_id => ({
//       schedule_id,
//       student_id,
//       is_present: 0, // mặc định là vắng mặt
//     }));

//     // Lọc bỏ sinh viên đã tồn tại trong ca thi này
//     const existing = await db('exam_attendance')
//       .whereIn('student_id', studentIds)
//       .andWhere('schedule_id', schedule_id)
//       .select('student_id');

//     const existingIds = existing.map(e => e.student_id);
//     const filteredInsertData = insertData.filter(item => !existingIds.includes(item.student_id));

//     if (filteredInsertData.length === 0) {
//       return res.status(200).json({ message: 'Tất cả sinh viên đã có trong ca thi' });
//     }

//     await db('exam_attendance').insert(filteredInsertData);

//     res.status(201).json({
//       message: `Đã thêm ${filteredInsertData.length} sinh viên vào ca thi`,
//     });
//   } catch (error) {
//     console.error('Lỗi khi thêm sinh viên vào ca thi:', error);
//     res.status(500).json({ message: 'Lỗi server khi thêm sinh viên' });
//   }
// });
router.post('/:id/students/import-ids', async (req, res) => {
  const schedule_id = req.params.id;
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'Danh sách mã sinh viên không hợp lệ' });
  }

  try {
    // 1. Lọc ra student_id hợp lệ từ bảng users
    const existingUsers = await db('users')
      .whereIn('id', studentIds)
      .select('id');
    const validUserIds = existingUsers.map(user => user.id);

    // 2. Lọc bỏ các student đã có trong ca thi
    const existingInExam = await db('exam_attendance')
      .whereIn('student_id', validUserIds)
      .andWhere('schedule_id', schedule_id)
      .select('student_id');
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

    await db('exam_attendance').insert(insertData);

    res.status(201).json({
      message: `Đã thêm ${insertData.length} sinh viên vào ca thi`,
      invalidIds: studentIds.filter(id => !validUserIds.includes(id)), // optional: báo id không tồn tại
    });
  } catch (error) {
    console.error('Lỗi khi thêm sinh viên vào ca thi:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm sinh viên' });
  }
});




module.exports = router;










