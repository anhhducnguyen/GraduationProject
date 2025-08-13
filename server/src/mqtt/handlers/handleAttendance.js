const db = require('../../../config/database');
const {
  checkStudentExists,
  getCurrentExamSchedules,
  checkAttendance,
  updateAttendance
} = require('../../../src/services/exam.attendance.service');
require('dotenv').config();

// Ngưỡng độ tin cậy tối thiểu để chấp nhận kết quả nhận diện khuôn mặt.
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

  let matchedSchedule = null; //Ca thi mà sinh viên thuộc về (nếu tìm thấy).
  let attendanceExists = null; //Thông tin điểm danh của sinh viên trong ca thi đó (nếu có).

  for (const schedule of schedules) {
    // Kiểm tra trong ca thi này (schedule) sinh viên có bản ghi điểm danh không
    const attendance = await checkAttendance(student_id, schedule.schedule_id);
    if (attendance) {
      // Nếu có => lưu lại ca thi này vào matchedSchedule
      matchedSchedule = schedule;
      // Lưu thông tin điểm danh để sau biết đã điểm danh hay chưa
      attendanceExists = attendance;
      // Dừng vòng lặp ngay khi tìm thấy ca phù hợp
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
  
  await updateAttendance(student_id, matchedSchedule.schedule_id, real_face, confidence);
  // await db('exam_attendance')
  //   .where({ student_id: student_id, schedule_id: matchedSchedule.schedule_id })
  //   .update({
  //     is_present: real_face ? 1 : 0,
  //     confidence,
  //     real_face,
  //     updated_at: new Date(),
  //     violation_id: null,
  //     reported_by: 3,
  //   });

  console.log(`Điểm danh thành công cho ${student_id}`);
}

module.exports = handleAttendanceMessage;
