-- Wedding Management Database Setup Script
-- Run this script to create the database and all required tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS wedding_management_db;
USE wedding_management_db;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS seating_table;
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS wedding;
DROP TABLE IF EXISTS couple_preferences;
DROP TABLE IF EXISTS menu_item;
DROP TABLE IF EXISTS dietary_restriction;
DROP TABLE IF EXISTS couple;

-- Create couple table
CREATE TABLE couple (
  couple_id INT AUTO_INCREMENT PRIMARY KEY,
  partner1_name VARCHAR(255) NOT NULL,
  partner2_name VARCHAR(255) NOT NULL,
  partner1_phone VARCHAR(50),
  partner2_phone VARCHAR(50),
  partner1_email VARCHAR(255),
  partner2_email VARCHAR(255),
  planner_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create dietary_restriction table
CREATE TABLE dietary_restriction (
  restriction_id INT AUTO_INCREMENT PRIMARY KEY,
  restriction_name VARCHAR(255) NOT NULL,
  severity_level VARCHAR(50),
  restriction_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create couple_preferences table
CREATE TABLE couple_preferences (
  preference_id INT AUTO_INCREMENT PRIMARY KEY,
  couple_id INT NOT NULL,
  ceremony_type VARCHAR(100),
  restriction_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL
);

-- Create wedding table
CREATE TABLE wedding (
  wedding_id INT AUTO_INCREMENT PRIMARY KEY,
  couple_id INT NOT NULL,
  wedding_date DATE NOT NULL,
  venue VARCHAR(255),
  budget DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'planning',
  preference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE,
  FOREIGN KEY (preference_id) REFERENCES couple_preferences(preference_id) ON DELETE SET NULL
);

-- Create guest table (singular - used by most routes)
CREATE TABLE guest (
  guest_id INT AUTO_INCREMENT PRIMARY KEY,
  wedding_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  rsvp_status VARCHAR(50) DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT FALSE,
  restriction_id INT,
  table_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL
);

-- Create guests table (plural - used by guests.js route)
-- This is a duplicate/alternative table - you may want to consolidate
CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wedding_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  rsvp_status VARCHAR(50) DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE
);

-- Create seating_table
CREATE TABLE seating_table (
  table_id INT AUTO_INCREMENT PRIMARY KEY,
  wedding_id INT NOT NULL,
  table_number VARCHAR(10) NOT NULL,
  table_category ENUM('couple', 'guest') NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE
);

-- Add foreign key for guest.table_id
ALTER TABLE guest 
ADD CONSTRAINT fk_guest_table 
FOREIGN KEY (table_id) REFERENCES seating_table(table_id) ON DELETE SET NULL;

-- Create menu_item table (referenced in dietary_restrictions route)
CREATE TABLE menu_item (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  restriction_id INT,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_wedding_couple_id ON wedding(couple_id);
CREATE INDEX idx_wedding_date ON wedding(wedding_date);
CREATE INDEX idx_guest_wedding_id ON guest(wedding_id);
CREATE INDEX idx_guest_table_id ON guest(table_id);
CREATE INDEX idx_seating_wedding_id ON seating_table(wedding_id);
CREATE INDEX idx_couple_preferences_couple_id ON couple_preferences(couple_id);

-- Insert sample data (optional)
-- Uncomment below to add sample data for testing

/*
-- Sample couple
INSERT INTO couple (partner1_name, partner2_name, partner1_email, partner2_email, planner_contact) 
VALUES ('John Doe', 'Jane Smith', 'john@example.com', 'jane@example.com', 'planner@example.com');

-- Sample dietary restriction
INSERT INTO dietary_restriction (restriction_name, severity_level, restriction_type) 
VALUES ('Vegetarian', 'Low', 'Dietary');

-- Get the couple_id and restriction_id for sample wedding
SET @couple_id = LAST_INSERT_ID() - 1;
SET @restriction_id = LAST_INSERT_ID();

-- Sample preference
INSERT INTO couple_preferences (couple_id, ceremony_type, restriction_id) 
VALUES (@couple_id, 'Traditional', @restriction_id);

SET @preference_id = LAST_INSERT_ID();

-- Sample wedding
INSERT INTO wedding (couple_id, wedding_date, venue, budget, status, preference_id) 
VALUES (@couple_id, '2024-12-25', 'Grand Hotel', 50000.00, 'planning', @preference_id);
*/

SELECT 'Database setup completed successfully!' AS message;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'wedding_management_db';

