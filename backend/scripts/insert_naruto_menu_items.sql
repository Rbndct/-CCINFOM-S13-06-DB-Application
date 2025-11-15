-- ============================================================================
-- Naruto-Themed Menu Items Insert Script
-- This script adds Naruto-inspired menu items with ingredients and recipes
-- ============================================================================

USE wedding_management_db;

-- ============================================================================
-- 1. INSERT INGREDIENTS (if they don't exist)
-- ============================================================================

-- Insert ingredients needed for Naruto menu items
INSERT INTO ingredient (ingredient_id, ingredient_name, unit, stock_quantity, re_order_level)
VALUES
  (1001, 'Ramen Noodles', 'kg', 50.00, '10'),
  (1002, 'Pork Belly', 'kg', 30.00, '5'),
  (1003, 'Chicken Broth', 'L', 100.00, '20'),
  (1004, 'Soy Sauce', 'L', 50.00, '10'),
  (1005, 'Miso Paste', 'kg', 20.00, '5'),
  (1006, 'Green Onions', 'bunch', 100.00, '20'),
  (1007, 'Soft Boiled Egg', 'piece', 200.00, '50'),
  (1008, 'Seaweed (Nori)', 'sheet', 500.00, '100'),
  (1009, 'Rice', 'kg', 100.00, '20'),
  (1010, 'Sushi Rice', 'kg', 50.00, '10'),
  (1011, 'Salmon', 'kg', 40.00, '10'),
  (1012, 'Tuna', 'kg', 35.00, '8'),
  (1013, 'Avocado', 'piece', 150.00, '30'),
  (1014, 'Cucumber', 'piece', 200.00, '40'),
  (1015, 'Rice Vinegar', 'L', 30.00, '10'),
  (1016, 'Sugar', 'kg', 50.00, '10'),
  (1017, 'Dango Flour', 'kg', 25.00, '5'),
  (1018, 'Red Bean Paste', 'kg', 20.00, '5'),
  (1019, 'Matcha Powder', 'kg', 15.00, '3'),
  (1020, 'Sesame Seeds', 'kg', 10.00, '2'),
  (1021, 'Beef', 'kg', 45.00, '10'),
  (1022, 'Teriyaki Sauce', 'L', 40.00, '10'),
  (1023, 'Ginger', 'kg', 10.00, '2'),
  (1024, 'Garlic', 'kg', 15.00, '3'),
  (1025, 'Mushrooms', 'kg', 30.00, '6'),
  (1026, 'Bamboo Shoots', 'kg', 20.00, '5'),
  (1027, 'Corn', 'kg', 25.00, '5'),
  (1028, 'Butter', 'kg', 20.00, '5'),
  (1029, 'Flour', 'kg', 60.00, '15'),
  (1030, 'Eggs', 'dozen', 50.00, '10'),
  (1031, 'Milk', 'L', 80.00, '20'),
  (1032, 'Vanilla Extract', 'L', 10.00, '2'),
  (1033, 'Strawberries', 'kg', 30.00, '6'),
  (1034, 'Whipped Cream', 'L', 40.00, '10'),
  (1035, 'Chocolate', 'kg', 25.00, '5')
ON DUPLICATE KEY UPDATE
  ingredient_name = VALUES(ingredient_name),
  unit = VALUES(unit),
  stock_quantity = VALUES(stock_quantity),
  re_order_level = VALUES(re_order_level);

-- ============================================================================
-- 2. INSERT MENU ITEMS (Naruto-themed dishes)
-- ============================================================================

INSERT INTO menu_item (menu_name, menu_cost, menu_price, menu_type, stock, restriction_id)
VALUES
  -- Ramen dishes (Main Course)
  ('Ichiraku Ramen Special', 150.00, 350.00, 'Main Course', 50, NULL),
  ('Miso Ramen Deluxe', 180.00, 420.00, 'Main Course', 45, NULL),
  ('Tonkotsu Ramen', 200.00, 480.00, 'Main Course', 40, NULL),
  ('Shoyu Ramen', 160.00, 380.00, 'Main Course', 50, NULL),
  
  -- Sushi/Onigiri (Appetizer)
  ('Naruto Roll', 120.00, 280.00, 'Appetizer', 60, NULL),
  ('Sasuke Special Roll', 140.00, 320.00, 'Appetizer', 55, NULL),
  ('Sakura Onigiri Set', 80.00, 200.00, 'Appetizer', 70, NULL),
  ('Kakashi Sensei Roll', 130.00, 300.00, 'Appetizer', 50, NULL),
  
  -- Dango (Dessert)
  ('Hanami Dango Trio', 60.00, 150.00, 'Dessert', 80, NULL),
  ('Matcha Dango', 50.00, 130.00, 'Dessert', 75, NULL),
  
  -- Other dishes
  ('Teriyaki Beef Bowl', 180.00, 400.00, 'Main Course', 45, NULL),
  ('Yakiniku Platter', 220.00, 520.00, 'Main Course', 35, NULL),
  ('Kakashi Special Curry', 160.00, 360.00, 'Main Course', 50, NULL);

-- ============================================================================
-- 3. INSERT RECIPES (Link menu items to ingredients)
-- ============================================================================

-- Get menu_item_id values (assuming they're auto-incremented from existing data)
-- We'll use subqueries to get the IDs

-- Ichiraku Ramen Special
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1001 THEN 0.2  -- Ramen Noodles (kg)
    WHEN 1003 THEN 0.5  -- Chicken Broth (L)
    WHEN 1004 THEN 0.05 -- Soy Sauce (L)
    WHEN 1006 THEN 0.1  -- Green Onions (bunch)
    WHEN 1007 THEN 1    -- Soft Boiled Egg (piece)
    WHEN 1008 THEN 1    -- Seaweed (sheet)
    WHEN 1002 THEN 0.15 -- Pork Belly (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1001, 1003, 1004, 1006, 1007, 1008, 1002);

-- Miso Ramen Deluxe
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Ramen Deluxe' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1001 THEN 0.2  -- Ramen Noodles (kg)
    WHEN 1003 THEN 0.5  -- Chicken Broth (L)
    WHEN 1005 THEN 0.1  -- Miso Paste (kg)
    WHEN 1006 THEN 0.1  -- Green Onions (bunch)
    WHEN 1007 THEN 1    -- Soft Boiled Egg (piece)
    WHEN 1002 THEN 0.15 -- Pork Belly (kg)
    WHEN 1025 THEN 0.1  -- Mushrooms (kg)
    WHEN 1026 THEN 0.05 -- Bamboo Shoots (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1001, 1003, 1005, 1006, 1007, 1002, 1025, 1026);

-- Tonkotsu Ramen
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tonkotsu Ramen' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1001 THEN 0.2  -- Ramen Noodles (kg)
    WHEN 1003 THEN 0.6  -- Chicken Broth (L)
    WHEN 1002 THEN 0.2  -- Pork Belly (kg)
    WHEN 1006 THEN 0.1  -- Green Onions (bunch)
    WHEN 1007 THEN 1    -- Soft Boiled Egg (piece)
    WHEN 1008 THEN 1    -- Seaweed (sheet)
    WHEN 1023 THEN 0.02 -- Ginger (kg)
    WHEN 1024 THEN 0.02 -- Garlic (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1001, 1003, 1002, 1006, 1007, 1008, 1023, 1024);

-- Shoyu Ramen
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Shoyu Ramen' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1001 THEN 0.2  -- Ramen Noodles (kg)
    WHEN 1003 THEN 0.5  -- Chicken Broth (L)
    WHEN 1004 THEN 0.08 -- Soy Sauce (L)
    WHEN 1006 THEN 0.1  -- Green Onions (bunch)
    WHEN 1007 THEN 1    -- Soft Boiled Egg (piece)
    WHEN 1002 THEN 0.15 -- Pork Belly (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1001, 1003, 1004, 1006, 1007, 1002);

-- Naruto Roll
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Roll' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1010 THEN 0.15 -- Sushi Rice (kg)
    WHEN 1011 THEN 0.1  -- Salmon (kg)
    WHEN 1013 THEN 0.5  -- Avocado (piece)
    WHEN 1014 THEN 0.5  -- Cucumber (piece)
    WHEN 1008 THEN 1    -- Seaweed (sheet)
    WHEN 1015 THEN 0.02 -- Rice Vinegar (L)
    WHEN 1016 THEN 0.01 -- Sugar (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1010, 1011, 1013, 1014, 1008, 1015, 1016);

-- Sasuke Special Roll
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Special Roll' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1010 THEN 0.15 -- Sushi Rice (kg)
    WHEN 1012 THEN 0.12 -- Tuna (kg)
    WHEN 1013 THEN 0.5  -- Avocado (piece)
    WHEN 1014 THEN 0.5  -- Cucumber (piece)
    WHEN 1008 THEN 1    -- Seaweed (sheet)
    WHEN 1015 THEN 0.02 -- Rice Vinegar (L)
    WHEN 1016 THEN 0.01 -- Sugar (kg)
    WHEN 1020 THEN 0.01 -- Sesame Seeds (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1010, 1012, 1013, 1014, 1008, 1015, 1016, 1020);

-- Sakura Onigiri Set
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Onigiri Set' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1009 THEN 0.2  -- Rice (kg)
    WHEN 1008 THEN 2    -- Seaweed (sheet)
    WHEN 1011 THEN 0.05 -- Salmon (kg)
    WHEN 1015 THEN 0.02 -- Rice Vinegar (L)
    WHEN 1016 THEN 0.01 -- Sugar (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1009, 1008, 1011, 1015, 1016);

-- Kakashi Sensei Roll
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Sensei Roll' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1010 THEN 0.15 -- Sushi Rice (kg)
    WHEN 1011 THEN 0.08 -- Salmon (kg)
    WHEN 1012 THEN 0.08 -- Tuna (kg)
    WHEN 1013 THEN 0.5  -- Avocado (piece)
    WHEN 1008 THEN 1    -- Seaweed (sheet)
    WHEN 1015 THEN 0.02 -- Rice Vinegar (L)
    WHEN 1016 THEN 0.01 -- Sugar (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1010, 1011, 1012, 1013, 1008, 1015, 1016);

-- Hanami Dango Trio
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Hanami Dango Trio' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1017 THEN 0.1  -- Dango Flour (kg)
    WHEN 1016 THEN 0.05 -- Sugar (kg)
    WHEN 1018 THEN 0.05 -- Red Bean Paste (kg)
    WHEN 1019 THEN 0.02 -- Matcha Powder (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1017, 1016, 1018, 1019);

-- Matcha Dango
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Dango' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1017 THEN 0.1  -- Dango Flour (kg)
    WHEN 1016 THEN 0.05 -- Sugar (kg)
    WHEN 1019 THEN 0.03 -- Matcha Powder (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1017, 1016, 1019);

-- Teriyaki Beef Bowl
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Teriyaki Beef Bowl' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1009 THEN 0.3  -- Rice (kg)
    WHEN 1021 THEN 0.2  -- Beef (kg)
    WHEN 1022 THEN 0.1  -- Teriyaki Sauce (L)
    WHEN 1006 THEN 0.1  -- Green Onions (bunch)
    WHEN 1023 THEN 0.02 -- Ginger (kg)
    WHEN 1027 THEN 0.1  -- Corn (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1009, 1021, 1022, 1006, 1023, 1027);

-- Yakiniku Platter
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Yakiniku Platter' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1021 THEN 0.3  -- Beef (kg)
    WHEN 1006 THEN 0.15 -- Green Onions (bunch)
    WHEN 1025 THEN 0.15 -- Mushrooms (kg)
    WHEN 1022 THEN 0.15 -- Teriyaki Sauce (L)
    WHEN 1023 THEN 0.03 -- Ginger (kg)
    WHEN 1024 THEN 0.03 -- Garlic (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1021, 1006, 1025, 1022, 1023, 1024);

-- Kakashi Special Curry
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed)
SELECT 
  (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Special Curry' LIMIT 1),
  ingredient_id,
  CASE ingredient_id
    WHEN 1009 THEN 0.3  -- Rice (kg)
    WHEN 1021 THEN 0.2  -- Beef (kg)
    WHEN 1025 THEN 0.1  -- Mushrooms (kg)
    WHEN 1026 THEN 0.08 -- Bamboo Shoots (kg)
    WHEN 1027 THEN 0.1  -- Corn (kg)
    WHEN 1023 THEN 0.02 -- Ginger (kg)
    WHEN 1024 THEN 0.02 -- Garlic (kg)
  END
FROM ingredient
WHERE ingredient_id IN (1009, 1021, 1025, 1026, 1027, 1023, 1024);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check inserted menu items
SELECT 
  menu_item_id,
  menu_name,
  menu_type,
  menu_cost,
  menu_price,
  (menu_price - menu_cost) as profit_margin,
  stock
FROM menu_item
WHERE menu_name LIKE '%Ramen%' 
   OR menu_name LIKE '%Naruto%'
   OR menu_name LIKE '%Sasuke%'
   OR menu_name LIKE '%Sakura%'
   OR menu_name LIKE '%Kakashi%'
   OR menu_name LIKE '%Dango%'
   OR menu_name LIKE '%Teriyaki%'
   OR menu_name LIKE '%Yakiniku%'
   OR menu_name LIKE '%Curry%'
ORDER BY menu_type, menu_name;

-- Check recipes for a specific menu item (example: Ichiraku Ramen Special)
SELECT 
  m.menu_name,
  i.ingredient_name,
  r.quantity_needed,
  i.unit
FROM recipe r
JOIN menu_item m ON r.menu_item_id = m.menu_item_id
JOIN ingredient i ON r.ingredient_id = i.ingredient_id
WHERE m.menu_name = 'Ichiraku Ramen Special'
ORDER BY i.ingredient_name;

-- Count total menu items inserted
SELECT COUNT(*) as total_naruto_menu_items
FROM menu_item
WHERE menu_name LIKE '%Ramen%' 
   OR menu_name LIKE '%Naruto%'
   OR menu_name LIKE '%Sasuke%'
   OR menu_name LIKE '%Sakura%'
   OR menu_name LIKE '%Kakashi%'
   OR menu_name LIKE '%Dango%'
   OR menu_name LIKE '%Teriyaki%'
   OR menu_name LIKE '%Yakiniku%'
   OR menu_name LIKE '%Curry%';

SELECT 'Naruto menu items, ingredients, and recipes inserted successfully!' AS message;

