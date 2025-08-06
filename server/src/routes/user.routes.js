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
} = require("../../src/utils/auth/index");
router.use(authenticate);
const permission = require("../../src/constants/permission");

const db = require('../../config/database');

/** 
- Lấy danh sách người dùng
- Thêm mới người dùng
**/
router.route('/')
    .get(
        permission,
        Controller.getUsers
    )
    .post(
        permission,
        // validateRequest(createUserSchema), 
        upload.single("avatar"),
        // checkEmailExist, 
        Controller.createUser
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

/** 
- Lấy thông tin người dùng theo ID
- Cập nhật thông tin người dùng
- Xóa người dùng theo ID
**/
router.route('/:id')
    .get(
        permission,
        // checkUserExistById, 
        Controller.getUser
    )
    .put(
        permission,
        upload.single("avatar"),
        // checkUserExistById, 
        Controller.updateUser
    )
    .patch(
        permission,
        upload.single("avatar"),
        // checkUserExistById, 
        Controller.updateUser
    )
    .delete(
        permission,
        // checkUserExistById, 
        Controller.deleteUser
    );

module.exports = router;
