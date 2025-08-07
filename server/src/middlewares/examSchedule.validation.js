const Joi = require('joi');

const scheduleSchema = Joi.object({
  name_schedule: Joi.string().min(3).required().messages({
    'string.base': `"name_schedule" phải là chuỗi`,
    'string.empty': `"name_schedule" không được để trống`,
    'string.min': `"name_schedule" phải có ít nhất {#limit} ký tự`,
    'any.required': `"name_schedule" là bắt buộc`
  }),
  start_time: Joi.date().iso().required().messages({
    'date.base': `"start_time" phải là ngày`,
    'any.required': `"start_time" là bắt buộc`
  }),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required().messages({
    'date.base': `"end_time" phải là ngày`,
    'date.greater': `"end_time" phải lớn hơn "start_time"`,
    'any.required': `"end_time" là bắt buộc`
  }),
  room_id: Joi.string().required().messages({
    'any.required': `"room_id" là bắt buộc`
  }),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').required().messages({
    'any.only': `"status" chỉ được là một trong các giá trị: scheduled, in_progress, completed, cancelled`,
    'any.required': `"status" là bắt buộc`
  })
});

module.exports = scheduleSchema;
