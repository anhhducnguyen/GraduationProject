const {
    queryExamSchedules,
    countExamSchedules
} = require('../services/exam.schedules.services');
const pick = require('../utils/pick');
const { parseQueryOptions } = require("../utils/queryParser");

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

module.exports = {
    getExamSchedules,
};
