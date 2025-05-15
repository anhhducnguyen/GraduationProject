const express = require('express');
const router = express.Router();
const {
    getExamSchedule,
    getAll
} = require('../controllers/exam.schedule.controllers');

router.get(
    '/',
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    getAll
);

router.get(
    '/:id',
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    getExamSchedule
);



module.exports = router;
