-- ============================================================================
-- Naruto-Themed Wedding Packages Insert Script
-- This script adds 10 wedding packages using the Naruto-themed menu items
-- ============================================================================

USE wedding_management_db;

-- ============================================================================
-- 1. INSERT PACKAGES
-- ============================================================================

INSERT INTO package (package_name, package_type, package_price)
VALUES
  -- Premium Packages
  ('Team 7 Ultimate Package', 'Premium', 1500.00),
  ('Hidden Leaf Village Feast', 'Full Service', 2800.00),
  ('Ramen Master Collection', 'Premium', 1200.00),
  ('Sakura Blossom Celebration', 'Full Service', 2200.00),
  
  -- Full Service Packages
  ('Kakashi Sensei Special', 'Full Service', 1800.00),
  ('Uchiha Clan Deluxe', 'Premium', 2000.00),
  ('Hokage Grand Banquet', 'Full Service', 3500.00),
  
  -- Specialty Packages
  ('Sushi & Sashimi Extravaganza', 'Specialty', 1100.00),
  ('Dango Dessert Paradise', 'Specialty', 800.00),
  ('Ninja Warrior Combo', 'Basic', 950.00);

-- ============================================================================
-- 2. LINK MENU ITEMS TO PACKAGES (package_menu_items)
-- ============================================================================

-- Team 7 Ultimate Package (Naruto, Sasuke, Sakura themed)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Team 7 Ultimate Package' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Naruto Roll' THEN 2
    WHEN menu_name = 'Sasuke Special Roll' THEN 2
    WHEN menu_name = 'Sakura Onigiri Set' THEN 2
    WHEN menu_name = 'Ichiraku Ramen Special' THEN 1
    WHEN menu_name = 'Teriyaki Beef Bowl' THEN 1
    WHEN menu_name = 'Hanami Dango Trio' THEN 1
    WHEN menu_name = 'Matcha Dango' THEN 1
  END
FROM menu_item
WHERE menu_name IN ('Naruto Roll', 'Sasuke Special Roll', 'Sakura Onigiri Set', 
                     'Ichiraku Ramen Special', 'Teriyaki Beef Bowl', 
                     'Hanami Dango Trio', 'Matcha Dango');

-- Hidden Leaf Village Feast (Complete feast with all ramen types)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Feast' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name LIKE '%Ramen%' THEN 1
    WHEN menu_name LIKE '%Roll%' THEN 2
    WHEN menu_name = 'Sakura Onigiri Set' THEN 2
    WHEN menu_name = 'Yakiniku Platter' THEN 1
    WHEN menu_name = 'Kakashi Special Curry' THEN 1
    WHEN menu_name LIKE '%Dango%' THEN 2
  END
FROM menu_item
WHERE menu_name LIKE '%Ramen%' 
   OR menu_name LIKE '%Roll%'
   OR menu_name = 'Sakura Onigiri Set'
   OR menu_name = 'Yakiniku Platter'
   OR menu_name = 'Kakashi Special Curry'
   OR menu_name LIKE '%Dango%';

-- Ramen Master Collection (All ramen types)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Ramen Master Collection' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name LIKE '%Ramen%' THEN 1
    WHEN menu_name = 'Naruto Roll' THEN 1
    WHEN menu_name = 'Sakura Onigiri Set' THEN 1
    WHEN menu_name = 'Hanami Dango Trio' THEN 1
  END
FROM menu_item
WHERE menu_name LIKE '%Ramen%' 
   OR menu_name = 'Naruto Roll'
   OR menu_name = 'Sakura Onigiri Set'
   OR menu_name = 'Hanami Dango Trio';

-- Sakura Blossom Celebration (Feminine, elegant package)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Sakura Blossom Celebration' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Sakura Onigiri Set' THEN 3
    WHEN menu_name = 'Miso Ramen Deluxe' THEN 1
    WHEN menu_name = 'Naruto Roll' THEN 2
    WHEN menu_name = 'Kakashi Sensei Roll' THEN 2
    WHEN menu_name = 'Hanami Dango Trio' THEN 2
    WHEN menu_name = 'Matcha Dango' THEN 2
  END
FROM menu_item
WHERE menu_name IN ('Sakura Onigiri Set', 'Miso Ramen Deluxe', 'Naruto Roll', 
                    'Kakashi Sensei Roll', 'Hanami Dango Trio', 'Matcha Dango');

-- Kakashi Sensei Special (Balanced, sophisticated)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Kakashi Sensei Special' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Kakashi Sensei Roll' THEN 2
    WHEN menu_name = 'Kakashi Special Curry' THEN 1
    WHEN menu_name = 'Tonkotsu Ramen' THEN 1
    WHEN menu_name = 'Sasuke Special Roll' THEN 1
    WHEN menu_name = 'Teriyaki Beef Bowl' THEN 1
    WHEN menu_name = 'Matcha Dango' THEN 1
  END
FROM menu_item
WHERE menu_name IN ('Kakashi Sensei Roll', 'Kakashi Special Curry', 'Tonkotsu Ramen',
                    'Sasuke Special Roll', 'Teriyaki Beef Bowl', 'Matcha Dango');

