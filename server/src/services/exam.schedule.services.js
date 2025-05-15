const db = require('../../config/database');
// const moment = require('moment-timezone');
// const dayjs = require('dayjs');


const getExamScheduleById = async (schedule_id) => {
    try {
        const examSchedule = await db('exams_chedules').where({ schedule_id }).first();
        return examSchedule;
    } catch (error) {
        throw new Error('Error fetching exams_chedules: ' + error.message);
    }
};

const queryExamSchedule = async (filter, options) => {
    const { sortBy = 'schedule_id:asc', limit = 10, page = 1 } = options;
    const [sortField, sortOrder] = sortBy.split(':');
    
    const queryExamSchedule = db('exams_chedules')
    .join('exam_rooms', 'exam_rooms.room_id', 'exams_chedules.room_id')
        .select(
            'exams_chedules.schedule_id',
            'exams_chedules.start_time',
            'exams_chedules.end_time',
            'exams_chedules.room_id',
            'exams_chedules.status',
            'exams_chedules.name_schedule',
            'exam_rooms.room_name'
        );  
    
    if (filter.status) {
        queryExamSchedule.where('status', 'like', `%${filter.status}%`);
    }
    
    const offset = (page - 1) * limit;
    const data = await queryExamSchedule.orderBy(sortField, sortOrder).limit(limit).offset(offset);
    
    return {
        results: data,
        page,
        limit,
    };
}

module.exports = {
    getExamScheduleById,
    queryExamSchedule
};
