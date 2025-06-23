const {
    getExamScheduleById,
    queryExamSchedule,
  } = require('../services/exam.schedule.service');
const pick = require('../utils/pick');
const redisClient = require('../utils/redis');

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

// Get all exam schedules
// const getAll = async (req, res) => {
//   try {
//     const filter = pick(req.query, ['status']);
//     const options = pick(req.query, ['sortBy', 'limit', 'page', '_start', '_end']);
//     const result = await queryExamSchedule(filter, options);
//     res.send(result);
//   } catch (err) {
//     res.status(err.statusCode || 500).send({ message: err.message });
//   }
// };


const getAll = async (req, res) => {
  try {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', '_start', '_end']);

    // Tạo cache key duy nhất cho truy vấn này
    const cacheKey = `examSchedules:${JSON.stringify(filter)}:${JSON.stringify(options)}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.send(JSON.parse(cached));
    }

    // Nếu chưa có trong cache => truy vấn DB
    const result = await queryExamSchedule(filter, options);

    // Lưu vào cache với thời hạn 5 phút (300 giây)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    res.send(result);
  } catch (err) {
    res.status(err.statusCode || 500).send({ message: err.message });
  }
};

// const stableStringify = (obj) =>
//   JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
//     acc[key] = obj[key];
//     return acc;
//   }, {}));

// const buildCacheKey = (prefix, filter, options) =>
//   `${prefix}:${stableStringify(filter)}:${stableStringify(options)}`;

// const getFromCache = async (key) => {
//   try {
//     const cached = await redisClient.get(key);
//     return cached ? JSON.parse(cached) : null;
//   } catch (err) {
//     console.warn('Redis get error:', err.message);
//     return null;
//   }
// };

// const saveToCache = async (key, data, ttl = 300) => {
//   try {
//     await redisClient.setEx(key, ttl, JSON.stringify(data));
//   } catch (err) {
//     console.warn('Redis set error:', err.message);
//   }
// };

// const getAll = async (req, res) => {
//   try {
//     const filter = pick(req.query, ['status']);
//     const options = pick(req.query, ['sortBy', 'limit', 'page', '_start', '_end']);
//     options.limit = options.limit ? parseInt(options.limit) : 10;
//     options.page = options.page ? parseInt(options.page) : 1;

//     const cacheKey = buildCacheKey('examSchedules', filter, options);
//     const cached = await getFromCache(cacheKey);
//     if (cached) {
//       return res.send(cached);
//     }

//     const result = await queryExamSchedule(filter, options);
//     if (result) {
//       await saveToCache(cacheKey, result);
//     }

//     res.send(result || []);
//   } catch (err) {
//     res.status(err.statusCode || 500).send({ message: err.message });
//   }
// };

module.exports = {
    getExamSchedule,
    getAll,
};
