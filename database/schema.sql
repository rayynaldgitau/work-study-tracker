-- Work-Study Timesheet Tracker — Full Schema
-- Run: mysql -u root -p < schema.sql

DROP DATABASE IF EXISTS work_study_tracker;
CREATE DATABASE work_study_tracker;
USE work_study_tracker;

CREATE TABLE Departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  department_id INT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES Departments(id) ON DELETE SET NULL
);

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
);

ALTER TABLE Stations
  ADD FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL;

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
);

-- Seed data
INSERT INTO Departments (name) VALUES
  ('Library'), ('IT Services'), ('Admissions'), ('Cafeteria'), ('Athletics');

INSERT INTO Stations (name, description, department_id) VALUES
  ('Front Desk', 'Library front desk attendant', 1),
  ('Help Desk', 'IT support and ticketing', 2),
  ('Application Review', 'Assist with admissions paperwork', 3),
  ('Kitchen Prep', 'Cafeteria prep station', 4);

-- Default admin: email = advisor@school.edu, password = admin123
-- Hash generated with: bcrypt.hashSync('admin123', 10)
INSERT INTO Users (name, email, password_hash, role) VALUES
  ('Advisor One', 'advisor@school.edu',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
