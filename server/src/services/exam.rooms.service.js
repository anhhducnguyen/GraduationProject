const db = require('../../config/database');
const { buildQuery } = require("../utils/queryBuilder");

// Lấy danh sách phòng thi
const queryExamRoom = async (filters = {}, options = {}) => {
    const query = buildQuery(db, 'examrooms', {
        filters,
        likeFilters: ['room_name_like', 'capacity_like'],
        exactFilters: ['room_name', 'capacity', 'status'],
        sort: options.sort,
        page: options.page,
        limit: options.limit,
    });

    return await query;
};

// Lấy danh sách phòng thi theo mã phòng thi
const getExamRoomById = async (room_id) => {
    try {
        const examRoom = await db('examrooms').where({ room_id }).first();
        return examRoom;
    } catch (error) {
        throw new Error('Error fetching exam room: ' + error.message);
    }
};

// Thêm mới phòng thi
const create = async ({ 
    room_name, 
    capacity, 
    location, 
    status 
}) => {
    try {
        const [room_id] = await db('examrooms').insert({ 
            room_name, 
            capacity, 
            location, 
            status 
        });

        const newExamRoom = await db('examrooms')
            .where({ room_id })
            .first();
        return newExamRoom;
    } catch (error) {
        throw new Error('Error creating exam room: ' + error.message);
    }
};

// Cập nhật phòng thi theo mã phòng thi
const update = async (room_id, {
    room_name, 
    capacity, 
    location, 
    status 
}) => {
    try {
        await db('examrooms')
            .where({ room_id })
            .update({ 
                room_name, 
                capacity, 
                location, 
                status 
            });

        const updatedExamRoom = await db('examrooms')
            .where({ room_id })
            .first();
        return updatedExamRoom;
    } catch (error) {
        throw new Error('Error updating exam room: ' + error.message);
    }
};

// Xóa phòng thi theo mã phòng thi
const deleteExamRoomById = async (room_id) => {
    try {
        const deletedExamRoom = await db('examrooms')
            .where({ room_id })
            .del();
        return deletedExamRoom;
    } catch (error) {
        throw new Error('Error deleting exam room: ' + error.message);
    }
};

// Đếm tổng số phòng thi
const countExamRooms = async () => {
    const [{ count }] = await db('examrooms').count('* as count');
    return parseInt(count);
};

module.exports = {
    queryExamRoom,
    getExamRoomById,
    create,
    update,
    deleteExamRoomById,
    countExamRooms
};
