const bcrypt = require("bcrypt");
const {
  resetPasswordByToken,
  findUserByResetToken,
  findById,
  createAccount,
  findEmail,
  generateResetToken,
  sendResetEmail,
} = require("../services/auth.service");

// Đăng ký người dùng mới
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await createAccount(email, hashedPassword);  

    res.json({ message: "Đăng ký người dùng thành công" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Đăng xuất người dùng
const logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Đăng xuất không thành công" });

      res.clearCookie("connect.sid");
      res.json({ message: "Đăng xuất thành công" });
    });
  });
};

// Xử lý yêu cầu đặt lại mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findEmail(email);  

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const resetToken = await generateResetToken(email);  
    // const resetLink = `http://localhost:5173/update-password?token=${resetToken}`;
    const resetLink = `https://graduation-project-psi-black.vercel.app/update-password?token=${resetToken}`;
    await sendResetEmail(email, resetLink); 

    res.json({ message: "Link đặt lại mật khẩu đã được gửi qua email" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xác nhận đặt lại mật khẩu
const confirmResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await findUserByResetToken(token);  

    if (!user || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await resetPasswordByToken(token, hashedPassword);  

    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    console.error("Error in confirmResetPassword:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy thông tin người dùng
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findById(userId);  

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    delete user.password;
    res.json({ message: "Thông tin người dùng", user });
  } catch (err) {
    console.error("Lỗi trong getProfile:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  register,
  logout,
  resetPassword,
  confirmResetPassword,
  getProfile,
};
