const db = require('../config/db');
require('dotenv').config();

const rebuildDatabase = async () => {
    try {
        console.log("🧨 Initializing Database Reset...");

        // 1. Disable Foreign Key Checks (Crucial for Circular Dependencies)
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Drop existing tables in any order
        console.log("🗑️  Dropping old tables...");
        await db.query('DROP TABLE IF EXISTS Shifts');
        await db.query('DROP TABLE IF EXISTS Users');
        await db.query('DROP TABLE IF EXISTS Stations');
        await db.query('DROP TABLE IF EXISTS Departments');

        console.log("🏗️  Creating Departments table...");
        await db.query(`
      CREATE TABLE Departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log("🏗️  Creating Stations table...");
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

        console.log("🏗️  Creating Users table...");
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

        // 3. Add circular Foreign Key from Stations back to Users
        await db.query(`
      ALTER TABLE Stations 
      ADD CONSTRAINT fk_stations_created_by 
      FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL
    `);

        console.log("🏗️  Creating Shifts table...");
        await db.query(`
      CREATE TABLE Shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        station_id INT,
        clock_in DATETIME NOT NULL,
        clock_out DATETIME,
        task_description TEXT,
        total_hours DECIMAL(6,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (station_id) REFERENCES Stations(id) ON DELETE SET NULL
      )
    `);

        // 4. Re-enable Foreign Key Checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("🛡️  Foreign Key constraints re-enabled.");

        // 5. Seed Initial Data
        console.log("🌱 Seeding Initial Data...");

        // Seed Departments
        await db.query(`INSERT INTO Departments (name) VALUES 
      ('Library'), ('IT Services'), ('Admissions'), ('Cafeteria'), ('Athletics')`);

        // Seed Admin User (Password is 'admin123')
        const adminPasswordHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        await db.query(`
      INSERT INTO Users (name, email, password_hash, role) 
      VALUES ('Admin Advisor', 'advisor@school.edu', ?, 'admin')`,
            [adminPasswordHash]
        );

        // Seed Initial Stations
        await db.query(`INSERT INTO Stations (name, description, department_id, created_by) VALUES 
      ('Front Desk', 'Library front desk attendant', 1, 1),
      ('Help Desk', 'IT support and ticketing', 2, 1),
      ('Application Review', 'Assist with admissions paperwork', 3, 1)`);

        console.log("✅ Database successfully rebuilt and seeded!");
        process.exit(0);

    } catch (err) {
        // Safety check: always try to re-enable checks if it fails
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.error('❌ Migration Failed:', err.stack);
        process.exit(1);
    }
};

rebuildDatabase();