-- ============================================================================
-- Wedding Management Database - Complete Setup Script
-- This script creates the database, all tables, and applies all migrations
-- ============================================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS wedding_management_db;
CREATE DATABASE wedding_management_db;
USE wedding_management_db;

-- ============================================================================
-- DROP ALL TABLES (in reverse order of dependencies)
-- ============================================================================
DROP TABLE IF EXISTS inventory_allocation;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS table_package;
DROP TABLE IF EXISTS package_menu_items;
DROP TABLE IF EXISTS package;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS menu_item;
DROP TABLE IF EXISTS guest_restrictions;
DROP TABLE IF EXISTS couple_preference_restrictions;
DROP TABLE IF EXISTS preference_dietary_restrictions;
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS seating_table;
DROP TABLE IF EXISTS wedding;
DROP TABLE IF EXISTS couple_preferences;
DROP TABLE IF EXISTS dietary_restriction;
DROP TABLE IF EXISTS couple;

-- ============================================================================
-- CREATE BASE TABLES
-- ============================================================================

-- Create couple table
CREATE TABLE couple (
    couple_id INT AUTO_INCREMENT PRIMARY KEY,
    partner1_name VARCHAR(255) NOT NULL,
    partner2_name VARCHAR(255) NOT NULL,
    partner1_phone VARCHAR(50) NOT NULL,
    partner2_phone VARCHAR(50) NOT NULL,
    partner1_email VARCHAR(255) NOT NULL,
    partner2_email VARCHAR(255) NOT NULL,
    planner_contact VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create dietary_restriction table
CREATE TABLE dietary_restriction (
    restriction_id INT AUTO_INCREMENT PRIMARY KEY,
    restriction_name VARCHAR(255) NOT NULL,
    severity_level VARCHAR(50) NOT NULL,
    restriction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create couple_preferences table
CREATE TABLE couple_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    couple_id INT NOT NULL,
    ceremony_type VARCHAR(100) NOT NULL,
    restriction_id INT NULL, -- Made nullable for junction table support
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL
);

-- Create wedding table
CREATE TABLE wedding (
    wedding_id INT PRIMARY KEY AUTO_INCREMENT,
    couple_id INT NOT NULL,
    guest_count INT,
    equipment_rental_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    food_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2), -- Calculated as equipment_rental_cost + food_cost
    venue VARCHAR(255) NOT NULL,
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    preference_id INT NULL, -- Added via migration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE,
    FOREIGN KEY (preference_id) REFERENCES couple_preferences(preference_id) ON DELETE SET NULL
);

-- Create seating_table
CREATE TABLE seating_table (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    table_number VARCHAR(50),
    table_category VARCHAR(100),
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE
);

-- Create guest table (primary table - uses guest_name)
CREATE TABLE guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    table_id INT,
    restriction_id INT NULL, -- Made nullable for junction table support
    rsvp_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES seating_table(table_id) ON DELETE SET NULL,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL
);

-- Create menu_item table
CREATE TABLE menu_item (
    menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
    menu_name VARCHAR(255) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    default_markup_percentage DECIMAL(5,2) DEFAULT 200.00,
    cost_override BOOLEAN DEFAULT FALSE,
    menu_type VARCHAR(100) NOT NULL,
    restriction_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE SET NULL,
    INDEX idx_menu_item_unit_cost (unit_cost),
    INDEX idx_menu_item_selling_price (selling_price)
);

-- Create ingredient table
CREATE TABLE ingredient (
    ingredient_id INT PRIMARY KEY NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock_quantity DECIMAL(10,2) NOT NULL,
    re_order_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create recipe table
CREATE TABLE recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_needed DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE,
    UNIQUE (menu_item_id, ingredient_id)
);

-- Create package table
CREATE TABLE package (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    default_markup_percentage DECIMAL(5,2) DEFAULT 180.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_unit_cost (unit_cost),
    INDEX idx_package_selling_price (selling_price)
);

-- Create package_menu_items table
CREATE TABLE package_menu_items (
    package_menu_id INT PRIMARY KEY AUTO_INCREMENT,
    package_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES package(package_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id) ON DELETE CASCADE
);

