const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");

const passport = require("../config/passport");
const session = require("express-session");
const sessionMiddleware = require('../config/session');
const startMQTT = require('./mqtt/mqttClient');

startMQTT();

const cors = require('cors');
app.use(cors());

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const examAttendance = require("./routes/exam.attendance.routes");
const examCalendar = require('./routes/exam.calendar.routes');
const userRoutes = require('./routes/user.routes');
const ExamRoomsRoutes = require("./routes/exam.rooms.routes");
const ExamSchedulesRoutes = require("./routes/exam.schedules.routes");
const Dashboard = require("./routes/dashboard");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));

app.use('/api/v1/users', userRoutes);
app.use("/auth", authRoutes);
app.use("/api/v1/exam-attendance", examAttendance);
app.use('/api/v1/exam-schedule', examCalendar);
app.use("/api/v1/exam-rooms", ExamRoomsRoutes);
app.use("/api/v1/exam-schedules", ExamSchedulesRoutes);
app.use("/api/v1/dashboard", Dashboard);

module.exports = app;
