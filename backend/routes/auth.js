const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later' },
});

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const sanitize = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  department_id: u.department_id,
  station_id: u.station_id,
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existing] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO Users (name, email, password_hash, department_id, role)
       VALUES (?, ?, ?, ?, 'student')`,
      [name, email, password_hash, department_id || null]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: 'student',
      department_id: department_id || null,
      station_id: null,
    };
    res.status(201).json({ token: signToken(user), user: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user), user: sanitize(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — get current user details
router.get('/me', require('../middleware/auth'), async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.station_id, u.weekly_hour_limit,
              s.name AS station_name, d.name AS department_name
       FROM Users u
       LEFT JOIN Stations s ON u.station_id = s.id
       LEFT JOIN Departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
