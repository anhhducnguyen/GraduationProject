/**
 QUẢN LÝ PHÒNG THI
**/
const express = require('express');
const router = express.Router();
const {
    getExamRooms,
    getExamRoom,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom
} = require('../controllers/exam.rooms.controller');
const {
    authenticate,
} = require("../../src/utils/auth/index");
router.use(authenticate);
const permission = require("../../src/constants/permission");

/** 
- Lấy danh sách phòng thi 
- Thêm mới phòng thi
**/
router.route('/')
    .get(
        permission, 
        getExamRooms)
    .post(
        permission, 
        createExamRoom);

/**
- Hiển thị thông tin chi tiết phòng thi theo mã phòng thi
- Cập nhật thông tin phòng thi theo mã phòng thi
- Xóa phòng thi theo mã phòng thi
**/
router.route('/:id')
    .get(
        permission, 
        getExamRoom)
    .patch(
        permission, 
        updateExamRoom)
    .delete(
        permission, 
        deleteExamRoom
    );

module.exports = router;






