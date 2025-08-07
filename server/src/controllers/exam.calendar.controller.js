const {
    getExamScheduleById,
    queryExamSchedule,
    importFromExcel,
  } = require('../services/exam.calendar.service');
const pick = require('../utils/pick');
const redisClient = require('../utils/redis');
const fs = require('fs');

// Lấy lịch thi theo ID
const getExamSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const examSchedule = await getExamScheduleById(id);
        if (!examSchedule) {
            return res.status(404).json({ message: 'Lịch thi không tồn tại' });
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

// Import lịch thi từ file Excel
// const importSchedulesFromExcel = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'Không có tệp nào được tải lên' });
//     }

//     const filePath = req.file.path;

//     const { inserted, skipped } = await importFromExcel(filePath);

//     fs.unlinkSync(filePath);

//     res.status(200).json({
//       message: 'Tải lên lịch thi thành công',
//       inserted,
//       skipped,
//     });
//   } catch (err) {
//     console.error('Import error:', err);
//     res.status(500).json({ message: 'Import failed', error: err.message });
//   }
// };

const importSchedulesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có tệp nào được tải lên' });
    }

    const filePath = req.file.path;

    const { inserted, skipped } = await importFromExcel(filePath);

    fs.unlinkSync(filePath);

    // ❗ Xoá tất cả cache lịch thi sau khi import
    const keys = await redisClient.keys('examSchedules:*');
    if (keys.length > 0) {
      await redisClient.del(...keys); // Xóa hàng loạt
    }

    res.status(200).json({
      message: 'Tải lên lịch thi thành công',
      inserted,
      skipped,
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ message: 'Import failed', error: err.message });
  }
};

module.exports = {
    getExamSchedule,
    getAll,
    importSchedulesFromExcel,
};
