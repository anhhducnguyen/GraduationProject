// src/utils/clearUsersCache.js
const redisClient = require('./redis');

async function clearUsersCache() {
    try {
        // Dùng SCAN để tìm tất cả key users:*
        let cursor = '0';
        do {
            const reply = await redisClient.scan(cursor, { MATCH: 'users:*', COUNT: 100 });
            cursor = reply.cursor;
            const keys = reply.keys;

            if (keys.length > 0) {
                await redisClient.del(...keys);
                console.log(`Xoá cache Redis cho ${keys.length} key users:*`);
            }
        } while (cursor !== '0');
    } catch (err) {
        console.error('Lỗi khi xoá cache Redis:', err);
    }
}

module.exports = clearUsersCache;
