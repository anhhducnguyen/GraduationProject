
const express = require('express');
const router = express.Router();

const {
    getExamSchedules,
    deletedExamSchedule,
    createExamSchedule,
} = require('../controllers/exam.schedules.controller');

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
        getExamSchedules)
    .post(
        // permission, 
        createExamSchedule);

router.route('/:id')
//     .get(permission, getExamRoom)
//     .put(permission, updateExamRoom)
    .delete(
        // permission, 
        deletedExamSchedule);

module.exports = router;










