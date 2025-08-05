const {
    getAllExamAttendances,
    getExamAttendanceById,
    createExamAttendance,
    updateExamAttendance,
    deleteExamAttendance,
    queryExamAttendance,
    checkAttendance,
    getExamAttendanceByScheduleId,
    getCurrentExamSchedule,
    checkStudentExists,
    countExamAttendance,
    getCurrentExamSchedules
} = require('../services/exam.attendance.service');
const pick = require('../utils/pick');
const { activeConnections } = require('../../config/ws');
const { parseQueryOptions } = require("../utils/queryParser");
const { getIO } = require("../../config/socket");
const db = require("../../config/database");


// const { checkStudentExists, checkExamScheduleExists, getCurrentExamSchedule } = require('../clients/checkStudentExists');

const getExamAttendances = async (req, res) => {
    try {
        const filter = pick(req.query, ['room_name', 'room_name_like', 'capacity_like', 'status']);
        const { page, limit, sort } = parseQueryOptions(req.query);

        const count = await countExamAttendance();

        res.set('X-Total-Count', count);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        const result = await queryExamAttendance(filter, { page, limit, sort });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        //GET /api/users?name=John&role=admin&sortBy=name:asc&limit=10&page=2 
        const filter = pick(req.query, ['reported_by', 'reported_by']);
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const result = await queryExamAttendance(filter, options);
        res.send(result);
    } catch (err) {
        res.status(err.statusCode || 500).send({ message: err.message });
    }
};