-- Uchiha Clan Deluxe (Premium, exclusive)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Deluxe' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Sasuke Special Roll' THEN 3
    WHEN menu_name = 'Tonkotsu Ramen' THEN 1
    WHEN menu_name = 'Yakiniku Platter' THEN 1
    WHEN menu_name = 'Kakashi Sensei Roll' THEN 2
    WHEN menu_name = 'Miso Ramen Deluxe' THEN 1
    WHEN menu_name = 'Hanami Dango Trio' THEN 2
  END
FROM menu_item
WHERE menu_name IN ('Sasuke Special Roll', 'Tonkotsu Ramen', 'Yakiniku Platter',
                    'Kakashi Sensei Roll', 'Miso Ramen Deluxe', 'Hanami Dango Trio');

-- Hokage Grand Banquet (Most comprehensive, highest tier)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Hokage Grand Banquet' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name LIKE '%Ramen%' THEN 1
    WHEN menu_name LIKE '%Roll%' THEN 2
    WHEN menu_name = 'Sakura Onigiri Set' THEN 2
    WHEN menu_name = 'Teriyaki Beef Bowl' THEN 1
    WHEN menu_name = 'Yakiniku Platter' THEN 1
    WHEN menu_name = 'Kakashi Special Curry' THEN 1
    WHEN menu_name LIKE '%Dango%' THEN 2
  END
FROM menu_item
WHERE menu_name LIKE '%Ramen%' 
   OR menu_name LIKE '%Roll%'
   OR menu_name = 'Sakura Onigiri Set'
   OR menu_name = 'Teriyaki Beef Bowl'
   OR menu_name = 'Yakiniku Platter'
   OR menu_name = 'Kakashi Special Curry'
   OR menu_name LIKE '%Dango%';

-- Sushi & Sashimi Extravaganza (All sushi/roll items)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Sushi & Sashimi Extravaganza' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name LIKE '%Roll%' THEN 2
    WHEN menu_name = 'Sakura Onigiri Set' THEN 2
    WHEN menu_name = 'Miso Ramen Deluxe' THEN 1
    WHEN menu_name = 'Matcha Dango' THEN 1
  END
FROM menu_item
WHERE menu_name LIKE '%Roll%'
   OR menu_name = 'Sakura Onigiri Set'
   OR menu_name = 'Miso Ramen Deluxe'
   OR menu_name = 'Matcha Dango';

-- Dango Dessert Paradise (Dessert-focused package)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Dango Dessert Paradise' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Hanami Dango Trio' THEN 3
    WHEN menu_name = 'Matcha Dango' THEN 3
    WHEN menu_name = 'Sakura Onigiri Set' THEN 2
    WHEN menu_name = 'Shoyu Ramen' THEN 1
    WHEN menu_name = 'Naruto Roll' THEN 1
  END
FROM menu_item
WHERE menu_name IN ('Hanami Dango Trio', 'Matcha Dango', 'Sakura Onigiri Set',
                    'Shoyu Ramen', 'Naruto Roll');

-- Ninja Warrior Combo (Basic, balanced package)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity)
SELECT 
  (SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Combo' LIMIT 1),
  menu_item_id,
  CASE 
    WHEN menu_name = 'Ichiraku Ramen Special' THEN 1
    WHEN menu_name = 'Naruto Roll' THEN 1
    WHEN menu_name = 'Sakura Onigiri Set' THEN 1
    WHEN menu_name = 'Teriyaki Beef Bowl' THEN 1
    WHEN menu_name = 'Hanami Dango Trio' THEN 1
  END
FROM menu_item
WHERE menu_name IN ('Ichiraku Ramen Special', 'Naruto Roll', 'Sakura Onigiri Set',
                    'Teriyaki Beef Bowl', 'Hanami Dango Trio');

-- ============================================================================
-- 3. VERIFICATION QUERIES (Optional - can be removed)
-- ============================================================================

-- View all packages with their menu items and total calculated price
-- SELECT 
--   p.package_id,
--   p.package_name,
--   p.package_type,
--   p.package_price,
--   COUNT(pmi.menu_item_id) as total_items,
--   SUM(m.menu_price * pmi.quantity) as calculated_total
-- FROM package p
-- LEFT JOIN package_menu_items pmi ON p.package_id = pmi.package_id
-- LEFT JOIN menu_item m ON pmi.menu_item_id = m.menu_item_id
-- GROUP BY p.package_id, p.package_name, p.package_type, p.package_price
-- ORDER BY p.package_price DESC;

-- View detailed package contents
-- SELECT 
--   p.package_name,
--   p.package_type,
--   m.menu_name,
--   m.menu_type,
--   pmi.quantity,
--   m.menu_price,
--   (pmi.quantity * m.menu_price) as item_total
-- FROM package p
-- JOIN package_menu_items pmi ON p.package_id = pmi.package_id
-- JOIN menu_item m ON pmi.menu_item_id = m.menu_item_id
-- WHERE p.package_name = 'Team 7 Ultimate Package'
-- ORDER BY m.menu_type, m.menu_name;

