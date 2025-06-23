const express = require('express');
const router = express.Router();
const {
    getExamSchedule,
    getAll
} = require('../controllers/exam.schedule.controller');

const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../../config/database');
const fs = require('fs');
// 


const upload = multer({ dest: 'uploads/' });

router.get(
    '/',
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    getAll
);

router.get(
    '/:id',
    // authenticate,
    // authorize([ROLES.ADMIN, ROLES.TEACHER]),
    getExamSchedule
);

// router.post('/import', upload.single('file'), async (req, res) => {
//   try {
//     const workbook = xlsx.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);
//     console.log('📄 Dữ liệu Excel:', rows);

//     const schedules = rows.map(row => ({
//       start_time: new Date(row.start_time),
//       end_time: new Date(row.end_time),
//       name_schedule: row.name_schedule,
//       status: row.status,
//       room_id: row.room_id,
//     }));

//     // Validate & insert từng dòng
//     for (const schedule of schedules) {
//       if (!schedule.room_id) continue;
//       await create(schedule); // hoặc service của bạn
//     }

//     res.status(200).json({ message: 'Imported successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Import failed' });
//   }
// });

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log('📄 Dữ liệu Excel:', rows);

    const schedules = rows.map(row => ({
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      name_schedule: row.name_schedule,
      status: row.status,
      room_id: row.room_id,
    }));

    let success = 0;
    let skipped = 0;

    for (const schedule of schedules) {
      if (!schedule.start_time || !schedule.end_time || !schedule.name_schedule || !schedule.status || !schedule.room_id) {
        skipped++;
        continue;
      }

      await db('examschedules').insert(schedule);
      success++;
    }

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Imported successfully',
      inserted: success,
      skipped,
    });
  } catch (err) {
    console.error('❌ Import error:', err);
    res.status(500).json({ message: 'Import failed', error: err.message });
  }
});



module.exports = router;
