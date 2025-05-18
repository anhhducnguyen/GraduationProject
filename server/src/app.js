const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");

const passport = require("../config/passport");
const session = require("express-session");
const sessionMiddleware = require('../config/session');

const cors = require('cors');
app.use(cors());

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const examAttendance = require("./routes/exam.attendance.routes");
const examSchedule = require('./routes/exam.schedule.routes');
const userRoutes = require('./routes/user.routes');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));

app.use('/api/v1/users', userRoutes);
app.use("/auth", authRoutes);
app.use("/api/v1/exam-attendance", examAttendance);
app.use('/api/v1/exam-schedule', examSchedule);




module.exports = app;
