const express = require("express");
const passport = require("passport");
const router = express.Router();
const { 
  register,
  logout,
  resetPassword,
  confirmResetPassword,
  getProfile
} = require("../controllers/auth.controllers");  // Destructure controller functions

const { checkEmailExist } = require("../middlewares/checkEmailExist");
const { registerUserSchema } = require("../middlewares/validate-schema");
const validateRequest = require("../middlewares/validateRequest");
const passportLocalLogin = require("../middlewares/passportLocalLogin");
const verifyJWT = require("../middlewares/authJWT");

require("dotenv").config();

router.post(
  "/register",
//   validateRequest(registerUserSchema),  
  checkEmailExist,  
  register  
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, data, info) => {
    if (err || !data) return res.status(401).json({ message: info.message });

    return res.json({ 
      token: data.token,
      user: data.user
    });
  })(req, res, next);
});


router.post(
  "/login",
  passportLocalLogin  
);

router.post(
  "/logout",
  logout  
);

router.post(
  "/reset-password",
  resetPassword  
);

router.post(
  "/reset-password/confirm",
  confirmResetPassword  
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    res.redirect("/auth/success");
  }
);

router.get("/success", (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

router.get("/fail", (req, res) => {
  res.status(401).json({ message: "Login failed" });
});

router.get(
    "/profile", 
    verifyJWT, 
    getProfile
);  

module.exports = router;
