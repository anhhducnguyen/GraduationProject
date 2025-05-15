const express = require('express');
const router = express.Router();
const Controller = require('../controllers/user.controllers');
const upload = require("../middlewares/upload.single");
const ROLES = require("../constants/role");
const { 
    authenticate, 
    authorize 
} = require("../utils/auth/index");
// const {
//     checkEmailExist,
//     checkUserExistById
// } = require("../middlewares/user.validator");

router.get(
    '/', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]), 
    Controller.getUsers
);
router.get(
    '/:id', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]), 
    // checkUserExistById, 
    Controller.getUser
);
router.post(
    '/new', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    // validateRequest(createUserSchema), 
    upload.single("avatar"), 
    // checkEmailExist, 
    Controller.createUser
);

router.put(
    '/:id', 
    authenticate,
    authorize([ROLES.ADMIN, ROLES.TEACHER]),
    upload.single("avatar"),
    // checkUserExistById, 
    Controller.updateUser
);
router.delete(
    '/:id', 
    authenticate,
    authorize([ROLES.ADMIN, ROLES.TEACHER]),
    // checkUserExistById, 
    Controller.deleteUser
);

module.exports = router;
