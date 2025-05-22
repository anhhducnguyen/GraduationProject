const db = require('../../config/database');
const { buildQuery } = require("../utils/queryBuilder");

// Get all exam schedules
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
            .orderBy('examschedules.start_time', 'desc');

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

// Count all exam schedules
const countExamSchedules = async () => {
    const [{ count }] = await db('examschedules').count('* as count');
    return parseInt(count);
};

// Delete exam schedule by ID
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

module.exports = {
    queryExamSchedules,
    countExamSchedules,
    deleteScheduleById
};
