-- ============================================================================
-- Naruto-Themed Wedding Inventory Items
-- ============================================================================
-- This script adds Naruto-themed inventory items suitable for wedding rentals
-- All items are wedding-appropriate with Naruto anime/manga themes
-- ============================================================================

USE wedding_management_db;

-- Clear existing inventory items (optional - comment out if you want to keep existing data)
-- DELETE FROM inventory_allocation;
-- DELETE FROM inventory_items;

-- Insert Naruto-themed inventory items (excluding tables - tables are auto-created via API)
INSERT INTO inventory_items (item_name, category, item_condition, quantity_available, rental_cost) VALUES
-- Furniture Category (excluding tables)
('Uzumaki Clan Red Table Linens', 'Linens', 'Good', 50, 8.00),
('Shinobi Scroll Display Stands', 'Furniture', 'Excellent', 15, 35.00),
('Hidden Leaf Village Chair Covers (Red & White)', 'Linens', 'Good', 200, 3.50),
('Cocktail Tables (Decorative)', 'Furniture', 'Excellent', 10, 25.00),

-- Lighting Category
('Rasengan Glow Centerpieces (Blue)', 'Lighting', 'Excellent', 30, 45.00),
('Sharingan Pattern String Lights (Red)', 'Lighting', 'Good', 25, 30.00),
('Chakra Crystal Chandeliers', 'Lighting', 'Excellent', 8, 120.00),
('Nine-Tails Flame LED Candles', 'Lighting', 'Good', 40, 15.00),
('Hidden Leaf Lanterns', 'Lighting', 'Fair', 20, 25.00),

-- Decorations Category
('Konoha Village Banner Set', 'Decorations', 'Excellent', 12, 40.00),
('Naruto & Hinata Wedding Arch (Orange & White)', 'Decorations', 'Excellent', 5, 85.00),
('Shinobi Scroll Backdrop', 'Decorations', 'Good', 8, 55.00),
('Ramen Bowl Centerpieces', 'Decorations', 'Good', 30, 20.00),
('Ninja Tool Display Cases', 'Decorations', 'Fair', 6, 45.00),
('Akatsuki Cloud Pattern Table Runners', 'Decorations', 'Good', 25, 12.00),
('Sage Mode Toad Statues (Decorative)', 'Decorations', 'Excellent', 4, 75.00),
('Kunai & Shuriken Wall Decorations', 'Decorations', 'Good', 15, 30.00),

-- Audio/Visual Category
('Hidden Leaf Village Sound System', 'Audio/Visual', 'Excellent', 3, 250.00),
('Ninja Scroll Projector Screen', 'Audio/Visual', 'Good', 5, 80.00),
('Chakra Flow LED Dance Floor', 'Audio/Visual', 'Excellent', 2, 350.00),
('Konoha Village Photo Booth Props', 'Audio/Visual', 'Good', 10, 60.00),
('Shinobi Mission Scroll Guest Book Stand', 'Audio/Visual', 'Excellent', 8, 35.00);

-- ============================================================================
-- Summary
-- ============================================================================
-- Total Items Added: 21 (tables excluded - auto-created via API)
-- Categories:
--   - Furniture: 2 items (excluding tables)
--   - Linens: 2 items
--   - Lighting: 5 items
--   - Decorations: 8 items
--   - Audio/Visual: 5 items
-- 
-- Conditions:
--   - Excellent: 9 items
--   - Good: 10 items
--   - Fair: 1 item
-- 
-- Pricing Notes:
--   - Linens: 3.50-8.00 PHP (realistic for table linens and chair covers)
--   - Furniture: 25-35 PHP (display stands, cocktail tables)
--   - Lighting: 15-120 PHP (candles to chandeliers)
--   - Decorations: 12-85 PHP (runners to arches)
--   - Audio/Visual: 35-350 PHP (guest book stands to dance floors)
-- 
-- All items are priced in PHP and suitable for wedding rental use
-- Tables are NOT included as they are automatically created via the API
-- ============================================================================

