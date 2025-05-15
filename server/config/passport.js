const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Services = require("../src/services/auth.services");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// passport.use(new LocalStrategy(
//   { usernameField: "email" },
//   async function (email, password, done) {
//     try {
//       const user = await Services.findOne({ email: email });
//       if (!user) return done(null, false, { message: "User not found" });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return done(null, false, { message: "Incorrect password" });

//       delete user.password;
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

const jwt = require("jsonwebtoken");

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async function (email, password, done) {
    try {
      const user = await Services.findOne({ email });
      if (!user) return done(null, false, { message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      // ✅ Không serializeUser, mà trả về token
      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      return done(null, { 
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at, 
          updated_at: user.updated_at
        } 
      });
    } catch (err) {
      return done(err);
    }
  }
));


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Services.findByGoogleId(profile.id);

        if (!user) {
          const newUser = {
            google_id: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          };

          const userId = await Services.createUser(newUser);
          newUser.id = userId;
          return done(null, newUser);
        }

        delete user.password;
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user (lưu ID vào session hoặc JWT)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (lấy thông tin user từ ID)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Services.findById(id);
    if (user) delete user.password;
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
