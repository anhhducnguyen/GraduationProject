const db = require('../../config/database');
const dayjs = require('dayjs');
const { buildQuery } = require("../utils/queryBuilder");
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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

// const getCurrentExamSchedule = async () => {
//     try {
//         const now = new Date();
//         const fifteenMinutesBefore = new Date(now.getTime() - 15 * 60 * 1000);  // 15 phút trước
//         console.log('15 minutes before:', fifteenMinutesBefore);

//         // Format lại thời gian sang dạng mà MySQL hiểu
//         const formattedTime = dayjs(fifteenMinutesBefore).format('YYYY-MM-DD HH:mm:ss');
//         console.log('Formatted time for SQL:', formattedTime);

//         const query = db('examschedules')
//             // .where('start_time', '>=', formattedTime);
//             // .andWhere('start_time', '<=', now)
//             // .andWhere('end_time', '>=', now);

//         console.log('Generated SQL:', query.toSQL());
//         console.log('Full SQL with values:', query.toString());

//         const schedules = await query.first();
//         console.log('Query result:', schedules);

//         return schedules ? schedules.schedule_id : null;
//     } catch (error) {
//         console.log('Error fetching current exam schedule:', error.message);
//         throw new Error('Error fetching current exam schedule: ' + error.message);
//     }
// };

const getCurrentExamSchedule = async () => {
    const now = new Date();
    // console.log(now);
    const query = db('examschedules')
        .where('start_time', '<=', now)
        .andWhere('end_time', '>=', now)
        .first();
    // console.log('Generated SQL:', query.toSQL());
    const result = await query;
    console.log(result);

    return result?.schedule_id;
}

// const getCurrentExamSchedules = async () => {
//     const now = new Date();
//     return await db('examschedules')
//         .where('start_time', '<=', now)
//         .andWhere('end_time', '>=', now);
// };

// const getCurrentExamSchedules = async () => {
//     try {
//         // 1. Lấy thời gian hiện tại dưới dạng UTC.
//         // dayjs().utc() sẽ lấy khoảnh khắc hiện tại và biểu diễn nó ở múi giờ UTC.
//         const nowInUTC = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');

//         console.log(`Querying for schedules active at (UTC): ${nowInUTC}`);

//         // 2. Truy vấn cơ sở dữ liệu.
//         // Tìm các lịch thi có start_time trước hoặc bằng thời điểm hiện tại (UTC)
//         // và end_time sau hoặc bằng thời điểm hiện tại (UTC).
//         const currentSchedules = await db('examschedules')
//             .where('start_time', '<=', nowInUTC)
//             .andWhere('end_time', '>=', nowInUTC)
//             .andWhere('status', 'scheduled'); // Thêm điều kiện này để chắc chắn chỉ lấy các ca thi đã được lên lịch

//         // 3. Trả về kết quả.
//         // Dữ liệu thời gian trong `currentSchedules` vẫn là UTC.
//         // Hãy để frontend xử lý việc chuyển đổi sang giờ Việt Nam để hiển thị.
//         return currentSchedules;

//     } catch (error) {
//         throw new Error('Error fetching current exam schedules: ' + error.message);
//     }
// };

const getCurrentExamSchedules = async () => {
    try {
        // 1. Lấy thời điểm hiện tại ở UTC (giống format của dữ liệu trong DB)
        const nowUTC = dayjs().utc().format('YYYY-MM-DD HH:mm:ss');

        console.log(`🕒 Truy vấn lịch thi đang diễn ra tại thời điểm (UTC): ${nowUTC}`);

        // 2. Truy vấn các lịch thi có thời gian phù hợp và trạng thái còn hiệu lực
        const currentSchedules = await db('examschedules as s')
            .leftJoin('examrooms as r', 's.room_id', 'r.room_id') // nếu muốn kèm phòng
            .select(
                's.schedule_id',
                's.name_schedule',
                's.start_time',
                's.end_time',
                's.room_id',
                's.status',
                'r.name as room_name' // nếu bạn có cột "name" trong bảng examrooms
            )
            .where('s.start_time', '<=', nowUTC)
            .andWhere('s.end_time', '>=', nowUTC)
            .andWhereIn('s.status', ['scheduled', 'in_progress']) // lấy cả 2 loại hợp lệ

        return currentSchedules;

    } catch (error) {
        console.error('❌ Lỗi khi truy vấn lịch thi đang diễn ra:', error.message);
        throw new Error('Error fetching current exam schedules');
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
    countExamAttendance,
    getCurrentExamSchedules
};
