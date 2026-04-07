const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// POST /api/shifts — log a new shift
router.post('/', async (req, res, next) => {
  try {
    const { clock_in, clock_out, task_description, station_id } = req.body;
    if (!clock_in || !clock_out) {
      return res.status(400).json({ error: 'clock_in and clock_out required' });
    }
    const inDate = new Date(clock_in);
    const outDate = new Date(clock_out);
    if (isNaN(inDate) || isNaN(outDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (outDate <= inDate) {
      return res.status(400).json({ error: 'clock_out must be after clock_in' });
    }
    const total_hours = ((outDate - inDate) / (1000 * 60 * 60)).toFixed(2);

    // Use user's assigned station if none provided
    let stationId = station_id || null;
    if (!stationId) {
      const [[u]] = await db.query('SELECT station_id FROM Users WHERE id = ?', [req.user.id]);
      stationId = u?.station_id || null;
    }

    const [result] = await db.query(
      `INSERT INTO Shifts (user_id, station_id, clock_in, clock_out, task_description, total_hours)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, stationId, inDate, outDate, task_description || '', total_hours]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      station_id: stationId,
      clock_in,
      clock_out,
      task_description,
      total_hours,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts — current user's shifts
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT sh.*, st.name AS station_name
       FROM Shifts sh
       LEFT JOIN Stations st ON sh.station_id = st.id
       WHERE sh.user_id = ?
       ORDER BY sh.clock_in DESC`,
      [req.user.id]
    );
    const totalHours = rows.reduce((sum, r) => sum + Number(r.total_hours), 0);
    res.json({ shifts: rows, totalHours: totalHours.toFixed(2) });
  } catch (err) {
    next(err);
  }
});

// GET /api/shifts/weekly — weekly breakdown for current user
router.get('/weekly', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(DATE_SUB(clock_in, INTERVAL WEEKDAY(clock_in) DAY)) AS week_start,
              SUM(total_hours) AS hours
       FROM Shifts
       WHERE user_id = ? AND clock_in >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
       GROUP BY week_start
       ORDER BY week_start`,
      [req.user.id]
    );
    const [[current]] = await db.query(
      `SELECT COALESCE(SUM(total_hours),0) AS hours
       FROM Shifts
       WHERE user_id = ?
         AND clock_in >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)`,
      [req.user.id]
    );
    const [[u]] = await db.query('SELECT weekly_hour_limit FROM Users WHERE id = ?', [req.user.id]);

    res.json({
      weekly: rows,
      currentWeekHours: Number(current.hours),
      weeklyLimit: Number(u?.weekly_hour_limit || 20),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/shifts/:id — delete own shift
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Shifts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Shift not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
