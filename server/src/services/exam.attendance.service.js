const db = require('../../config/database');
const dayjs = require('dayjs');
const { buildQuery } = require("../utils/queryBuilder");
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

// Lấy danh sách điểm danh kèm bộ lọc, tìm kiếm, phân trang.
const queryExamAttendance = async (filters = {}, options = {}) => {
    const query = buildQuery(db, 'exam_attendance', {
        filters,
        likeFilters: ['room_name_like', 'capacity_like'],
        exactFilters: ['room_name', 'capacity', 'status'],
        sort: options.sort,
        page: options.page,
        limit: options.limit,
    });

    const results = await query;

    const formatted = results.map(row => ({
        id: row.attendance_id,
        schedule_id: row.schedule_id,
        isPresent: row.is_present,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
            id: row.student_id,
            // room_name: row.room_name,
            // capacity: row.room_capacity
        }
    }));

    return formatted;
};

// Đếm số bản ghi phòng thi.
const countExamAttendance = async () => {
    const [{ count }] = await db('examrooms').count('* as count');
    return parseInt(count);
};

// Lấy toàn bộ dữ liệu điểm danh.
const getAllExamAttendances = async () => {
    try {
        const violations = await db('exam_attendance').select('*');
        return violations;
    } catch (error) {
        throw new Error('Error fetching exam_attendance: ' + error.message);
    }
};

// Lấy thông tin điểm danh theo ID.
const getExamAttendanceById = async (attendance_id) => {
    try {
        const violation = await db('exam_attendance').where({ attendance_id }).first();
        return violation;
    } catch (error) {
        throw new Error('Error fetching exam_attendance by ID: ' + error.message);
    }
}

// Lấy danh sách điểm danh theo lịch thi, kèm thông tin sinh viên.
const getExamAttendanceByScheduleId = async (schedule_id) => {
    try {
        const violation = await db('exam_attendance')
            .join('auth', 'auth.id', 'exam_attendance.student_id')
            .join('users', 'users.id', 'exam_attendance.student_id')
            .where({ schedule_id })
            .select(
                'auth.id as id_student',
                'auth.username as user_name',
                'users.first_name',
                'users.last_name',
                'exam_attendance.is_present',
            )
        const dataWithStt = violation.map((item, index) => ({
            id: index + 1,
            ...item
        }));
        return dataWithStt;
    } catch (error) {
        throw new Error('Error fetching exam_attendance by ID: ' + error.message);
    }
}

//  Kiểm tra sinh viên đã điểm danh cho một lịch thi chưa.
const checkAttendance = async (student_id, schedule_id) => {
    try {
        // Truy vấn tìm bản ghi điểm danh theo student_id và schedule_id
        const attendance = await db('exam_attendance')
            .where({ student_id, schedule_id })
            .first();  // Sử dụng first() để lấy một bản ghi duy nhất        

        return attendance;  // Nếu có bản ghi, sẽ trả về thông tin của điểm danh
    } catch (error) {
        throw new Error('Error fetching exam_attendance: ' + error.message);
    }
};

const updateAttendance = async (studentId, scheduleId, realFace, confidence, reportedBy = 3) => {
    return db("exam_attendance")
        .where({ student_id: studentId, schedule_id: scheduleId })
        .update({
            is_present: realFace ? 1 : 0,
            confidence: confidence,
            real_face: realFace,
            updated_at: new Date(),
            violation_id: null,
            reported_by: reportedBy
        });
}

// Thêm mới bản ghi điểm danh.
const createExamAttendance = async ({
    schedule_id,
    student_id,
    is_present,
    violation_id,
    reported_by
}) => {
    try {
        const [attendance_id] = await db('exam_attendance').insert({
            schedule_id,
            student_id,
            is_present,
            violation_id,
            reported_by
        });

        const newAttendance = await db('exam_attendance')
            .where({ attendance_id })
            .first();
        return newAttendance;
    } catch (error) {
        throw new Error('Error creating exam attendance: ' + error.message);
    }
}

// Xoá bản ghi điểm danh theo ID.
const deleteExamAttendance = async (attendance_id) => {
    try {
        const deletedAttendance = await db('exam_attendance')
            .where({ attendance_id })
            .del();
        return deletedAttendance;
    } catch (error) {
        throw new Error('Error deleting exam attendance: ' + error.message);
    }
}

// Cập nhật thông tin điểm danh.
const updateExamAttendance = async (student_id, schedule_id, updates) => {
    return db("exam_attendance")
        .where({ student_id, schedule_id })
        .update(updates);
};

// Lấy ID ca thi đang diễn ra tại thời điểm hiện tại.
const getCurrentExamSchedule = async () => {
    const now = new Date();
    const query = db('examschedules')
        .where('start_time', '<=', now)
        .andWhere('end_time', '>=', now)
        .first();
    const result = await query;

    return result?.schedule_id;
}

// Lấy danh sách các ca thi đang chuẩn bị hoặc đang diễn ra (theo giờ VN).
const getCurrentExamSchedules = async () => {
    try {
        const nowInVietnam = dayjs().tz('Asia/Ho_Chi_Minh'); // Giờ Việt Nam
        const nowInUTC = nowInVietnam.utc().format('YYYY-MM-DD HH:mm:ss'); // Chuyển sang UTC để so sánh với DB

        // Truy vấn bảng examschedules để lấy các ca thi:
        //  - start_time <= nowInUTC  → ca đã bắt đầu
        //  - end_time >= nowInUTC    → ca chưa kết thúc
        //  - status thuộc ['scheduled', 'in_progress'] → chỉ lấy ca chuẩn bị hoặc đang diễn ra
        const currentSchedules = await db('examschedules')
            .where('start_time', '<=', nowInUTC)
            .andWhere('end_time', '>=', nowInUTC)
            .whereIn('status', ['scheduled', 'in_progress']); // chỉ lấy ca thi đang chuẩn bị hoặc đang diễn ra

        return currentSchedules;
    } catch (error) {
        throw new Error('Lỗi khi lấy ca thi hiện tại: ' + error.message);
    }
};

// Kiểm tra sinh viên có tồn tại trong bảng auth không.
const checkStudentExists = async (id) => {
    return db("auth")
        .where("id", id)
        .first();
}

module.exports = {
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
    getCurrentExamSchedules,
    updateAttendance
};
