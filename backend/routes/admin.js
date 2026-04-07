const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
router.use(auth, admin);

// GET /api/admin/students — all students with totals
router.get('/students', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.weekly_hour_limit,
              s.id AS station_id, s.name AS station_name,
              d.name AS department_name,
              COALESCE(SUM(sh.total_hours), 0) AS total_hours,
              COALESCE((
                SELECT SUM(total_hours) FROM Shifts
                WHERE user_id = u.id
                  AND clock_in >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
              ), 0) AS current_week_hours
       FROM Users u
       LEFT JOIN Stations s ON u.station_id = s.id
       LEFT JOIN Departments d ON u.department_id = d.id
       LEFT JOIN Shifts sh ON sh.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/students/:id/allocate — assign station + limit
router.put('/students/:id/allocate', async (req, res, next) => {
  try {
    const { station_id, weekly_hour_limit } = req.body;
    await db.query(
      `UPDATE Users
       SET station_id = ?, weekly_hour_limit = ?
       WHERE id = ? AND role = 'student'`,
      [station_id || null, weekly_hour_limit || 20, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/overview — totals + chart data
router.get('/overview', async (req, res, next) => {
  try {
    const [byStation] = await db.query(
      `SELECT s.name AS station, COALESCE(SUM(sh.total_hours),0) AS hours
       FROM Stations s
       LEFT JOIN Shifts sh ON sh.station_id = s.id
       GROUP BY s.id
       ORDER BY hours DESC`
    );
    const [weekly] = await db.query(
      `SELECT DATE(DATE_SUB(clock_in, INTERVAL WEEKDAY(clock_in) DAY)) AS week_start,
              SUM(total_hours) AS hours
       FROM Shifts
       WHERE clock_in >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
       GROUP BY week_start
       ORDER BY week_start`
    );
    const [[counts]] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM Users WHERE role='student') AS total_students,
        (SELECT COUNT(*) FROM Stations) AS total_stations,
        (SELECT COALESCE(SUM(total_hours),0) FROM Shifts) AS total_hours,
        (SELECT COUNT(*) FROM Users WHERE role='student' AND station_id IS NULL) AS unallocated`
    );
    res.json({ byStation, weekly, counts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
