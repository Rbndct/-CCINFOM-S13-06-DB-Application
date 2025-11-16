-- ============================================================================
-- Wedding Inventory Items (Without Tables)
-- ============================================================================
-- This script adds inventory items suitable for wedding rentals
-- Tables are NOT included here as they are auto-created via the API
-- ============================================================================

USE wedding_management_db;

-- Clear existing inventory items (optional - comment out if you want to keep existing data)
-- DELETE FROM inventory_allocation;
-- DELETE FROM inventory_items;

-- Insert inventory items (excluding tables)
INSERT INTO inventory_items (item_name, category, item_condition, quantity_available, rental_cost) VALUES
-- Furniture Category (excluding tables)
('Round Table Linens (8-person)', 'Linens', 'Excellent', 50, 8.00),
('Round Table Linens (10-person)', 'Linens', 'Excellent', 50, 10.00),
('Round Table Linens (12-person)', 'Linens', 'Excellent', 50, 12.00),
('Chair Covers (White)', 'Linens', 'Good', 200, 3.50),
('Chair Covers (Ivory)', 'Linens', 'Good', 200, 3.50),
('Chair Covers (Gold)', 'Linens', 'Good', 150, 4.00),
('Table Runners (White)', 'Linens', 'Excellent', 100, 5.00),
('Table Runners (Gold)', 'Linens', 'Excellent', 100, 6.00),
('Napkins (White)', 'Linens', 'Good', 500, 0.50),
('Napkins (Gold)', 'Linens', 'Good', 500, 0.75),
('Display Stands', 'Furniture', 'Excellent', 15, 35.00),
('Bar Stools', 'Furniture', 'Good', 20, 15.00),
('Cocktail Tables', 'Furniture', 'Excellent', 10, 25.00),

-- Lighting Category
('LED String Lights (Warm White)', 'Lighting', 'Excellent', 30, 30.00),
('LED String Lights (Color Changing)', 'Lighting', 'Good', 25, 35.00),
('Chandeliers (Crystal)', 'Lighting', 'Excellent', 8, 120.00),
('Chandeliers (Modern)', 'Lighting', 'Excellent', 6, 100.00),
('LED Candles (Set of 12)', 'Lighting', 'Good', 40, 15.00),
('Uplighting (Per Unit)', 'Lighting', 'Excellent', 20, 25.00),
('Lanterns (Decorative)', 'Lighting', 'Fair', 20, 25.00),
('Spotlights', 'Lighting', 'Good', 15, 20.00),

-- Decorations Category
('Wedding Arch (White)', 'Decorations', 'Excellent', 5, 85.00),
('Wedding Arch (Gold)', 'Decorations', 'Excellent', 5, 95.00),
('Backdrop (Fabric)', 'Decorations', 'Good', 8, 55.00),
('Backdrop (Floral)', 'Decorations', 'Excellent', 6, 75.00),
('Centerpieces (Floral)', 'Decorations', 'Good', 30, 20.00),
('Centerpieces (Candle)', 'Decorations', 'Good', 30, 18.00),
('Centerpieces (Modern)', 'Decorations', 'Excellent', 25, 25.00),
('Table Numbers (Set of 20)', 'Decorations', 'Excellent', 10, 15.00),
('Welcome Sign', 'Decorations', 'Good', 8, 40.00),
('Photo Booth Props', 'Decorations', 'Good', 15, 30.00),
('Balloon Arches', 'Decorations', 'Good', 10, 50.00),
('Garlands (Floral)', 'Decorations', 'Good', 20, 35.00),

-- Audio/Visual Category
('Sound System (Basic)', 'Audio/Visual', 'Excellent', 3, 250.00),
('Sound System (Premium)', 'Audio/Visual', 'Excellent', 2, 400.00),
('Microphone Set (Wireless)', 'Audio/Visual', 'Good', 5, 80.00),
('Projector Screen', 'Audio/Visual', 'Good', 5, 80.00),
('Projector', 'Audio/Visual', 'Excellent', 3, 120.00),
('LED Dance Floor (10x10)', 'Audio/Visual', 'Excellent', 2, 350.00),
('Photo Booth Setup', 'Audio/Visual', 'Good', 10, 60.00),
('Guest Book Stand', 'Audio/Visual', 'Excellent', 8, 35.00),
('Video Camera Setup', 'Audio/Visual', 'Excellent', 2, 200.00),

-- Other Category
('Tent (10x10)', 'Other', 'Good', 5, 150.00),
('Tent (20x20)', 'Other', 'Good', 3, 300.00),
('Generator (Portable)', 'Other', 'Excellent', 4, 100.00),
('Coolers (Large)', 'Other', 'Good', 10, 20.00),
('Serving Trays', 'Other', 'Excellent', 30, 8.00),
('Beverage Dispensers', 'Other', 'Good', 15, 25.00),
('Cake Stand', 'Other', 'Excellent', 5, 30.00),
('Gift Table', 'Other', 'Good', 8, 20.00);

-- ============================================================================
-- Summary
-- ============================================================================
-- Total Items Added: 58
-- Categories:
--   - Linens: 10 items
--   - Furniture: 3 items (excluding tables)
--   - Lighting: 8 items
--   - Decorations: 12 items
--   - Audio/Visual: 9 items
--   - Other: 8 items
-- 
-- Note: Tables are NOT included in this script as they are automatically
-- created as inventory allocations when tables are created via the API.
-- Table inventory items are named: "{ceremony_type} Table - {capacity} seats"
-- ============================================================================

