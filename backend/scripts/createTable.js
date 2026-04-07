const db = require('../config/db'); // Uses your existing DB connection
require('dotenv').config();

(async () => {
    try {
        console.log("Creating Users table...");

        // The exact SQL needed based on your seed script
        await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log("✅ Users table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create table:', err.message);
        process.exit(1);
    }
})();