-- ============================================================================
-- Insert Inventory Items
-- ============================================================================
-- This script inserts inventory items suitable for wedding rentals
-- Note: Tables are NOT included here as they are auto-created via the API
-- ============================================================================

USE wedding_management_db;

-- Clear existing inventory items (optional - comment out if you want to keep existing data)
-- DELETE FROM inventory_allocation;
-- DELETE FROM inventory_items;

-- Insert inventory items (excluding tables) - with duplicate prevention
INSERT INTO inventory_items (item_name, category, item_condition, quantity_available, unit_rental_cost)
SELECT item_name, category, item_condition, quantity_available, unit_rental_cost FROM (
  SELECT 'Round Table Linens (8-person)' as item_name, 'Linens' as category, 'Excellent' as item_condition, 50 as quantity_available, 8.00 as unit_rental_cost
  UNION ALL SELECT 'Round Table Linens (10-person)', 'Linens', 'Excellent', 50, 10.00
  UNION ALL SELECT 'Round Table Linens (12-person)', 'Linens', 'Excellent', 50, 12.00
  UNION ALL SELECT 'Chair Covers (White)', 'Linens', 'Good', 200, 3.50
  UNION ALL SELECT 'Chair Covers (Ivory)', 'Linens', 'Good', 200, 3.50
  UNION ALL SELECT 'Chair Covers (Gold)', 'Linens', 'Good', 150, 4.00
  UNION ALL SELECT 'Table Runners (White)', 'Linens', 'Excellent', 100, 5.00
  UNION ALL SELECT 'Table Runners (Gold)', 'Linens', 'Excellent', 100, 6.00
  UNION ALL SELECT 'Napkins (White)', 'Linens', 'Good', 500, 0.50
  UNION ALL SELECT 'Napkins (Gold)', 'Linens', 'Good', 500, 0.75
  UNION ALL SELECT 'Display Stands', 'Furniture', 'Excellent', 15, 35.00
  UNION ALL SELECT 'Bar Stools', 'Furniture', 'Good', 20, 15.00
  UNION ALL SELECT 'Cocktail Tables', 'Furniture', 'Excellent', 10, 25.00
  UNION ALL SELECT 'LED String Lights (Warm White)', 'Lighting', 'Excellent', 30, 30.00
  UNION ALL SELECT 'LED String Lights (Color Changing)', 'Lighting', 'Good', 25, 35.00
  UNION ALL SELECT 'Chandeliers (Crystal)', 'Lighting', 'Excellent', 8, 120.00
  UNION ALL SELECT 'Chandeliers (Modern)', 'Lighting', 'Excellent', 6, 100.00
  UNION ALL SELECT 'LED Candles (Set of 12)', 'Lighting', 'Good', 40, 15.00
  UNION ALL SELECT 'Uplighting (Per Unit)', 'Lighting', 'Excellent', 20, 25.00
  UNION ALL SELECT 'Lanterns (Decorative)', 'Lighting', 'Fair', 20, 25.00
  UNION ALL SELECT 'Spotlights', 'Lighting', 'Good', 15, 20.00
  UNION ALL SELECT 'Wedding Arch (White)', 'Decorations', 'Excellent', 5, 85.00
  UNION ALL SELECT 'Wedding Arch (Gold)', 'Decorations', 'Excellent', 5, 95.00
  UNION ALL SELECT 'Backdrop (Fabric)', 'Decorations', 'Good', 8, 55.00
  UNION ALL SELECT 'Backdrop (Floral)', 'Decorations', 'Excellent', 6, 75.00
  UNION ALL SELECT 'Centerpieces (Floral)', 'Decorations', 'Good', 30, 20.00
  UNION ALL SELECT 'Centerpieces (Candle)', 'Decorations', 'Good', 30, 18.00
  UNION ALL SELECT 'Centerpieces (Modern)', 'Decorations', 'Excellent', 25, 25.00
  UNION ALL SELECT 'Table Numbers (Set of 20)', 'Decorations', 'Excellent', 10, 15.00
  UNION ALL SELECT 'Welcome Sign', 'Decorations', 'Good', 8, 40.00
  UNION ALL SELECT 'Photo Booth Props', 'Decorations', 'Good', 15, 30.00
  UNION ALL SELECT 'Balloon Arches', 'Decorations', 'Good', 10, 50.00
  UNION ALL SELECT 'Garlands (Floral)', 'Decorations', 'Good', 20, 35.00
  UNION ALL SELECT 'Sound System (Basic)', 'Audio/Visual', 'Excellent', 3, 250.00
  UNION ALL SELECT 'Sound System (Premium)', 'Audio/Visual', 'Excellent', 2, 400.00
  UNION ALL SELECT 'Microphone Set (Wireless)', 'Audio/Visual', 'Good', 5, 80.00
  UNION ALL SELECT 'Projector Screen', 'Audio/Visual', 'Good', 5, 80.00
  UNION ALL SELECT 'Projector', 'Audio/Visual', 'Excellent', 3, 120.00
  UNION ALL SELECT 'LED Dance Floor (10x10)', 'Audio/Visual', 'Excellent', 2, 350.00
  UNION ALL SELECT 'Photo Booth Setup', 'Audio/Visual', 'Good', 10, 60.00
  UNION ALL SELECT 'Guest Book Stand', 'Audio/Visual', 'Excellent', 8, 35.00
  UNION ALL SELECT 'Video Camera Setup', 'Audio/Visual', 'Excellent', 2, 200.00
  UNION ALL SELECT 'Tent (10x10)', 'Other', 'Good', 5, 150.00
  UNION ALL SELECT 'Tent (20x20)', 'Other', 'Good', 3, 300.00
  UNION ALL SELECT 'Generator (Portable)', 'Other', 'Excellent', 4, 100.00
  UNION ALL SELECT 'Coolers (Large)', 'Other', 'Good', 10, 20.00
  UNION ALL SELECT 'Serving Trays', 'Other', 'Excellent', 30, 8.00
  UNION ALL SELECT 'Beverage Dispensers', 'Other', 'Good', 15, 25.00
  UNION ALL SELECT 'Cake Stand', 'Other', 'Excellent', 5, 30.00
  UNION ALL SELECT 'Gift Table', 'Other', 'Good', 8, 20.00
) AS new_items
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items ii 
  WHERE ii.item_name = new_items.item_name 
    AND ii.category = new_items.category
);

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

