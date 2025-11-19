-- ============================================================================
-- Assign Packages to Naruto & Hinata's Wedding (Wedding ID = 1)
-- ============================================================================
-- This script assigns packages to all tables for wedding_id = 1
-- Making it complete with appropriate package assignments based on table category
-- ============================================================================

USE wedding_management_db;

-- Set wedding ID - Try to use wedding_id = 1, otherwise find Naruto & Hinata's wedding
SET @wedding1_id = COALESCE(
  (SELECT wedding_id FROM wedding WHERE wedding_id = 1 LIMIT 1),
  (SELECT w.wedding_id FROM wedding w 
   INNER JOIN couple c ON w.couple_id = c.couple_id 
   WHERE c.partner1_name = 'Naruto' AND c.partner2_name = 'Hinata' 
   ORDER BY w.wedding_id ASC LIMIT 1)
);

-- Get table IDs for wedding 1
SET @table_couple = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-001' LIMIT 1);
SET @table_vip1 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-002' LIMIT 1);
SET @table_vip2 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-003' LIMIT 1);
SET @table_family1 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-004' LIMIT 1);
SET @table_family2 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-005' LIMIT 1);
SET @table_friends1 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-006' LIMIT 1);
SET @table_friends2 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-007' LIMIT 1);
SET @table_friends3 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-008' LIMIT 1);
SET @table_friends4 = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-009' LIMIT 1);

-- Get package IDs
SET @package_hokage = (SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration' LIMIT 1);
SET @package_sage_mode = (SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe' LIMIT 1);
SET @package_uchiha_elite = (SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite' LIMIT 1);
SET @package_hidden_leaf = (SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium' LIMIT 1);
SET @package_akatsuki = (SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience' LIMIT 1);
SET @package_jonin = (SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package' LIMIT 1);
SET @package_chunin = (SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package' LIMIT 1);
SET @package_genin = (SELECT package_id FROM package WHERE package_name = 'Genin Starter Package' LIMIT 1);
SET @package_vegetarian = (SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package' LIMIT 1);
SET @package_vegan = (SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package' LIMIT 1);
SET @package_halal = (SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast' LIMIT 1);
SET @package_gluten_free = (SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet' LIMIT 1);

-- ============================================================================
-- Assign Packages to Tables
-- ============================================================================
-- Couple Table (T-001): Premium package for the couple
-- VIP Tables (T-002, T-003): Premium/Elite packages
-- Family Tables (T-004, T-005): Full Service packages
-- Friends Tables (T-006 to T-009): Standard/Basic packages with some specialty
-- ============================================================================

-- Couple Table - Most premium package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_couple, @package_sage_mode);

-- VIP Table 1 (T-002) - Premium package for VIP guests
INSERT INTO table_package (table_id, package_id) VALUES
(@table_vip1, @package_hokage);

-- VIP Table 2 (T-003) - Elite package for VIP guests
INSERT INTO table_package (table_id, package_id) VALUES
(@table_vip2, @package_uchiha_elite);

-- Family Table 1 (T-004) - Full Service package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_family1, @package_hidden_leaf);

-- Family Table 2 (T-005) - Full Service package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_family2, @package_akatsuki);

-- Friends Table 1 (T-006) - Professional package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_friends1, @package_jonin);

-- Friends Table 2 (T-007) - Standard package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_friends2, @package_chunin);

-- Friends Table 3 (T-008) - Vegetarian package (considering guest restrictions)
INSERT INTO table_package (table_id, package_id) VALUES
(@table_friends3, @package_vegetarian);

-- Friends Table 4 (T-009) - Starter package
INSERT INTO table_package (table_id, package_id) VALUES
(@table_friends4, @package_genin);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Uncomment to verify the package assignments:
-- SELECT 
--   st.table_number,
--   st.table_category,
--   p.package_name,
--   p.package_type,
--   p.selling_price
-- FROM seating_table st
-- INNER JOIN table_package tp ON st.table_id = tp.table_id
-- INNER JOIN package p ON tp.package_id = p.package_id
-- WHERE st.wedding_id = @wedding1_id
-- ORDER BY st.table_number;

