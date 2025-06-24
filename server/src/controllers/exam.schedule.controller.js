const {
    getExamScheduleById,
    queryExamSchedule,
  } = require('../services/exam.schedule.service');
const pick = require('../utils/pick');
const redisClient = require('../utils/redis');

// Lấy lịch thi theo ID
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

// Lấy tất cả lịch thi với cache
const getAll = async (req, res) => {
  try {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', '_start', '_end']);

    const cacheKey = `examSchedules:${JSON.stringify(filter)}:${JSON.stringify(options)}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.send(JSON.parse(cached));
    }

    const result = await queryExamSchedule(filter, options);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    res.send(result);
  } catch (err) {
    res.status(err.statusCode || 500).send({ message: err.message });
  }
};

module.exports = {
    getExamSchedule,
    getAll,
};
