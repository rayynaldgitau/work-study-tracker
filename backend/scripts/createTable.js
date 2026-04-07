const db = require('../config/db');
require('dotenv').config();

const rebuildDatabase = async () => {
    try {
        console.log("🧨 Cleaning up old tables...");
        // Must drop in this order due to Foreign Key constraints
        await db.query(`DROP TABLE IF EXISTS Shifts`);
        await db.query(`DROP TABLE IF EXISTS Users`);
        await db.query(`DROP TABLE IF EXISTS Stations`);
        await db.query(`DROP TABLE IF EXISTS Departments`);

        console.log("🏗️  Building your Official Schema...");

        // 1. Departments
        await db.query(`
      CREATE TABLE Departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Stations (Wait to add created_by FK until Users exists)
        await db.query(`
      CREATE TABLE Stations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        department_id INT,
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL
      )
    `);

        // 3. Users
        await db.query(`
      CREATE TABLE Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        department_id INT,
        station_id INT,
        weekly_hour_limit DECIMAL(5,2) DEFAULT 20.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL,
        FOREIGN KEY (station_id) REFERENCES Stations(id) ON DELETE SET NULL
      )
    `);

        // 4. Add circular FK back to Stations
        await db.query(`
      ALTER TABLE Stations
      ADD FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL
    `);

        // 5. Shifts
        await db.query(`
      CREATE TABLE Shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        station_id INT,
        clock_in DATETIME NOT NULL,
        clock_out DATETIME NOT NULL,
        task_description TEXT,
        total_hours DECIMAL(6,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (station_id) REFERENCES Stations(id) ON DELETE SET NULL
      )
    `);

        console.log("🌱 Seeding Initial Data...");
        await db.query(`INSERT INTO Departments (name) VALUES 
      ('Library'), ('IT Services'), ('Admissions'), ('Cafeteria'), ('Athletics')`);

        await db.query(`INSERT INTO Stations (name, description, department_id) VALUES 
      ('Front Desk', 'Library front desk attendant', 1),
      ('Help Desk', 'IT support and ticketing', 2),
      ('Application Review', 'Assist with admissions paperwork', 3),
      ('Kitchen Prep', 'Cafeteria prep station', 4)`);

        await db.query(`INSERT INTO Users (name, email, password_hash, role) VALUES 
      ('Advisor One', 'advisor@school.edu', 
       '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')`);

        console.log("✅ Success! Database is fully synced and seeded.");
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Failed:', err.message);
        process.exit(1);
    }
};

rebuildDatabase();