const {
    getExamScheduleById,
    queryExamSchedule,
  } = require('../services/exam.schedule.services');
const pick = require('../utils/pick');
const getExamSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const examSchedule = await getExamScheduleById(id);
        if (!examSchedule) {
            return res.status(404).json({ message: 'Exam Schedule not found' });
        }
        return res.status(200).json(examSchedule);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        //GET /api/users?name=John&role=admin&sortBy=name:asc&limit=10&page=2 
        const filter = pick(req.query, ['status']);
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const result = await queryExamSchedule(filter, options);
        res.send(result);
    } catch (err) {
        res.status(err.statusCode || 500).send({ message: err.message });
    }
};


module.exports = {
    getExamSchedule,
    getAll,
};
