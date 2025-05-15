const db = require('../../config/database');

class UserService {
    static async getAll({ page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' }) {
        const offset = (page - 1) * limit;  // Tính toán offset cho phân trang

        return db("users")
            .select(
                "id",
                "name",
                // "email",
                "age",
                // "gender",
                // "username",
                // "role",
                // "google_id",
                "avatar"
            )
            .orderBy(sortBy, sortOrder)
            .limit(limit)
            .offset(offset);
    }

    static async queryUsers(filter, options) {
    const {
        sortBy = 'id:asc',
        limit = 10,
        offset = 0,
        fields,
        search
    } = options;

    const [sortField, sortOrder] = sortBy.split(':');
    const query = db('users');

    // Global search
    if (search) {
        query.where(builder => {
            builder
                .where('name', 'like', `%${search}%`)
                .orWhere('email', 'like', `%${search}%`); // thêm trường khác nếu có
        });
    }

    // Lọc theo filter
    if (filter.name) {
        query.where('name', 'like', `%${filter.name}%`);
    }
    if (filter.age) {
        query.where('age', filter.age);
    }

    // Chọn trường
    if (fields) {
        const selectedFields = fields.split(','); // vd: name,email
        query.select(selectedFields);
    }

    const data = await query.orderBy(sortField, sortOrder).limit(limit).offset(offset);

    return data;
}


    static async getCount() {
        return db("users")
            .countDistinct('id as count');
    }

    static async getById(id) {
        return db("users")
            .where("id", id)
            .select("*");
    }

    static async create({
        name,
        age,
        gender,
        // role, 
        // username, 
        // email, 
        // hashedPassword, 
        avatar
    }) {
        return db("users").insert({
            // username,
            // email,
            // password: hashedPassword, 
            avatar,
            name,
            age,
            gender,
            // role,
        })
    }

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

    static async delete(id) {
        return db("users")
            .delete()
            .where("id", id);
    }

    static async findEmail(email) {
        return db("users")
            .where({ email })
            .first();
    }

    static async findById(id) {
        return db("users")
            .where({ id })
            .first();
    }
}

module.exports = UserService;
