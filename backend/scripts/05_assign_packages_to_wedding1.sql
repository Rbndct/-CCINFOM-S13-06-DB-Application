-- ============================================================================
-- Assign Packages to Wedding 1
-- ============================================================================
-- This script assigns packages to all tables for the first wedding (wedding_id = 1)
-- Makes the wedding complete with appropriate package assignments based on table category
-- VIP tables get premium packages, family tables get full service, friends get standard/basic
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

-- Assign packages to tables with duplicate prevention
INSERT INTO table_package (table_id, package_id)
SELECT * FROM (
  SELECT @table_couple as table_id, @package_sage_mode as package_id
  UNION ALL SELECT @table_vip1, @package_hokage
  UNION ALL SELECT @table_vip2, @package_uchiha_elite
  UNION ALL SELECT @table_family1, @package_hidden_leaf
  UNION ALL SELECT @table_family2, @package_akatsuki
  UNION ALL SELECT @table_friends1, @package_jonin
  UNION ALL SELECT @table_friends2, @package_chunin
  UNION ALL SELECT @table_friends3, @package_vegetarian
  UNION ALL SELECT @table_friends4, @package_genin
) AS new_assignments
WHERE NOT EXISTS (
  SELECT 1 FROM table_package tp 
  WHERE tp.table_id = new_assignments.table_id 
    AND tp.package_id = new_assignments.package_id
);

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

-- ============================================================================
-- UPDATE WEDDING COSTS AFTER PACKAGE ASSIGNMENTS
-- ============================================================================
-- Calculate food_cost from table packages and update total_cost

-- Update food_cost and total_cost for wedding 1
UPDATE wedding w
SET 
  food_cost = COALESCE((
    SELECT SUM(
      COALESCE(
        (SELECT SUM(mi.unit_cost * COALESCE(pmi.quantity, 1))
         FROM package_menu_items pmi
         JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
         WHERE pmi.package_id = tp.package_id), 0
      )
    )
    FROM table_package tp
    JOIN seating_table st ON tp.table_id = st.table_id
    WHERE st.wedding_id = w.wedding_id
  ), 0),
  total_cost = COALESCE(equipment_rental_cost, 0) + COALESCE((
    SELECT SUM(
      COALESCE(
        (SELECT SUM(mi.unit_cost * COALESCE(pmi.quantity, 1))
         FROM package_menu_items pmi
         JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
         WHERE pmi.package_id = tp.package_id), 0
      )
    )
    FROM table_package tp
    JOIN seating_table st ON tp.table_id = st.table_id
    WHERE st.wedding_id = w.wedding_id
  ), 0)
WHERE w.wedding_id = @wedding1_id;

-- Also update ALL other weddings that have packages assigned to ensure consistency
UPDATE wedding w
SET 
  food_cost = COALESCE((
    SELECT SUM(
      COALESCE(
        (SELECT SUM(mi.unit_cost * COALESCE(pmi.quantity, 1))
         FROM package_menu_items pmi
         JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
         WHERE pmi.package_id = tp.package_id), 0
      )
    )
    FROM table_package tp
    JOIN seating_table st ON tp.table_id = st.table_id
    WHERE st.wedding_id = w.wedding_id
  ), 0),
  total_cost = COALESCE(equipment_rental_cost, 0) + COALESCE((
    SELECT SUM(
      COALESCE(
        (SELECT SUM(mi.unit_cost * COALESCE(pmi.quantity, 1))
         FROM package_menu_items pmi
         JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
         WHERE pmi.package_id = tp.package_id), 0
      )
    )
    FROM table_package tp
    JOIN seating_table st ON tp.table_id = st.table_id
    WHERE st.wedding_id = w.wedding_id
  ), 0)
WHERE EXISTS (
  SELECT 1 FROM table_package tp
  JOIN seating_table st ON tp.table_id = st.table_id
  WHERE st.wedding_id = w.wedding_id
);

