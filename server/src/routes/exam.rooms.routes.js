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

// const {
//     authenticate,
//     authorize
// } = require("../../../libs/auth/index");

// const ROLES = require("../../../libs/constants/roles");
// router.use(authenticate);
// const permission = authorize([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);

/** 
- Lấy danh sách phòng thi 
- Thêm mới phòng thi
**/
router.route('/')
    .get(
        // permission, 
        getExamRooms)
    .post(
        // permission, 
        createExamRoom);

/**
- Hiển thị thông tin chi tiết phòng thi theo mã phòng thi
- Cập nhật thông tin phòng thi theo mã phòng thi
- Xóa phòng thi theo mã phòng thi
**/
router.route('/:id')
    .get(
        // permission, 
        getExamRoom)
    .patch(
        // permission, 
        updateExamRoom)
    .delete(
        // permission, 
        deleteExamRoom
    );

module.exports = router;
















// const express = require('express');
// const router = express.Router();
// const {
//     getExamRooms,
//     getExamRoom,
//     createExamRoom,
//     updateExamRoom,
//     deleteExamRoom
// } = require('../controllers/exam.rooms.controllers');

// const {
//     authenticate,
//     authorize
// } = require("../../../libs/auth/index");
// const ROLES = require("../../../libs/constants/roles");

// const permission = authorize([ROLES.ADMIN, ROLES.TEACHER]);
// router.use(authenticate);

// router.get(
//     '/',
//     permission,
//     getExamRooms
// );
// router.get(
//     '/:id',
//     permission,
//     getExamRoom
// );
// router.post(
//     '/',
//     permission,
//     createExamRoom
// );

// router.put(
//     '/:id',
//     permission,
//     updateExamRoom
// );
// router.delete(
//     '/:id',
//     permission,
//     deleteExamRoom
// );

// module.exports = router;
