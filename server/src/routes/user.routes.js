/**
 QUẢN LÝ NGƯỜI DÙNG
**/
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/user.controller');
const upload = require("../middlewares/upload.single");
const ROLES = require("../constants/role");
const { 
    authenticate, 
    authorize 
} = require("../utils/auth/index");
const db = require('../../config/database');

// Lấy danh sách người dùng
router.get(
    '/', 
    // authenticate,
    // authorize([
    //     ROLES.ADMIN, 
    //     ROLES.TEACHER
    // ]), 
    Controller.getUsers
);

// Lấy danh sách sinh viên 
router.get(
    '/students',
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    async (req, res) => {
        try {
            const students = await db('auth')
            .join('users', 'auth.id', 'users.id')

            .where('role', ROLES.STUDENT);
            res.json(students);
        } catch (error) {
            console.error("Error fetching students:", error);
            res.status(500).json({ message: "Failed to fetch students" });
        }
    }
);

// Lấy thông tin người dùng theo ID
router.get(
    '/:id', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]), 
    // checkUserExistById, 
    Controller.getUser
);

// Thêm mới người dùng
router.post(
    '/', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    // validateRequest(createUserSchema), 
    upload.single("avatar"), 
    // checkEmailExist, 
    Controller.createUser
);

// Cập nhật thông tin người dùng
router.put(
    '/:id', 
    authenticate,
    authorize([ROLES.ADMIN, ROLES.TEACHER]),
    upload.single("avatar"),
    // checkUserExistById, 
    Controller.updateUser
);

// Xóa người dùng theo ID
router.delete(
    '/:id', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    // checkUserExistById, 
    Controller.deleteUser
);

module.exports = router;
