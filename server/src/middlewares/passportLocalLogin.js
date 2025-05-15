const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET, // Nhớ tạo biến này trong .env
    //   { expiresIn: "1d" } // Token hết hạn sau 1 ngày
      { expiresIn: '2m' }
    );

    return res.json({
      message: "Login successful",
      token: token,
      user: user,
    });
  })(req, res, next);
};
