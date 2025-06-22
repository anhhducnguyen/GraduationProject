const express = require('express');
const router = express.Router();
const Controller = require('../controllers/user.controllers');
const upload = require("../middlewares/upload.single");
const ROLES = require("../constants/role");
const { 
    authenticate, 
    authorize 
} = require("../utils/auth/index");
const db = require('../../config/database');


router.get(
    '/', 
    // authenticate,
    // authorize([
    //     ROLES.ADMIN, 
    //     ROLES.TEACHER
    // ]), 
    Controller.getUsers
);
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
router.get(
    '/:id', 
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]), 
    // checkUserExistById, 
    Controller.getUser
);

router.post(
    '/', 
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
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    // checkUserExistById, 
    Controller.deleteUser
);





module.exports = router;
