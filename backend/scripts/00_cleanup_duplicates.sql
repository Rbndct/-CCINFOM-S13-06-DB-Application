-- ============================================================================
-- Cleanup All Data Script
-- ============================================================================
-- This script removes ALL data from tables to ensure a clean state before
-- running insert scripts. It deletes data in reverse dependency order to
-- respect foreign key constraints.
-- 
-- This script is automatically run before all insert scripts to ensure
-- fresh data is inserted every time.
-- ============================================================================

USE wedding_management_db;

-- Disable foreign key checks temporarily to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data in reverse dependency order (child tables first, then parent tables)

-- 1. Delete from junction/relationship tables first (only if they exist)
DELETE FROM guest_restrictions WHERE 1=1;
DELETE FROM couple_preference_restrictions WHERE 1=1;
DELETE FROM menu_item_restrictions WHERE 1=1;
DELETE FROM table_package WHERE 1=1;
DELETE FROM inventory_allocation WHERE 1=1;

-- 2. Delete from main data tables
DELETE FROM guest WHERE 1=1;
DELETE FROM seating_table WHERE 1=1;
DELETE FROM wedding WHERE 1=1;
DELETE FROM couple_preferences WHERE 1=1;
DELETE FROM couple WHERE 1=1;
DELETE FROM inventory_items WHERE 1=1;

-- 3. Delete from food-related tables (these are recreated by 01_insert_food_data.sql)
DELETE FROM package_menu_items WHERE 1=1;
DELETE FROM package WHERE 1=1;
DELETE FROM recipe WHERE 1=1;
DELETE FROM menu_item WHERE 1=1;
DELETE FROM ingredient WHERE 1=1;
DELETE FROM dietary_restriction WHERE 1=1;

-- Reset AUTO_INCREMENT counters to start from 1
ALTER TABLE guest AUTO_INCREMENT = 1;
ALTER TABLE seating_table AUTO_INCREMENT = 1;
ALTER TABLE wedding AUTO_INCREMENT = 1;
ALTER TABLE couple_preferences AUTO_INCREMENT = 1;
ALTER TABLE couple AUTO_INCREMENT = 1;
ALTER TABLE inventory_items AUTO_INCREMENT = 1;
ALTER TABLE package AUTO_INCREMENT = 1;
ALTER TABLE recipe AUTO_INCREMENT = 1;
ALTER TABLE menu_item AUTO_INCREMENT = 1;
ALTER TABLE ingredient AUTO_INCREMENT = 1;
ALTER TABLE dietary_restriction AUTO_INCREMENT = 1;
ALTER TABLE inventory_allocation AUTO_INCREMENT = 1;
ALTER TABLE table_package AUTO_INCREMENT = 1;
ALTER TABLE package_menu_items AUTO_INCREMENT = 1;
ALTER TABLE menu_item_restrictions AUTO_INCREMENT = 1;
ALTER TABLE guest_restrictions AUTO_INCREMENT = 1;
ALTER TABLE couple_preference_restrictions AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Summary
-- ============================================================================
-- This script deletes ALL data from:
--   - guest_restrictions
--   - couple_preference_restrictions
--   - menu_item_restrictions
--   - table_package
--   - inventory_allocation
--   - guest
--   - seating_table
--   - wedding
--   - couple_preferences
--   - couple
--   - inventory_items
--   - package_menu_items
--   - package
--   - recipe
--   - menu_item
--   - ingredient
--   - dietary_restriction
-- ============================================================================
