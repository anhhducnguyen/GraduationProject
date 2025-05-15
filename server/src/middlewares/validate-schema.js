const Joi = require("joi");

module.exports.registerUserSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
    .messages({
      "string.email": "Email không hợp lệ (chỉ chấp nhận đuôi .com hoặc .net).",
      "string.empty": "Email không được để trống.",
      "any.required": "Email là bắt buộc."
    }),

  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,30}$"))
    .required()
    .messages({
      "string.pattern.base": "Password phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
      "string.empty": "Password không được để trống.",
      "any.required": "Password là bắt buộc."
    })
});

module.exports.createProductSchema = Joi.object({
  productName: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.base": "Tên sản phẩm phải là một chuỗi văn bản.",
      "string.min": "Tên sản phẩm phải có ít nhất 3 ký tự.",
      "string.max": "Tên sản phẩm không được vượt quá 100 ký tự.",
      "any.required": "Tên sản phẩm là bắt buộc."
    }),

  productLine: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Dòng sản phẩm phải là một số.",
      "number.positive": "Dòng sản phẩm phải là một số dương.",
      "any.required": "Dòng sản phẩm là bắt buộc."
    }),

  productVendor: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.base": "Nhà cung cấp phải là một chuỗi văn bản.",
      "string.min": "Nhà cung cấp phải có ít nhất 3 ký tự.",
      "string.max": "Nhà cung cấp không được vượt quá 100 ký tự.",
      "any.required": "Nhà cung cấp là bắt buộc."
    }),

  productDescription: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.base": "Mô tả sản phẩm phải là một chuỗi văn bản.",
      "string.max": "Mô tả sản phẩm không được vượt quá 500 ký tự."
    }),

  quantityInstock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Số lượng trong kho phải là một số nguyên.",
      "number.min": "Số lượng trong kho phải lớn hơn hoặc bằng 0.",
      "any.required": "Số lượng trong kho là bắt buộc."
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Giá sản phẩm phải là một số.",
      "number.positive": "Giá sản phẩm phải là một số dương.",
      "any.required": "Giá sản phẩm là bắt buộc."
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
      "array.base": "Danh sách ảnh phải là một mảng.",
      "array.items": "Mỗi ảnh trong danh sách phải là một chuỗi URL hợp lệ.",
    })
});

module.exports.createUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Tên phải là chuỗi.',
      'string.empty': 'Tên không được để trống.',
      'string.min': 'Tên phải có ít nhất {#limit} ký tự.',
      'string.max': 'Tên không được vượt quá {#limit} ký tự.',
      'any.required': 'Tên là bắt buộc.'
    }),

  age: Joi.number()
    .integer()
    .min(0)
    .max(120)
    .required()
    .messages({
      'number.base': 'Tuổi phải là một số.',
      'number.min': 'Tuổi không được nhỏ hơn {#limit}.',
      'number.max': 'Tuổi không được lớn hơn {#limit}.',
      'any.required': 'Tuổi là bắt buộc.'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .required()
    .messages({
      'any.only': 'Giới tính phải là "male", "female" hoặc "other".',
      'string.empty': 'Giới tính không được để trống.',
      'any.required': 'Giới tính là bắt buộc.'
    }),

  role: Joi.string()
    .valid('admin', 'seller', 'customer')
    .required()
    .messages({
      'any.only': 'Vai trò phải là "admin", "user" hoặc "moderator".',
      'string.empty': 'Vai trò không được để trống.',
      'any.required': 'Vai trò là bắt buộc.'
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Tên đăng nhập phải là chuỗi.',
      'string.empty': 'Tên đăng nhập không được để trống.',
      'string.alphanum': 'Tên đăng nhập chỉ được chứa ký tự chữ và số.',
      'string.min': 'Tên đăng nhập phải có ít nhất {#limit} ký tự.',
      'string.max': 'Tên đăng nhập không được vượt quá {#limit} ký tự.',
      'any.required': 'Tên đăng nhập là bắt buộc.'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email phải là chuỗi.',
      'string.empty': 'Email không được để trống.',
      'string.email': 'Email không hợp lệ.',
      'any.required': 'Email là bắt buộc.'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.base': 'Mật khẩu phải là chuỗi.',
      'string.empty': 'Mật khẩu không được để trống.',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.',
      'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự.',
      'any.required': 'Mật khẩu là bắt buộc.'
    })
});


