const db = require('../../../config/database');
const {
  checkStudentExists,
  getCurrentExamSchedules,
  checkAttendance,
} = require('../../../src/services/exam.attendance.service');
require('dotenv').config();

const MIN_CONFIDENCE = parseFloat(process.env.MIN_CONFIDENCE) || 0.65;

async function handleAttendanceMessage(message) {
  const { student_id, confidence, real_face, timestamp } = message;

  if (!student_id || confidence === undefined || !timestamp) {
    console.warn("Dữ liệu thiếu hoặc không hợp lệ.");
    return;
  }

  if (confidence < MIN_CONFIDENCE) {
    console.warn(`Độ tin cậy thấp (${confidence})`);
    return;
  }

  const studentExists = await checkStudentExists(student_id);
  if (!studentExists) {
    console.warn(`Sinh viên ${student_id} không tồn tại.`);
    return;
  }

  const schedules = await getCurrentExamSchedules();
  if (!schedules.length) {
    console.warn("Không có ca thi nào đang diễn ra.");
    return;
  }

  let matchedSchedule = null;
  let attendanceExists = null;

  for (const schedule of schedules) {
    const attendance = await checkAttendance(student_id, schedule.schedule_id);
    if (attendance) {
      matchedSchedule = schedule;
      attendanceExists = attendance;
      break;
    }
  }

  if (!matchedSchedule) {
    console.warn(`Sinh viên ${student_id} không thuộc ca thi nào.`);
    return;
  }

  if (attendanceExists.is_present === 1) {
    console.log(`Sinh viên ${student_id} đã điểm danh trước đó.`);
    return;
  }

  await db('exam_attendance')
    .where({ student_id: student_id, schedule_id: matchedSchedule.schedule_id })
    .update({
      is_present: real_face ? 1 : 0,
      confidence,
      real_face,
      updated_at: new Date(),
      violation_id: null,
      reported_by: 3,
    });

  console.log(`Điểm danh thành công cho ${student_id}`);
}

module.exports = handleAttendanceMessage;
