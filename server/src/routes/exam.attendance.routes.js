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
  
router.get(
    '/', 
    // getAll
    getExamAttendances
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


// // const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const db = require('../../config/database');
// const { console } = require('inspector');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//     },
// });
// app.use(express.json());

// io.on("connection", (socket) => {
//     console.log("Client connected");

//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//     });
// });

// // Gọi hàm này mỗi khi bạn cập nhật sinh viên
// function notifyStudentUpdate(student_id, is_present) {
//     io.emit("student_update", {
//         student_id,
//         is_present,
//     });
// }

// // Giả sử đây là API update is_present
// router.use(express.json());
// router.post("/update-student", async (req, res) => {
//     console.log(req.body);
    
//     const { student_id, is_present } = req.body;

//     console.log("Received update for student:", student_id, "is_present:", is_present);

//     // Kiểm tra dữ liệu đầu vào
//     if (!student_id || typeof is_present === 'undefined') {
//         return res.status(400).json({ success: false, message: "Missing student_id or is_present" });
//     }

//     try {
//         const result = await db('exam_attendance')
//             .where({ student_id })
//             .update({ is_present, updated_at: new Date() });

//         console.log("Rows updated:", result);

//         // Gửi thông báo tới frontend
//         notifyStudentUpdate(student_id, is_present);

//         return res.json({ success: true, updatedRows: result });
//     } catch (error) {
//         console.error("Error updating student:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error updating student: " + error.message
//         });
//     }
// });



module.exports = router;
