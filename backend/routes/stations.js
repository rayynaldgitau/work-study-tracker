const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
router.use(auth);

// GET /api/stations — list all stations (any authenticated user)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, d.name AS department_name,
              (SELECT COUNT(*) FROM Users u WHERE u.station_id = s.id) AS student_count
       FROM Stations s
       LEFT JOIN Departments d ON s.department_id = d.id
       ORDER BY s.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/stations — admin only
router.post('/', admin, async (req, res, next) => {
  try {
    const { name, description, department_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const [result] = await db.query(
      `INSERT INTO Stations (name, description, department_id, created_by)
       VALUES (?, ?, ?, ?)`,
      [name, description || '', department_id || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId, name, description, department_id });
  } catch (err) {
    next(err);
  }
});

// PUT /api/stations/:id — admin only
router.put('/:id', admin, async (req, res, next) => {
  try {
    const { name, description, department_id } = req.body;
    await db.query(
      `UPDATE Stations SET name = ?, description = ?, department_id = ? WHERE id = ?`,
      [name, description || '', department_id || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/stations/:id — admin only
router.delete('/:id', admin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM Stations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
