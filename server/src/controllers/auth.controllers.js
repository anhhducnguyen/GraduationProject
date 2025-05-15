const bcrypt = require("bcrypt");
const {
  resetPasswordByToken,
  findUserByResetToken,
  findById,
  createAccount,
  findEmail,
  generateResetToken,
  sendResetEmail,
} = require("../services/auth.services");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await createAccount(email, hashedPassword);  

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });

      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findEmail(email);  

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const resetToken = await generateResetToken(email);  
    const resetLink = `http://localhost:5000/reset-password?token=${resetToken}`;
    await sendResetEmail(email, resetLink); 

    res.json({ message: "Link đặt lại mật khẩu đã được gửi qua email" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await findUserByResetToken(token);  

    if (!user || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await resetPasswordByToken(token, hashedPassword);  

    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    console.error("Error in confirmResetPassword:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findById(userId);  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    delete user.password;
    res.json({ message: "User info", user });
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  logout,
  resetPassword,
  confirmResetPassword,
  getProfile,
};
