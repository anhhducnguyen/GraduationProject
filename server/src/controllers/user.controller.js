const BaseController = require('./base.controller');
const Service = require('../services/user.service');
const bcrypt = require("bcrypt");
const pick = require('../utils/pick');
const db = require('../../config/database');
const redisClient = require('../utils/redis');
const crypto = require('crypto');

class UserController extends BaseController {
  // Lấy danh sách người dùng với phân trang, lọc và sắp xếp
  static async getUsers(req, res) {
    try {
      if (req.query._sort && req.query._order) {
        req.query.sortBy = `${req.query._sort}:${req.query._order}`;
      }

      const filter = pick(req.query, ['name', 'age']);
      const options = pick(req.query, [
        'sortBy', '_limit', '_start', '_end', '_page', '_per_page', 'fields', 'search'
      ]);

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

      const rawKey = JSON.stringify({ filter, options });
      const cacheKey = `users:${crypto.createHash('md5').update(rawKey).digest('hex')}`;

      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        res.set('X-Total-Count', parsed.total);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');
        return res.json(parsed.data);
      }

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

      const result = await Service.queryUsers(filter, options);

      // Lưu vào Redis cache (hết hạn sau 5 phút)
      await redisClient.setEx(cacheKey, 300, JSON.stringify({ total: count, data: result }));

      res.set('X-Total-Count', count);
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');
      res.json(result);

    } catch (err) {
      res.status(err.statusCode || 500).send({ message: err.message });
    }
  }

  // Lấy thông tin người dùng theo ID
  static async getUser(req, res) {
    try {
      const data = await Service.getById(req.params.id);

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

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

  // Tạo người dùng mới
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

      const hashedPassword = await bcrypt.hash(password, 10);

      const avatar = req.fileName || null;

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

      return BaseController.successResponse(res, data, 'Tạo người dùng thành công', 201);
    } catch (error) {
      console.error("Error creating user:", error);
      return BaseController.errorResponse(res, error);
    }
  }

  // Cập nhật thông tin người dùng
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

      return BaseController.successResponse(res, data, 'Cập nhật thành công');
    } catch (error) {
      return BaseController.errorResponse(res, error);
    }
  };

  // Xóa người dùng theo ID
  static async deleteUser(req, res) {
    try {
      let id = req.params.id;
      const data = await Service.delete(id);

      return BaseController.successResponse(res, data, 'Xóa người dùng thành công');
    } catch (error) {
      return BaseController.errorResponse(res, error);
    }
  };
}

module.exports = UserController;