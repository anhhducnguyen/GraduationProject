const db = require('../../config/database');
const { buildQuery } = require("../utils/queryBuilder");

// Lấy danh sách lịch thi
const queryExamSchedules = async (filters = {}, options = {}) => {
    try {
        const query = buildQuery(db, 'examschedules', {
            filters,
            likeFilters: ['name_schedule_like', 'status_like', 'start_time_like', 'end_time_like'],
            exactFilters: ['name_schedule', 'status', 'start_time', 'end_time'],
            sort: options.sort,
            page: options.page,
            limit: options.limit,
        });

        query.join('examrooms', 'examschedules.room_id', '=', 'examrooms.room_id')
            .select(
                'examschedules.schedule_id',
                'examschedules.start_time',
                'examschedules.end_time',
                'examschedules.name_schedule',
                'examschedules.status',
                'examrooms.room_id as room_id',
            )
        // .orderBy('examschedules.start_time', 'desc');

        const results = await query;

        const formatted = results.map(row => ({
            schedule_id: row.schedule_id,
            start_time: row.start_time,
            end_time: row.end_time,
            name_schedule: row.name_schedule,
            status: row.status,
            room: {
                room_id: row.room_id,
            }
        }));

        return formatted;
    } catch (error) {
        throw error;
    }
}

// Đếm tổng số lịch thi
const countExamSchedules = async () => {
    const [{ count }] = await db('examschedules').count('* as count');
    return parseInt(count);
};

// Xóa lịch thi theo mã lịch thi
const deleteScheduleById = async (schedule_id) => {
    try {
        const deletedExamSchedule = await db('examschedules')
            .where({ schedule_id })
            .del();
        return deletedExamSchedule;
    } catch (error) {
        throw new Error('Error deleting exam schedule: ' + error.message);
    }
};

// Tạo mới lịch thi
const create = async ({
    start_time,
    end_time,
    room_id,
    status,
    name_schedule
}) => {
    try {
        const [schedule_id] = await db('examschedules').insert({
            start_time,
            end_time,
            room_id,
            status,
            name_schedule
        });

        const newExamSchedule = await db('examschedules')
            .where({ schedule_id })
            .first();
        return newExamSchedule;
    } catch (error) {
        throw new Error('Error creating exam schedule: ' + error.message);
    }
};

// Cập nhật lịch thi
const update = async (id, {
    start_time,
    end_time,
    room_id,
    status,
    name_schedule
}) => {
    try {
        const affectedRows = await db('examschedules')
            .where({ schedule_id: id })
            .update({
                start_time,
                end_time,
                room_id,
                status,
                name_schedule
            });

        if (affectedRows === 0) {
            return null; // không tìm thấy hoặc không thay đổi gì
        }

        const updatedExamSchedule = await db('examschedules')
            .where({ schedule_id: id })
            .first();

        return updatedExamSchedule;
    } catch (error) {
        throw new Error('Error updating exam schedule: ' + error.message);
    }
};


// Lấy danh sách sinh viên trong ca thi
const getStudentsInExamScheduleService = async (schedule_id) => {
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
                'exam_attendance.confidence',
                'exam_attendance.real_face',
                'exam_attendance.updated_at'
            );
        return students;
    } catch (error) {
        throw new Error('Error fetching students in exam schedule: ' + error.message);
    }
};

// Lọc ra student_id hợp lệ từ danh sách sinh viên
const filterValidStudentIds = async (studentIds) => {
    try {
        const existingUsers = await db('users')
            .whereIn('id', studentIds)
            .select('id');
        return existingUsers;
    } catch (error) {
        throw new Error('Error filtering valid student IDs: ' + error.message);
    }
};

// Lọc bỏ các student đã có trong ca thi
const filterStudentsInExam = async (validUserIds, schedule_id) => {
    try {
        const existingInExam = await db('exam_attendance')
            .whereIn('student_id', validUserIds)
            .andWhere('schedule_id', schedule_id)
            .select('student_id');

        return existingInExam;
    } catch (error) {
        throw new Error('Error filtering students in exam: ' + error.message);
    }
};

// Thêm danh sách sinh viên vào ca thi
const addStudentsToExamScheduleService = async (insertData) => {
    try {
        await db('exam_attendance').insert(insertData);
    } catch (error) {
        throw new Error('Error adding students to exam schedule: ' + error.message);
    }
};

// Xóa sinh viên khỏi ca thi
const deleteStudentFromExamScheduleService = async (studentIds, schedule_id) => {
    try {
        await db('exam_attendance')
            .whereIn('student_id', studentIds)
            .andWhere('schedule_id', schedule_id)
            .del();
    } catch (error) {
        throw new Error('Error deleting students from exam schedule: ' + error.message);
    }
}

module.exports = {
    queryExamSchedules,
    countExamSchedules,
    deleteScheduleById,
    create,
    update,
    getStudentsInExamScheduleService,
    filterValidStudentIds,
    filterStudentsInExam,
    addStudentsToExamScheduleService,
    deleteStudentFromExamScheduleService
};
