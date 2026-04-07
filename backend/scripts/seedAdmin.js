// Create or reset the default admin account.
// Usage: node scripts/seedAdmin.js
const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

(async () => {
  const email = 'advisor@school.edu';
  const password = 'admin123';
  const name = 'Advisor One';
  try {
    const hash = await bcrypt.hash(password, 10);
    const [existing] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await db.query('UPDATE Users SET password_hash = ?, role = ? WHERE email = ?', [hash, 'admin', email]);
      console.log(`✅ Admin reset: ${email} / ${password}`);
    } else {
      await db.query(
        `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
        [name, email, hash]
      );
      console.log(`✅ Admin created: ${email} / ${password}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
})();
