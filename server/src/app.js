const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require('cors');
const sessionMiddleware = require('../config/session');
const passport = require("../config/passport");
const dotenv = require("dotenv");

dotenv.config();

app.use(cors());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));

// Import routes
const authRoutes = require("./routes/auth.routes");
const examAttendance = require("./routes/exam.attendance.routes");
const examCalendar = require('./routes/exam.calendar.routes');
const userRoutes = require('./routes/user.routes');
const ExamRoomsRoutes = require("./routes/exam.rooms.routes");
const ExamSchedulesRoutes = require("./routes/exam.schedules.routes");
const Dashboard = require("./routes/dashboard");
const fakeFacesRoutes = require('./routes/fake.faces');

// Register routes
app.use('/api/v1/users', userRoutes);
app.use("/auth", authRoutes);
app.use("/api/v1/exam-attendance", examAttendance);
app.use('/api/v1/exam-schedule', examCalendar);
app.use("/api/v1/exam-rooms", ExamRoomsRoutes);
app.use("/api/v1/exam-schedules", ExamSchedulesRoutes);
app.use("/api/v1/dashboard", Dashboard);
app.use('/api/v1/fake-faces', fakeFacesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Page not found" });
});

module.exports = app;

// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const morgan = require("morgan");
// const dotenv = require("dotenv");

// const passport = require("../config/passport");
// const session = require("express-session");
// const sessionMiddleware = require('../config/session');
// const startMQTT = require('./mqtt/mqttClient');
// const cloudinary = require('../config/cloudinary');

// startMQTT();

// const cors = require('cors');
// app.use(cors());

// app.use(sessionMiddleware);
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(express.json());

// dotenv.config();

// const authRoutes = require("./routes/auth.routes");
// const examAttendance = require("./routes/exam.attendance.routes");
// const examCalendar = require('./routes/exam.calendar.routes');
// const userRoutes = require('./routes/user.routes');
// const ExamRoomsRoutes = require("./routes/exam.rooms.routes");
// const ExamSchedulesRoutes = require("./routes/exam.schedules.routes");
// const Dashboard = require("./routes/dashboard");
// const fakeFacesRoutes = require('./routes/fake.faces');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(morgan("dev"));
// app.use(express.static("public"));

// app.use('/api/v1/users', userRoutes);
// app.use("/auth", authRoutes);
// app.use("/api/v1/exam-attendance", examAttendance);
// app.use('/api/v1/exam-schedule', examCalendar);
// app.use("/api/v1/exam-rooms", ExamRoomsRoutes);
// app.use("/api/v1/exam-schedules", ExamSchedulesRoutes);
// app.use("/api/v1/dashboard", Dashboard);
// app.use('/api/v1/fake-faces', fakeFacesRoutes);


// module.exports = app;
