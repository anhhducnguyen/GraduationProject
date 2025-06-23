const BaseController = require('./base.controller');
const Service = require('../services/user.service');
const bcrypt = require("bcrypt");
const pick = require('../utils/pick');
const db = require('../../config/database');
const redisClient = require('../utils/redis');
const crypto = require('crypto');



class UserController extends BaseController {
    // static async getUsers(req, res) {
    //     try {
    //         // Chuyển đổi sort
    //         if (req.query._sort && req.query._order) {
    //             req.query.sortBy = `${req.query._sort}:${req.query._order}`;
    //         }

    //         const filter = pick(req.query, ['name', 'age']);
    //         const options = pick(req.query, [
    //             'sortBy', '_limit', '_start', '_end', '_page', '_per_page', 'fields', 'search'
    //         ]);

    //         // Tính limit và offset
    //         if (options._start && options._end) {
    //             options.limit = parseInt(options._end) - parseInt(options._start);
    //             options.offset = parseInt(options._start);
    //         }
    //         if (options._limit && !options.limit) {
    //             options.limit = parseInt(options._limit);
    //         }
    //         if (options._start && !options.offset) {
    //             options.offset = parseInt(options._start);
    //         }
    //         if (options._page) {
    //             const page = parseInt(options._page);
    //             const perPage = parseInt(options._per_page) || 10;
    //             options.limit = perPage;
    //             options.offset = (page - 1) * perPage;
    //         }

    //         // Đếm tổng số bản ghi
    //         const totalQuery = db('users');

    //         if (options.search) {
    //             totalQuery.where(builder => {
    //                 builder
    //                     .where('name', 'like', `%${options.search}%`)
    //                     .orWhere('email', 'like', `%${options.search}%`);
    //             });
    //         }

    //         if (filter.name) {
    //             totalQuery.where('name', 'like', `%${filter.name}%`);
    //         }

    //         if (filter.age) {
    //             totalQuery.where('age', filter.age);
    //         }

    //         const [{ count }] = await totalQuery.clone().count('* as count');

    //         // Lấy dữ liệu
    //         const result = await Service.queryUsers(filter, options);

    //         // Thêm header X-Total-Count và expose cho frontend
    //         res.set('X-Total-Count', count);
    //         res.set('Access-Control-Expose-Headers', 'X-Total-Count');

    //         res.json(result);
    //     } catch (err) {
    //         res.status(err.statusCode || 500).send({ message: err.message });
    //     }
    // }
    static async getUsers(req, res) {
  try {
    // Chuyển đổi sort
    if (req.query._sort && req.query._order) {
      req.query.sortBy = `${req.query._sort}:${req.query._order}`;
    }

    const filter = pick(req.query, ['name', 'age']);
    const options = pick(req.query, [
      'sortBy', '_limit', '_start', '_end', '_page', '_per_page', 'fields', 'search'
    ]);

    // Tính toán limit và offset
    if (options._start && options._end) {
      options.limit = parseInt(options._end) - parseInt(options._start);
      options.offset = parseInt(options._start);
    }
    if (options._limit && !options.limit) {
      options.limit = parseInt(options._limit);
    }
    if (options._start && !options.offset) {
      options.offset = parseInt(options._start);
    }
    if (options._page) {
      const page = parseInt(options._page);
      const perPage = parseInt(options._per_page) || 10;
      options.limit = perPage;
      options.offset = (page - 1) * perPage;
    }

    // 👉 Tạo cacheKey duy nhất cho tổ hợp query
    const rawKey = JSON.stringify({ filter, options });
    const cacheKey = `users:${crypto.createHash('md5').update(rawKey).digest('hex')}`;

    // 👉 Kiểm tra cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      res.set('X-Total-Count', parsed.total);
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');
      return res.json(parsed.data);
    }

    // Đếm bản ghi
    const totalQuery = db('users');
    if (options.search) {
      totalQuery.where(builder => {
        builder.where('name', 'like', `%${options.search}%`)
               .orWhere('email', 'like', `%${options.search}%`);
      });
    }
    if (filter.name) totalQuery.where('name', 'like', `%${filter.name}%`);
    if (filter.age) totalQuery.where('age', filter.age);
    const [{ count }] = await totalQuery.clone().count('* as count');

    // Lấy dữ liệu từ DB
    const result = await Service.queryUsers(filter, options);

    // Lưu vào Redis cache (hết hạn sau 5 phút)
    await redisClient.setEx(cacheKey, 300, JSON.stringify({ total: count, data: result }));

    // Gửi response
    res.set('X-Total-Count', count);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(result);

  } catch (err) {
    res.status(err.statusCode || 500).send({ message: err.message });
  }
}
    static async getUser(req, res) {
        try {
            const data = await Service.getById(req.params.id);

            if (!data || data.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            // Trả về dữ liệu trực tiếp mà không cần bao bọc trong "data"
            return res.json({
                id: data[0].id,
                first_name: data[0].first_name,
                last_name: data[0].last_name,
                age: data[0].age,
                gender: data[0].gender,
                avatar: data[0].avatar,
                created_at: data[0].created_at,
                updated_at: data[0].updated_at,
            });
        } catch (error) {
            return BaseController.errorResponse(res, error);
        }
    }
    // static async createUser(req, res) {
    //     try {
    //         const {
    //             first_name,
    //             last_name,
    //             age,
    //             gender,
    //             // role, 
    //             // username, 
    //             // email, 
    //             // password 
    //         } = req.body;

    //         // const hashedPassword = await bcrypt.hash(password, 10);
    //         let avatar = req.fileName;

    //         const data = await Service.create({
    //             first_name,
    //             last_name,
    //             age,
    //             gender,
    //             // role, 
    //             // username, 
    //             // email, 
    //             // hashedPassword, 
    //             avatar
    //         });

    //         return BaseController.successResponse(res, data, 'Create successfully', 201);
    //     } catch (error) {
    //         return BaseController.errorResponse(res, error);
    //     }
    // };

static async createUser(req, res) {
    try {
        const {
            first_name,
            last_name,
            age,
            gender,
            role,
            username,
            email,
            password
        } = req.body;

        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lấy avatar từ file upload (nếu có)
        const avatar = req.fileName || null;

        // Gọi service để tạo user và auth
        const data = await Service.create({
            first_name,
            last_name,
            age,
            gender,
            role,
            username,
            email,
            hashedPassword,
            avatar
        });

        return BaseController.successResponse(res, data, 'Create successfully', 201);
    } catch (error) {
        console.error("Error creating user:", error);
        return BaseController.errorResponse(res, error);
    }
}

    static async updateUser(req, res) {
        try {
            let id = req.params.id;
            let avatar = req.fileName;
            console.log(avatar);

            const {
                name,
                age,
                gender,
                // role, 
                // username, 
                // email 
            } = req.body;

            const data = await Service.update({
                id,
                name,
                age,
                gender,
                // role, 
                // username, 
                // email,
                avatar
            });

            return BaseController.successResponse(res, data, 'Update successfully');
        } catch (error) {
            return BaseController.errorResponse(res, error);
        }
    };
    static async deleteUser(req, res) {
        try {
            let id = req.params.id;
            const data = await Service.delete(id);

            return BaseController.successResponse(res, data, 'Delete successfully');
        } catch (error) {
            return BaseController.errorResponse(res, error);
        }
    };
}

module.exports = UserController;