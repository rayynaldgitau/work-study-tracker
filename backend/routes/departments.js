const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Public — used in registration
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM Departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
