const db = require('../config/db');
require('dotenv').config();

const createSchema = async () => {
    try {
        console.log("🏗️  Starting full database schema build on Aiven...");

        // 1. Create Departments Table
        console.log("- Creating Departments...");
        await db.query(`
      CREATE TABLE IF NOT EXISTS Departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Create Stations Table
        console.log("- Creating Stations...");
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

        // 3. Create Users Table (if not exists) and add station_id
        console.log("- Ensuring Users table is complete...");
        await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student') DEFAULT 'student',
        station_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES Stations(id) ON DELETE SET NULL
      )
    `);

        // 4. Create Shifts Table (The one causing the 500 error!)
        console.log("- Creating Shifts...");
        await db.query(`
      CREATE TABLE IF NOT EXISTS Shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        station_id INT NOT NULL,
        clock_in DATETIME NOT NULL,
        clock_out DATETIME,
        description TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (station_id) REFERENCES Stations(id) ON DELETE CASCADE
      )
    `);

        console.log("✅ Database build complete! All tables are ready.");
        process.exit(0);
    } catch (err) {
        console.error('❌ Database build failed:', err.message);
        process.exit(1);
    }
};

createSchema();