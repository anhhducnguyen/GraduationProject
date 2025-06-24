const db = require("../../config/database");
const crypto = require("crypto");
const transporter = require("../../config/email");

// Lấy một người dùng theo điều kiện
const findOne = async (condition) => {
  const result = await db("auth")
    .where(condition)
    .first();
  return result;
};

// Cập nhật mật khẩu bằng token reset
const resetPasswordByToken = async (token, hashedPassword) => {
  return await db("auth")
    .where({ reset_token: token })
    .update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null
    });
};

// Tìm người dùng theo token reset
const findUserByResetToken = async (token) => {
  return await db("auth").where({ reset_token: token }).first();
};

// Tạo người dùng mới
const createUser = async (newUser) => {
  const [userId] = await db("auth").insert(newUser).returning("id");
  return userId;
};

// Tìm người dùng theo ID
const findById = async (id) => {
  return await db("auth").where({ id }).first();
};

// Tìm người dùng theo email
const findUser = async (email) => {
  return await db("auth").where('email', email).first();
};

// Tạo tài khoản mới
const createAccount = async (email, hashedPassword) => {
  return await db("auth").insert({
    email,
    password: hashedPassword
  });
};

// Tìm người dùng theo email
const findEmail = async (email) => {
  return await db("auth")
  .where('email', email)
  .first();
};

// Tìm người dùng theo Google ID
const findByGoogleId = async (googleId) => {
  return await db("auth").where({ google_id: googleId }).first();
};

// Tạo token reset mật khẩu và lưu vào cơ sở dữ liệu
const generateResetToken = async (email) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000;

  await db("auth")
    .where({ email })
    .update({ reset_token: resetToken, reset_token_expiry: resetTokenExpiry });

  return resetToken;
};

// Gửi email đặt lại mật khẩu
const sendResetEmail = async (email, resetLink) => {
  return await transporter.sendMail({
    from: '"Support" <your-email@gmail.com>',
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `<p>Nhấn vào link sau để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a></p>`,
  });
};

module.exports = {
  findOne,
  resetPasswordByToken,
  findUserByResetToken,
  createUser,
  findById,
  findUser,
  createAccount,
  findEmail,
  findByGoogleId,
  generateResetToken,
  sendResetEmail,
};
