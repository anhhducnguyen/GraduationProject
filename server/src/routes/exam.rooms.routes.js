
const express = require('express');
const router = express.Router();

const {
    getExamRooms,
    getExamRoom,
    createExamRoom,
    updateExamRoom,
    deleteExamRoom
} = require('../controllers/exam.rooms.controllers');

// const {
//     authenticate,
//     authorize
// } = require("../../../libs/auth/index");

// const ROLES = require("../../../libs/constants/roles");
// router.use(authenticate);
// const permission = authorize([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);

router.route('/')
    .get(
        // permission, 
        getExamRooms)
//     .post(permission, createExamRoom);

// router.route('/:id')
//     .get(permission, getExamRoom)
//     .put(permission, updateExamRoom)
//     .delete(permission, deleteExamRoom);

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
