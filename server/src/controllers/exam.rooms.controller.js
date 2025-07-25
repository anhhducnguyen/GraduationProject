const {
    getExamRoomById,
    create,
    update,
    deleteExamRoomById,
    queryExamRoom,
    countExamRooms,
} = require('../services/exam.rooms.service');
const pick = require('../utils/pick');
const { parseQueryOptions } = require("../utils/queryParser");

// Lấy danh sách phòng thi 
const getExamRooms = async (req, res) => {
    try {
        const filter = pick(req.query, ['room_name', 'room_name_like', 'capacity_like', 'status']);
        const { page, limit, sort } = parseQueryOptions(req.query);

        const count = await countExamRooms();

        res.set('X-Total-Count', count);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        const result = await queryExamRoom(filter, { page, limit, sort });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy phòng thi theo ID
const getExamRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const examRoom = await getExamRoomById(id);
        if (!examRoom) {
            return res.status(404).json({ message: 'Exam room not found' });
        }
        return res.status(200).json(examRoom);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Tạo phòng thi mới
const createExamRoom = async (req, res) => {
    console.log(req.body);
    const { 
        room_name, 
        capacity, 
        location, 
        status 
    } = req.body;
    try {
        const newExamRoom = await create({ 
            room_name, 
            capacity, 
            location, 
            status 
        });
        return res.status(201).json(newExamRoom);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Cập nhật phòng thi theo ID
const updateExamRoom = async (req, res) => {
    const { id } = req.params;
    const { 
        room_name, 
        capacity, 
        location, 
        status 
    } = req.body;
    try {
        const updatedExamRoom = await update(id, { 
            room_name, 
            capacity, 
            location, 
            status 
        });
        if (!updatedExamRoom) {
            return res.status(404).json({ message: 'Exam room not found' });
        }
        return res.status(200).json(updatedExamRoom);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Xóa phòng thi theo ID
const deleteExamRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedExamRoom = await deleteExamRoomById(id);
        if (!deletedExamRoom) {
            return res.status(404).json({ message: 'Exam room not found' });
        }
        return res.status(200).json({ message: 'Exam room deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExamRooms,
    getExamRoom,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom
};