-- Create table_package table
CREATE TABLE table_package (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    package_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES seating_table(table_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES package(package_id) ON DELETE CASCADE
);

-- Create inventory_items table
CREATE TABLE inventory_items (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_condition VARCHAR(50) NOT NULL,
    quantity_available INT NOT NULL,
    unit_rental_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create inventory_allocation table
CREATE TABLE inventory_allocation (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity_used INT NOT NULL,
    unit_rental_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory_items(inventory_id) ON DELETE CASCADE
);

-- ============================================================================
-- MIGRATIONS: Create Junction Tables for Many-to-Many Relationships
-- ============================================================================
-- Note: The following migrations are incorporated into this setup script:
-- - create_guest_restrictions_junction.sql (Migration 1 below)
-- - create_couple_preference_restrictions_junction.sql (Migration 2 below)
-- - menu_item_restrictions junction table (Migration 3 below)
-- - add_preference_id_to_wedding.sql (incorporated in wedding table definition)
-- - rename_cost_fields_to_accounting_standards.sql (incorporated in table definitions)
-- - add_preference_restrictions_junction.sql (replaced by Migration 2)
-- - Pricing structure updates (incorporated in table definitions):
--   * Pricing simplified: ingredients have no cost, only menu items have pricing
--   * unit_cost, selling_price, default_markup_percentage, cost_override in menu_item table
--   * unit_cost, selling_price, default_markup_percentage in package table

-- Migration 1: Create guest_restrictions junction table
-- This allows guests to have multiple dietary restrictions
-- Source: create_guest_restrictions_junction.sql
CREATE TABLE guest_restrictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    restriction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
    UNIQUE KEY unique_guest_restriction (guest_id, restriction_id),
    INDEX idx_gr_guest_id (guest_id),
    INDEX idx_gr_restriction_id (restriction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration 2: Create couple_preference_restrictions junction table
-- This allows each preference to have multiple dietary restrictions
-- Source: create_couple_preference_restrictions_junction.sql
-- Note: This replaces the earlier preference_dietary_restrictions table
CREATE TABLE couple_preference_restrictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    preference_id INT NOT NULL,
    restriction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preference_id) REFERENCES couple_preferences(preference_id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
    UNIQUE KEY unique_preference_restriction (preference_id, restriction_id),
    INDEX idx_cpr_preference_id (preference_id),
    INDEX idx_cpr_restriction_id (restriction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration 3: Create menu_item_restrictions junction table
-- This allows menu items to have multiple dietary restrictions
CREATE TABLE menu_item_restrictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    restriction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_item_restriction (menu_item_id, restriction_id),
    INDEX idx_mir_menu_item_id (menu_item_id),
    INDEX idx_mir_restriction_id (restriction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Wedding table indexes
CREATE INDEX idx_wedding_couple_id ON wedding(couple_id);
CREATE INDEX idx_wedding_date ON wedding(wedding_date);
CREATE INDEX idx_wedding_preference_id ON wedding(preference_id);

-- Guest table indexes
CREATE INDEX idx_guest_wedding_id ON guest(wedding_id);
CREATE INDEX idx_guest_table_id ON guest(table_id);

-- Seating table indexes
CREATE INDEX idx_seating_wedding_id ON seating_table(wedding_id);

-- Couple preferences indexes
CREATE INDEX idx_couple_preferences_couple_id ON couple_preferences(couple_id);

-- Package indexes
CREATE INDEX idx_package_menu_items_package_id ON package_menu_items(package_id);
CREATE INDEX idx_package_menu_items_menu_item_id ON package_menu_items(menu_item_id);

-- Table package indexes
CREATE INDEX idx_table_package_table_id ON table_package(table_id);
CREATE INDEX idx_table_package_package_id ON table_package(package_id);

-- Inventory allocation indexes
CREATE INDEX idx_inventory_allocation_wedding_id ON inventory_allocation(wedding_id);
CREATE INDEX idx_inventory_allocation_inventory_id ON inventory_allocation(inventory_id);

-- Recipe indexes
CREATE INDEX idx_recipe_menu_item_id ON recipe(menu_item_id);
CREATE INDEX idx_recipe_ingredient_id ON recipe(ingredient_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Database setup completed successfully!' AS message;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'wedding_management_db';

-- Show all created tables
SHOW TABLES;
