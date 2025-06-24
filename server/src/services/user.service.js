const db = require('../../config/database');

class UserService {
    // Lấy danh sách tất cả người dùng
    static async queryUsers(filter, options) {
        const {
            sortBy = 'id:asc',
            limit = 10,
            offset = 0,
            fields,
            search
        } = options;

        const [sortField, sortOrder] = sortBy.split(':');
        const query = db('users')
            .join("auth", "users.id", "auth.id")
            .select(
                "users.id",
                "users.first_name",
                "users.last_name",
                "users.age",
                "users.gender",
                "users.avatar",
                "auth.email",
                "auth.username",
                "auth.role",
                "auth.google_id",
                "auth.created_at as auth_created_at",
                "users.created_at as user_created_at"
            );

        if (search) {
            query.where(builder => {
                builder
                    .where('name', 'like', `%${search}%`)
                    .orWhere('email', 'like', `%${search}%`); 
            });
        }

        if (filter.name) {
            query.where('name', 'like', `%${filter.name}%`);
        }
        if (filter.age) {
            query.where('age', filter.age);
        }

        if (fields) {
            const selectedFields = fields.split(','); 
            query.select(selectedFields);
        }

        const data = await query.orderBy(sortField, sortOrder).limit(limit).offset(offset);

        return data;
    }

    static async getCount() {
        return db("users")
            .countDistinct('id as count');
    }

    // Lấy người dùng theo ID
    static async getById(id) {
        return db("users")
            .where("id", id)
            .select("*");
    }

    // static async create({
    //     first_name,
    //     last_name,
    //     age,
    //     gender,
    //     // role, 
    //     // username, 
    //     // email, 
    //     // hashedPassword, 
    //     avatar
    // }) {
    //     return db("users").insert({
    //         // username,
    //         // email,
    //         // password: hashedPassword, 
    //         avatar,
    //         first_name,
    //         last_name,
    //         age,
    //         gender,
    //         // role,
    //     })
    // }

    // Thêm mới người dùng
    static async create({
        first_name,
        last_name,
        age,
        gender,
        role,
        username,
        email,
        hashedPassword,
        avatar
    }) {
        return await db.transaction(async trx => {
            // Bước 1: Thêm vào bảng auth
            const [authId] = await trx("auth")
                .insert({
                    email,
                    password: hashedPassword,
                    username,
                    role,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning("id");

            // Bước 2: Thêm vào bảng users, dùng cùng id
            await trx("users")
                .insert({
                    id: authId,
                    first_name,
                    last_name,
                    age,
                    gender,
                    avatar,
                    created_at: new Date(),
                    updated_at: new Date()
                });

            return { id: authId };
        });
    }

    // Cập nhật thông tin người dùng
    static async update({
        id,
        name,
        age,
        gender,
        role,
        username,
        email,
        avatar
    }) {
        return db("users")
            .update({
                id,
                name,
                age,
                gender,
                role,
                username,
                email,
                avatar
            })
            .where("id", id);
    }

    // Xóa người dùng 
    static async delete(id) {
        return db("users")
            .delete()
            .where("id", id);
    }

    // Tìm người dùng theo email
    static async findEmail(email) {
        return db("users")
            .where({ email })
            .first();
    }

    // Tìm người dùng theo ID
    static async findById(id) {
        return db("users")
            .where({ id })
            .first();
    }
}

module.exports = UserService;