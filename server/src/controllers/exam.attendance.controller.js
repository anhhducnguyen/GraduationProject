const {
    getAllExamAttendances,
    getExamAttendanceById,
    createExamAttendance,
    updateExamAttendance,
    deleteExamAttendance,
    queryExamAttendance,
    checkAttendance,
    getExamAttendanceByScheduleId
} = require('../services/exam.attendance.services');
const pick = require('../utils/pick');
const { activeConnections } = require('../../config/ws');
// const { checkStudentExists, checkExamScheduleExists, getCurrentExamSchedule } = require('../clients/checkStudentExists');

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
            return res.status(404).json({ message: 'Exam attendance not found' });
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
            return res.status(404).json({ message: 'Exam attendance not found' });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const create = async (req, res) => {
    try {
        const { name, confidence, real_face, timestamp } = req.body;

        // Kiểm tra đầu vào
        if (!name || confidence === undefined || !timestamp) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const schedule_id = await getCurrentExamSchedule(); 
        if (!schedule_id) {
            console.log(`Không có ca thi nào đang diễn ra`);
            return res.status(400).json({ message: "Hiện tại không có ca thi đang diễn ra" });
        }

        // Kiểm tra sinh viên và điểm danh
        const [studentExists, attendanceExists] = await Promise.all([
            checkStudentExists(name),
            checkAttendance(name, schedule_id)
        ]);

        if (!studentExists) {
            console.log(`Sinh viên với ID ${name} không tồn tại trong hệ thống`);
            return res.status(404).json({ message: "Sinh viên không tồn tại" });
        }

        if (attendanceExists) {
            console.log(`Sinh viên với ID ${name} đã điểm danh trong ca thi này`);
            return res.status(409).json({ message: "Sinh viên đã điểm danh trong ca thi này" });
        }

        // Tạo bản ghi điểm danh mới
        const attendanceData = await createExamAttendance({
            schedule_id: schedule_id, // Ca thi tạm thời
            student_id: name,   // Tạm thời dùng 'name' làm ID sinh viên
            is_present: real_face ? 1 : 0,
            violation_id: null, // Có thể cập nhật nếu có vi phạm
            reported_by: 1001,  // Hoặc truyền thông tin nhận diện
        });

        // Gửi dữ liệu real-time qua WebSocket
        activeConnections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(attendanceData));
            }
        });

        res.status(201).json({
            message: "Dữ liệu đã được lưu vào CSDL",
            data: attendanceData
        });
    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error.message);
        res.status(500).json({ message: "Lỗi khi lưu dữ liệu", error: error.message });
    }
};

const updateE = async (req, res) => {
    try {
        const { name, confidence, real_face, timestamp } = req.body;

        // Kiểm tra đầu vào
        if (!name || confidence === undefined || !timestamp) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const schedule_id = await getCurrentExamSchedule(); 
        console.log(`Current schedule_id: ${schedule_id}`);
        if (!schedule_id) {
            console.log(`Không có ca thi nào đang diễn ra`);
            return res.status(400).json({ message: "Hiện tại không có ca thi đang diễn ra" });
        }

        // Kiểm tra sinh viên
        const studentExists = await checkStudentExists(name);
        console.log(`Check student exists: ${studentExists}`);
        
        if (!studentExists) {
            console.log(`Sinh viên với ID ${name} không tồn tại trong hệ thống`);
            return res.status(404).json({ message: "Sinh viên không tồn tại" });
        }

        // Cập nhật bản ghi điểm danh nếu đã tồn tại
        const attendanceExists = await checkAttendance(name, schedule_id);
        // console.log(`Check attendance exists: ${attendanceExists}`);
        console.log("Giá trị trả về từ checkAttendance:", attendanceExists);
        console.log("Kiểu dữ liệu:", typeof attendanceExists);
        if (!attendanceExists) {
            console.log(`Chưa có bản ghi điểm danh cho sinh viên ${name}`);
            return res.status(404).json({ message: "Chưa có bản ghi điểm danh để cập nhật" });
        }

        const updatedRows = await updateExamAttendance(name, schedule_id, {
            is_present: real_face ? 1 : 0,
            violation_id: null,
            reported_by: 1001
        });

        if (updatedRows === 0) {
            return res.status(500).json({ message: "Không thể cập nhật dữ liệu điểm danh" });
        }

        // Gửi dữ liệu real-time qua WebSocket
        const updatedData = {
            student_id: name,
            schedule_id,
            is_present: real_face ? 1 : 0,
            reported_by: 1001
        };

        activeConnections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(updatedData));
            }
        });

        res.status(200).json({
            message: "Cập nhật điểm danh thành công",
            data: updatedData
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật dữ liệu:", error.message);
        res.status(500).json({ message: "Lỗi khi cập nhật dữ liệu", error: error.message });
    }
};



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
            return res.status(404).json({ message: 'Exam attendance not found' });
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
            return res.status(404).json({ message: 'Exam attendance not found' });
        }
        return res.status(200).json({ message: 'Exam attendance deleted successfully' });
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
    updateE
};