const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await getExamAttendanceById(id);
        if (!data) {
            return res.status(404).json({ message: 'Điểm danh không tồn tại' });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// Lấy danh sách điểm danh theo ScheduleId 
const getByScheduleId = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const data = await getExamAttendanceByScheduleId(scheduleId);
        if (!data) {
            return res.status(404).json({ message: 'Điểm danh không tồn tại' });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const assignStudentToExam = async (req, res) => {
    try {
        console.log("req.body:", req.body);
        const { student_id, schedule_id } = req.body;
        console.log(`Gán sinh viên ${student_id} vào ca thi ${schedule_id}`);

        if (!student_id || !schedule_id) {
            return res.status(400).json({ message: "Thiếu mã sinh viên hoặc mã lịch thi" });
        }

        const [studentExists, attendanceExists] = await Promise.all([
            checkStudentExists(name),
            checkAttendance(name, schedule_id)
        ]);

        if (!studentExists) {
            console.log(`Sinh viên với ID ${name} không tồn tại trong hệ thống`);
            return res.status(404).json({ message: "Sinh viên không tồn tại" });
        }

        if (!attendanceExists) {
            return res.status(403).json({ message: "Sinh viên không có trong danh sách ca thi" });
        }

        if (attendanceExists.is_present === 1) {
            console.log(`Sinh viên với ID ${name} đã điểm danh trong ca thi này`);
            return res.status(409).json({ message: "Sinh viên đã điểm danh trong ca thi này" });
        }


        const attendance = await createExamAttendance({
            student_id,
            schedule_id,
            // is_present: null,          // Chưa điểm danh
            violation_id: null,
            reported_by: "1"
        });

        return res.status(201).json({
            message: "Sinh viên đã được gán vào ca thi",
            data: attendance
        });
    } catch (error) {
        console.error("Lỗi gán sinh viên:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// const create = async (req, res) => {
//     try {
//         const { name, confidence, real_face, timestamp } = req.body;

//         if (!name || confidence === undefined || !timestamp) {
//             return res.status(400).json({ message: "Thiếu dữ liệu" });
//         }

//         const schedule_id = await getCurrentExamSchedule();
//         console.log('Schedule ID:', schedule_id);

//         if (!schedule_id) {
//             return res.status(404).json({
//                 message: "Không có lịch thi nào đang diễn ra tại thời điểm hiện tại"
//             });
//         }

//         // Kiểm tra sinh viên và bản ghi điểm danh (đã được gán vào ca thi hay chưa)
//         const [studentExists, attendanceExists] = await Promise.all([
//             checkStudentExists(name),
//             checkAttendance(name, schedule_id)
//         ]);

//         if (!studentExists) {
//             console.log(`Sinh viên với ID ${name} không tồn tại trong hệ thống`);
//             return res.status(404).json({ message: "Sinh viên không tồn tại" });
//         }

//         if (!attendanceExists) {
//             console.log(`Sinh viên ${name} chưa được gán vào ca thi ${schedule_id}`);
//             return res.status(403).json({ message: "Sinh viên không có trong danh sách ca thi" });
//         }

//         if (attendanceExists.is_present === 1) {
//             console.log(`Sinh viên với ID ${name} đã điểm danh trong ca thi này`);
//             return res.status(409).json({ message: "Sinh viên đã điểm danh trong ca thi này" });
//         }

//         await db('exam_attendance')
//             .where({ student_id: name, schedule_id })
//             .update({
//                 is_present: real_face ? 1 : 0,
//                 confidence: confidence,
//                 real_face: real_face,
//                 updated_at: new Date(),
//                 violation_id: null,
//                 reported_by: 3
//             });

//         const attendanceData = await checkAttendance(name, schedule_id);

//         // Gửi cập nhật qua socket
//         const io = getIO();
//         io.emit("student_update", {
//             student_id: name,
//             is_present: real_face ? 1 : 0,
//             timestamp,
//             confidence,
//         });

//         return res.status(201).json({
//             message: "Điểm danh thành công",
//             data: attendanceData,
//         });

//     } catch (error) {
//         console.error("Lỗi khi lưu dữ liệu:", error.message);
//         return res.status(500).json({
//             message: "Lỗi khi lưu dữ liệu",
//             error: error.message
//         });
//     }
// };

const create = async (req, res) => {
    try {
        const { name, confidence, real_face, timestamp } = req.body;

        if (!name || confidence === undefined || !timestamp) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const MIN_CONFIDENCE = 0.67;
        if (confidence < MIN_CONFIDENCE) {
            return res.status(400).json({ message: `Xác thực không đủ độ tin cậy (confidence phải >= ${MIN_CONFIDENCE})` });
        }

        // Kiểm tra sinh viên có tồn tại không
        const studentExists = await checkStudentExists(name);
        if (!studentExists) {
            console.log(`❌ Sinh viên ${name} không tồn tại.`);
            return res.status(404).json({ message: "Sinh viên không tồn tại" });
        }

        // Lấy tất cả các ca thi đang diễn ra
        const schedules = await getCurrentExamSchedules();
        if (!schedules.length) {
            return res.status(404).json({
                message: "Không có lịch thi nào đang diễn ra tại thời điểm hiện tại"
            });
        }

        // Tìm ca thi mà sinh viên có trong danh sách
        let matchedSchedule = null;
        let attendanceExists = null;

        for (const schedule of schedules) {
            const attendance = await checkAttendance(name, schedule.schedule_id);
            if (attendance) {
                matchedSchedule = schedule;
                attendanceExists = attendance;
                break;
            }
        }

        if (!matchedSchedule) {
            console.log(`❌ Sinh viên ${name} không có trong bất kỳ ca thi nào đang diễn ra`);
            return res.status(403).json({
                message: "Sinh viên không có trong danh sách ca thi đang diễn ra"
            });
        }

        if (attendanceExists.is_present === 1) {
            console.log(`⚠️ Sinh viên ${name} đã điểm danh ca thi ${matchedSchedule.schedule_id}`);
            return res.status(409).json({
                message: "Sinh viên đã điểm danh trong ca thi này"
            });
        }

        // Tiến hành cập nhật điểm danh
        await db('exam_attendance')
            .where({ student_id: name, schedule_id: matchedSchedule.schedule_id })
            .update({
                is_present: real_face ? 1 : 0,
                confidence: confidence,
                real_face: real_face,
                updated_at: new Date(),
                violation_id: null,
                reported_by: 3
            });

        const attendanceData = await checkAttendance(name, matchedSchedule.schedule_id);

        // Gửi cập nhật qua socket
        // const io = getIO();
        // io.emit("student_update", {
        //     student_id: name,
        //     is_present: real_face ? 1 : 0,
        //     timestamp,
        //     confidence,
        // });

        return res.status(201).json({
            message: "Điểm danh thành công",
            data: attendanceData,
        });

    } catch (error) {
        console.error("❌ Lỗi khi lưu dữ liệu:", error.message);
        return res.status(500).json({
            message: "Lỗi khi lưu dữ liệu",
            error: error.message
        });
    }
};

// const updateE = async (req, res) => {
//     try {
//         const { name, confidence, real_face, timestamp } = req.body;

//         // Kiểm tra đầu vào
//         if (!name || confidence === undefined || !timestamp) {
//             return res.status(400).json({ message: "Thiếu dữ liệu" });
//         }

//         const schedule_id = await getCurrentExamSchedule();
//         console.log(`Current schedule_id: ${schedule_id}`);
//         if (!schedule_id) {
//             console.log(`Không có ca thi nào đang diễn ra`);
//             return res.status(400).json({ message: "Hiện tại không có ca thi đang diễn ra" });
//         }

//         // Kiểm tra sinh viên
//         const studentExists = await checkStudentExists(name);
//         console.log(`Check student exists: ${studentExists}`);

//         if (!studentExists) {
//             console.log(`Sinh viên với ID ${name} không tồn tại trong hệ thống`);
//             return res.status(404).json({ message: "Sinh viên không tồn tại" });
//         }

//         // Cập nhật bản ghi điểm danh nếu đã tồn tại
//         const attendanceExists = await checkAttendance(name, schedule_id);
//         // console.log(`Check attendance exists: ${attendanceExists}`);
//         console.log("Giá trị trả về từ checkAttendance:", attendanceExists);
//         console.log("Kiểu dữ liệu:", typeof attendanceExists);
//         if (!attendanceExists) {
//             console.log(`Chưa có bản ghi điểm danh cho sinh viên ${name}`);
//             return res.status(404).json({ message: "Chưa có bản ghi điểm danh để cập nhật" });
//         }

//         const updatedRows = await updateExamAttendance(name, schedule_id, {
//             is_present: real_face ? 1 : 0,
//             violation_id: null,
//             reported_by: 1001
//         });

//         if (updatedRows === 0) {
//             return res.status(500).json({ message: "Không thể cập nhật dữ liệu điểm danh" });
//         }

//         // Gửi dữ liệu real-time qua WebSocket
//         const updatedData = {
//             student_id: name,
//             schedule_id,
//             is_present: real_face ? 1 : 0,
//             reported_by: 1001
//         };

//         activeConnections.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify(updatedData));
//             }
//         });

//         res.status(200).json({
//             message: "Cập nhật điểm danh thành công",
//             data: updatedData
//         });
//     } catch (error) {
//         console.error("Lỗi khi cập nhật dữ liệu:", error.message);
//         res.status(500).json({ message: "Lỗi khi cập nhật dữ liệu", error: error.message });
//     }
// };

const update = async (req, res) => {
    const { id } = req.params;
    const {
        schedule_id,
        student_id,
        is_present,
        violation_id,
        reported_by
    } = req.body;
    try {
        const updatedData = await updateExamAttendance(id, {
            schedule_id,
            student_id,
            is_present,
            violation_id,
            reported_by
        });
        if (!updatedData) {
            return res.status(404).json({ message: 'Điểm danh không tồn tại' });
        }
        return res.status(200).json(updatedData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const deleteExamAttendanceController = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedData = await deleteExamAttendance(id);
        if (!deletedData) {
            return res.status(404).json({ message: 'Điểm danh không tồn tại' });
        }
        return res.status(200).json({ message: 'Xóa điểm danh thành công' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAll,
    getById,
    getByScheduleId,
    create,
    update,
    deleteExamAttendanceController,
    // updateE,
    assignStudentToExam,
    getExamAttendances,
};