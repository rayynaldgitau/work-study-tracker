const db = require('../config/db');
require('dotenv').config();

(async () => {
    try {
        console.log("🏗️  Building database schema...");

        // 1. Departments Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS Departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Stations Table (Depends on Departments)
        await db.query(`
      CREATE TABLE IF NOT EXISTS Stations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department_id INT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL
      )
    `);

        // 3. Update Users Table (Add station_id if not there)
        // We already have the Users table, let's just make sure it has the right columns
        try {
            await db.query(`ALTER TABLE Users ADD COLUMN station_id INT`);
            await db.query(`ALTER TABLE Users ADD FOREIGN KEY (station_id) REFERENCES Stations(id)`);
        } catch (e) {
            console.log("Note: Users columns already exist or skipped.");
        }

        console.log("✅ All tables created successfully!");
        process.exit(0);
    } catch (err) {
        console.error('❌ Schema Build Failed:', err.message);
        process.exit(1);
    }
})();