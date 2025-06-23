const {
    queryExamSchedules,
    countExamSchedules,
    deleteScheduleById,
    create
} = require('../services/exam.schedules.service');
const pick = require('../utils/pick');
const { parseQueryOptions } = require("../utils/queryParser");
const { clearExamScheduleCache } = require('../utils/cache');


// Get all exam schedules
const getExamSchedules = async (req, res) => {
    try {
        const filter = pick(req.query, ['name_schedule_like', 'status_like', 'start_time_like', 'end_time_like']);
        const { page, limit, sort } = parseQueryOptions(req.query);

        const count = await countExamSchedules();

        res.set('X-Total-Count', count);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        const result = await queryExamSchedules(filter, { page, limit, sort });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete exam schedule by ID
const deletedExamSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExamSchedule = await deleteScheduleById(id);
        if (!deletedExamSchedule) {
            return res.status(404).json({ message: 'Exam schedule not found' });
        }

        await clearExamScheduleCache();

        return res.status(200).json({ message: 'Exam schedule deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createExamSchedule = async (req, res) => {
    const {
        start_time,
        end_time,
        name_schedule,
        status,
        room,
        // room_id 
    } = req.body;
    const room_id = room?.room_id;

    if (!room_id) {
        return res.status(400).json({ message: "room_id is required" });
    }
    try {
        const newExamSchedule = await create({
            start_time,
            end_time,
            name_schedule,
            status,
            room_id
        });

        await clearExamScheduleCache();

        return res.status(201).json(newExamSchedule);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExamSchedules,
    deletedExamSchedule,
    createExamSchedule
};
