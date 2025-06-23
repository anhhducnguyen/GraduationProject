const redisClient = require('./redis');

const clearExamScheduleCache = async () => {
  const keys = await redisClient.keys('examSchedules:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = {
  clearExamScheduleCache
};
