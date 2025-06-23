const db = require('../../config/database');
const dayjs = require('dayjs');

const { buildQuery } = require("../utils/queryBuilder");

const queryExamAttendance= async (filters = {}, options = {}) => {
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

    // return await query;
    return formatted;
};

const countExamAttendance = async () => {
    const [{ count }] = await db('examrooms').count('* as count');
    return parseInt(count);
};

const getAllExamAttendances = async () => {
    try {
        const violations = await db('exam_attendance').select('*');
        return violations;
    } catch (error) {
        throw new Error('Error fetching exam_attendance: ' + error.message);
    }
};

const getExamAttendanceById = async (attendance_id) => {
    try {
        const violation = await db('exam_attendance').where({ attendance_id }).first();
        return violation;
    } catch (error) {
        throw new Error('Error fetching exam_attendance by ID: ' + error.message);
    }
}

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

            // 'auth.id',
            // 'auth.id',
            // 'auth.id',
        )
        // .first();
        const dataWithStt = violation.map((item, index) => ({
            id: index + 1,
            ...item
        }));
        // return violation;
        return dataWithStt;
    } catch (error) {
        throw new Error('Error fetching exam_attendance by ID: ' + error.message);
    }
}

const checkAttendance = async (student_id, schedule_id) => {
    try {
        // Truy vấn tìm bản ghi điểm danh theo student_id và schedule_id
        const attendance = await db('exam_attendance')
            .where({ student_id, schedule_id })
            .first();  // Sử dụng first() để lấy một bản ghi duy nhất

        console.log(attendance);
        

        return attendance;  // Nếu có bản ghi, sẽ trả về thông tin của điểm danh
    } catch (error) {
        throw new Error('Error fetching exam_attendance: ' + error.message);
    }
};

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

// const updateExamAttendance = async (attendance_id, {
//     schedule_id, 
//     student_id, 
//     is_present, 
//     violation_id, 
//     reported_by 
// }) => {
//     try {
//         await db('exam_attendance')
//             .where({ attendance_id })
//             .update({ 
//                 schedule_id, 
//                 student_id, 
//                 is_present, 
//                 violation_id, 
//                 reported_by 
//             });

//         const updatedAttendance = await db('exam_attendance')
//             .where({ attendance_id })
//             .first();
//         return updatedAttendance;
//     } catch (error) {
//         throw new Error('Error updating exam attendance: ' + error.message);
//     }
// }

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

// const queryExamAttendance = async (filter, options) => {
//     const { sortBy = 'attendance_id:asc', limit = 10, page = 1 } = options;
//     const [sortField, sortOrder] = sortBy.split(':');
    
//     const queryExamAttendance = db('exam_attendance');
    
//     if (filter.reported_by) {
//         queryExamAttendance.where('reported_by', 'like', `%${filter.reported_by}%`);
//     }
//     if (filter.is_present) {
//         queryExamAttendance.where('is_present', filter.is_present);
//     }
    
//     const offset = (page - 1) * limit;
//     const data = await queryExamAttendance.orderBy(sortField, sortOrder).limit(limit).offset(offset);
    
//     return {
//         results: data,
//         page,
//         limit,
//     };
// }

const updateExamAttendance = async (student_id, schedule_id, updates) => {
    return db("exam_attendance")
        .where({ student_id, schedule_id })
        .update(updates);
};

const getCurrentExamSchedule = async () => {
    try {
        const now = new Date();
        const fifteenMinutesBefore = new Date(now.getTime() - 15 * 60 * 1000);  // 15 phút trước
        console.log('15 minutes before:', fifteenMinutesBefore);

        // Format lại thời gian sang dạng mà MySQL hiểu
        const formattedTime = dayjs(fifteenMinutesBefore).format('YYYY-MM-DD HH:mm:ss');
        console.log('Formatted time for SQL:', formattedTime);

        const query = db('examschedules')
            // .where('start_time', '>=', formattedTime);
            // .andWhere('start_time', '<=', now)
            // .andWhere('end_time', '>=', now);

        console.log('Generated SQL:', query.toSQL());
        console.log('Full SQL with values:', query.toString());

        const schedules = await query.first();
        console.log('Query result:', schedules);

        return schedules ? schedules.schedule_id : null;
    } catch (error) {
        console.log('Error fetching current exam schedule:', error.message);
        throw new Error('Error fetching current exam schedule: ' + error.message);
    }
};

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
    countExamAttendance
};
