const express = require('express');
const router = express.Router();
const db = require('../../config/database');

router.get('/overview', async (req, res) => {
    try {
        const [countByScheduleRes, statusCountRes, topFakeRes] = await Promise.all([
            db.raw(`
                SELECT 
                    ea.schedule_id,
                    ec.name_schedule,
                    COUNT(DISTINCT ea.student_id) AS fake_face_count
                FROM exam_attendance ea
                JOIN examschedules ec ON ea.schedule_id = ec.schedule_id
                WHERE ea.real_face = 0
                GROUP BY ea.schedule_id, ec.name_schedule
            `),
            db.raw(`
                SELECT status, COUNT(*) AS count
                FROM examschedules
                GROUP BY status
            `),
            db.raw(`
                SELECT 
                    es.schedule_id,
                    es.name_schedule,
                    COUNT(*) AS fake_face_count
                FROM exam_attendance ea
                JOIN examschedules es ON ea.schedule_id = es.schedule_id
                WHERE ea.real_face = 0
                GROUP BY es.schedule_id, es.name_schedule
                ORDER BY fake_face_count DESC
                LIMIT 5
            `)
        ]);

        const total_fake_faces = countByScheduleRes[0].reduce((sum, row) => sum + row.fake_face_count, 0);
        const total_students_result = await db.raw(`SELECT COUNT(DISTINCT student_id) AS total_students FROM exam_attendance`);
        const total_students = total_students_result[0][0]?.total_students || 0;

        const statusCount = statusCountRes[0].reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                total_fake_faces,
                total_students,
                statusCount,
                topFakeSchedules: topFakeRes[0]
            }
        });
    } catch (error) {
        console.error("Dashboard overview error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


router.get('/count-by-schedule', async (req, res) => {
    try {
        const query = `
            SELECT 
                ea.schedule_id,
                ec.name_schedule,
                COUNT(DISTINCT ea.student_id) AS fake_face_count
            FROM exam_attendance ea
            JOIN examschedules ec ON ea.schedule_id = ec.schedule_id
            WHERE ea.real_face = 0
            GROUP BY ea.schedule_id, ec.name_schedule
            ORDER BY fake_face_count DESC
        `;

        const result = await db.raw(query);
        const data = result[0];

        // Tính tổng tất cả sinh viên có khuôn mặt giả
        const total_fake_faces = data.reduce((sum, row) => sum + row.fake_face_count, 0);

        res.json({
            success: true,
            total_fake_faces,
            data
        });
    } catch (error) {
        console.error('Error counting fake face students by schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

router.get('/statistics/top-fake-faces', async (req, res) => {
    try {
        const query = `
            SELECT 
                es.schedule_id,
                es.name_schedule,
                COUNT(*) AS fake_face_count
            FROM exam_attendance ea
            JOIN examschedules es ON ea.schedule_id = es.schedule_id
            WHERE ea.real_face = 0
            GROUP BY es.schedule_id, es.name_schedule
            ORDER BY fake_face_count DESC
            LIMIT 5
        `;

        const [rows] = await db.raw(query);

        const formatted = rows.map(row => ({
            schedule_id: row.schedule_id,
            name_schedule: row.name_schedule,
            fake_face_count: row.fake_face_count
        }));

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error('Top fake face stats error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const { from, to, schedule_id, min_fake_percent } = req.query;

        const conditions = [];
        const params = [];

        // Theo khoảng thời gian (từ ngày - đến ngày)
        if (from) {
            conditions.push(`DATE(es.start_time) >= ?`);
            params.push(from);
        }
        if (to) {
            conditions.push(`DATE(es.start_time) <= ?`);
            params.push(to);
        }

        // Theo lịch cụ thể
        if (schedule_id) {
            conditions.push(`es.schedule_id = ?`);
            params.push(schedule_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                es.schedule_id,
                es.name_schedule,
                DATE(es.start_time) AS exam_date,

                COUNT(DISTINCT ea.student_id) AS total_students,
                SUM(CASE WHEN ea.is_present = 1 THEN 1 ELSE 0 END) AS total_present,
                SUM(CASE WHEN ea.real_face = 0 THEN 1 ELSE 0 END) AS fake_faces

            FROM examschedules es
            LEFT JOIN exam_attendance ea ON es.schedule_id = ea.schedule_id
            ${whereClause}
            GROUP BY es.schedule_id, es.name_schedule, exam_date
            ORDER BY exam_date DESC
        `;

        const [rows] = await db.raw(query, params);

        let formatted = rows.map((row, index) => {
            const total = row.total_students || 0;
            const present = row.total_present || 0;
            const fake = row.fake_faces || 0;
            const absentPercent = total > 0
                ? `${Math.round(((total - present) / total) * 100)}%`
                : '0%';
            const fakePercent = present > 0
                ? Math.round((fake / present) * 100)
                : 0;

            return {
                index: index + 1,
                schedule_id: row.schedule_id,
                name_schedule: row.name_schedule,
                exam_date: row.exam_date,
                total_present: present,
                fake_faces: fake,
                absent_percent: absentPercent,
                fake_percent: fakePercent
            };
        });

        // Lọc thêm theo tỉ lệ giả nếu có
        if (min_fake_percent) {
            const threshold = parseInt(min_fake_percent);
            formatted = formatted.filter(item => item.fake_percent >= threshold);
        }

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error('Filtered statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});



router.get('/schedule-status-count', async (req, res) => {
    try {
        const query = `
            SELECT status, COUNT(*) AS count
            FROM examschedules
            GROUP BY status
        `;

        const result = await db.raw(query);

        // Đưa về dạng object dễ đọc
        const counts = result[0].reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: counts
        });
    } catch (error) {
        console.error('Error fetching schedule status counts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

module.exports = router;




router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT ea.attendance_id,
                   ea.student_id,
                   a.email,
                   a.username,
                   ea.schedule_id,
                   ea.created_at,
                   ea.confidence,
                   ec.name_schedule,
                   u.first_name,
                   u.last_name
            FROM exam_attendance ea
            JOIN auth a ON ea.student_id = a.id
            JOIN users u ON u.id = a.id
            JOIN examschedules ec ON ec.schedule_id = ea.schedule_id
            WHERE ea.real_face = ?
        `;

        const result = await db.raw(query, [0]);

        // Gộp dữ liệu theo schedule_id
        const grouped = {};

        result[0].forEach(row => {
            const scheduleId = row.schedule_id;
            if (!grouped[scheduleId]) {
                grouped[scheduleId] = {
                    id: scheduleId,
                    name_schedule: row.name_schedule,
                    students: []
                };
            }

            grouped[scheduleId].students.push({
                id: row.student_id,
                email: row.email,
                first_name: row.first_name,
                last_name: row.last_name,
                // username: row.username,
                created_at: row.created_at,
                confidence: row.confidence
            });
        });

        // Trả về kết quả dạng mảng
        const formatted = Object.values(grouped);

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error('Error fetching fake face students:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const query = `
            SELECT 
                es.schedule_id,
                es.name_schedule,
                DATE(es.start_time) AS exam_date,

                -- Tổng số sinh viên có điểm danh (kể cả vắng)
                COUNT(DISTINCT ea.student_id) AS total_students,

                -- Số sinh viên có mặt
                SUM(CASE WHEN ea.is_present = 1 THEN 1 ELSE 0 END) AS total_present,

                -- Số khuôn mặt giả
                SUM(CASE WHEN ea.real_face = 0 THEN 1 ELSE 0 END) AS fake_faces

            FROM examschedules es
            LEFT JOIN exam_attendance ea ON es.schedule_id = ea.schedule_id
            GROUP BY es.schedule_id, es.name_schedule, exam_date
            ORDER BY exam_date DESC
        `;

        const [rows] = await db.raw(query);

        const formatted = rows.map((row, index) => {
            const total = row.total_students || 0;
            const present = row.total_present || 0;
            const fake = row.fake_faces || 0;
            const absentPercent = total > 0
                ? `${Math.round(((total - present) / total) * 100)}%`
                : '0%';

            return {
                index: index + 1,
                name_schedule: row.name_schedule,
                exam_date: row.exam_date,
                total_present: present,
                fake_faces: fake,
                absent_percent: absentPercent
            };
        });

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error('Error generating statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
});



module.exports = router;
