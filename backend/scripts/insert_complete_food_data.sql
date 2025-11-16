-- ============================================================================
-- Complete Food Data Insert Script
-- This script clears existing food-related data and inserts comprehensive
-- Naruto-themed menu items, packages, ingredients, and recipes
-- ============================================================================

USE wedding_management_db;

-- ============================================================================
-- STEP 1: CLEAR EXISTING FOOD-RELATED DATA (in reverse dependency order)
-- ============================================================================
-- WARNING: The following DELETE statements intentionally clear ALL data from
-- these tables. This is a data reset script meant to provide a clean slate
-- before inserting fresh data. These statements are SAFE for this use case.
-- ============================================================================

-- Delete package-menu item relationships
DELETE FROM package_menu_items;

-- Delete table-package assignments (if any)
DELETE FROM table_package;

-- Delete packages
DELETE FROM package;

-- Delete recipes
DELETE FROM recipe;

-- Delete menu items (this will set restriction_id to NULL due to ON DELETE SET NULL)
DELETE FROM menu_item;

-- Delete ingredients
DELETE FROM ingredient;

-- Clear guest_restrictions junction table (if it references dietary restrictions)
DELETE FROM guest_restrictions;

-- Clear couple_preference_restrictions junction table (if it references dietary restrictions)
DELETE FROM couple_preference_restrictions;

-- Update guest table to set restriction_id to NULL (to allow deletion of dietary_restrictions)
UPDATE guest SET restriction_id = NULL WHERE restriction_id IS NOT NULL;

-- Update couple_preferences table to set restriction_id to NULL (to allow deletion of dietary_restrictions)
UPDATE couple_preferences SET restriction_id = NULL WHERE restriction_id IS NOT NULL;

-- Delete all dietary restrictions (will be re-inserted fresh)
DELETE FROM dietary_restriction;

-- ============================================================================
-- STEP 2: INSERT DIETARY RESTRICTIONS
-- ============================================================================

INSERT INTO dietary_restriction (restriction_name, severity_level, restriction_type) VALUES
-- System Restriction (must be first to get ID 1)
('None', 'Low', 'System'),

-- Dietary Preferences (Low to Moderate Severity)
('Vegetarian', 'Low', 'Dietary'),
('Vegan', 'Low', 'Dietary'),
('Pescatarian', 'Low', 'Dietary'),
('No Pork', 'Low', 'Dietary'),
('No Beef', 'Low', 'Dietary'),
('Raw Food Only', 'Low', 'Dietary'),

-- Intolerances (Moderate to High Severity)
('Lactose Intolerant', 'Moderate', 'Intolerance'),
('Gluten Intolerant', 'Moderate', 'Intolerance'),
('Fructose Intolerant', 'Moderate', 'Intolerance'),

-- Religious Restrictions (Low to Moderate Severity)
('Halal', 'Low', 'Religious'),
('Kosher', 'Low', 'Religious'),
('No Alcohol', 'Moderate', 'Religious'),

-- Allergies (High to Critical Severity)
('Peanut Allergy', 'Critical', 'Allergy'),
('Tree Nut Allergy', 'Critical', 'Allergy'),
('Shellfish Allergy', 'Critical', 'Allergy'),
('Seafood Allergy', 'High', 'Allergy'),
('Dairy Allergy', 'High', 'Allergy'),
('Egg Allergy', 'High', 'Allergy'),
('Soy Allergy', 'High', 'Allergy'),
('Wheat Allergy', 'High', 'Allergy'),

-- Medical Restrictions (Moderate to High Severity)
('Diabetic-Friendly', 'Moderate', 'Medical'),
('Low-Sodium', 'Moderate', 'Medical'),
('Low-Sugar', 'Moderate', 'Medical'),
('Low-Fat', 'Low', 'Medical'),
('Heart-Healthy', 'Moderate', 'Medical');

-- ============================================================================
-- STEP 3: GET RESTRICTION IDs
-- ============================================================================

SET @vegetarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Vegetarian' LIMIT 1);
SET @vegan_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Vegan' LIMIT 1);
SET @pescatarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Pescatarian' LIMIT 1);
SET @no_pork_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Pork' LIMIT 1);
SET @gluten_intolerant_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Gluten Intolerant' LIMIT 1);
SET @lactose_intolerant_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Lactose Intolerant' LIMIT 1);
SET @halal_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Halal' LIMIT 1);
SET @kosher_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Kosher' LIMIT 1);
SET @no_alcohol_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Alcohol' LIMIT 1);
SET @seafood_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Seafood Allergy' LIMIT 1);
SET @shellfish_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Shellfish Allergy' LIMIT 1);
SET @dairy_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Dairy Allergy' LIMIT 1);
SET @diabetic_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Diabetic-Friendly' LIMIT 1);
SET @low_sugar_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Sugar' LIMIT 1);

-- ============================================================================
-- STEP 4: INSERT INGREDIENTS (at least 10)
-- ============================================================================

INSERT INTO ingredient (ingredient_id, ingredient_name, unit, stock_quantity, re_order_level) VALUES
(1, 'Ramen Noodles', 'kg', 50.00, '10'),
(2, 'Pork Chashu', 'kg', 30.00, '5'),
(3, 'Soft Boiled Egg', 'pieces', 200.00, '50'),
(4, 'Nori (Seaweed)', 'sheets', 500.00, '100'),
(5, 'Green Onions', 'bunches', 100.00, '20'),
(6, 'Miso Paste', 'kg', 25.00, '5'),
(7, 'Dashi Stock', 'liters', 100.00, '20'),
(8, 'Soybeans (Edamame)', 'kg', 40.00, '10'),
(9, 'Octopus', 'kg', 15.00, '3'),
(10, 'Wheat Flour', 'kg', 100.00, '20'),
(11, 'Ground Pork', 'kg', 35.00, '7'),
(12, 'Cabbage', 'kg', 50.00, '10'),
(13, 'Udon Noodles', 'kg', 45.00, '10'),
(14, 'Chicken Breast', 'kg', 40.00, '8'),
(15, 'Teriyaki Sauce', 'liters', 30.00, '5'),
(16, 'Sushi Rice', 'kg', 60.00, '12'),
(17, 'Fresh Salmon', 'kg', 20.00, '4'),
(18, 'Fresh Tuna', 'kg', 18.00, '4'),
(19, 'Sea Bass', 'kg', 15.00, '3'),
(20, 'Glutinous Rice Flour', 'kg', 30.00, '6'),
(21, 'Red Bean Paste', 'kg', 25.00, '5'),
(22, 'Matcha Powder', 'kg', 10.00, '2'),
(23, 'Vanilla Ice Cream', 'liters', 50.00, '10'),
(24, 'Cake Flour', 'kg', 40.00, '8'),
(25, 'Sugar', 'kg', 80.00, '15'),
(26, 'Butter', 'kg', 30.00, '6'),
(27, 'Eggs', 'pieces', 500.00, '100'),
(28, 'Shrimp', 'kg', 12.00, '3'),
(29, 'Beef Tenderloin', 'kg', 25.00, '5'),
(30, 'Tofu', 'kg', 35.00, '7'),
(31, 'Mushrooms', 'kg', 20.00, '5'),
(32, 'Sesame Oil', 'liters', 15.00, '3'),
(33, 'Rice Vinegar', 'liters', 20.00, '5'),
(34, 'Wasabi', 'kg', 5.00, '1'),
(35, 'Ginger', 'kg', 15.00, '3'),
(36, 'Green Tea Leaves', 'kg', 20.00, '5'),
(37, 'Matcha Powder (Premium)', 'kg', 8.00, '2'),
(38, 'Coffee Beans', 'kg', 25.00, '5'),
(39, 'Sake', 'liters', 30.00, '10'),
(40, 'Plum Wine', 'liters', 25.00, '8'),
(41, 'Orange Juice', 'liters', 40.00, '10'),
(42, 'Mango', 'kg', 18.00, '5'),
(43, 'Sparkling Water', 'liters', 50.00, '15'),
(44, 'Yuzu', 'kg', 12.00, '3'),
(45, 'Red Bean (Anko)', 'kg', 22.00, '5'),
(46, 'Warabi Starch', 'kg', 10.00, '2'),
(47, 'Agar', 'kg', 8.00, '2'),
(48, 'Sweet Potato', 'kg', 15.00, '4');

-- ============================================================================
-- STEP 5: INSERT MENU ITEMS (at least 10 with balanced dietary restrictions)
-- ============================================================================

INSERT INTO menu_item (menu_name, menu_cost, menu_price, menu_type, stock, restriction_id) VALUES
-- Appetizers
('Ramen Appetizer Bowl', 150.00, 280.00, 'Appetizer', 0, NULL),
('Miso Soup Shot', 45.00, 95.00, 'Appetizer', 0, @vegetarian_id),
('Edamame (Steamed Soybeans)', 60.00, 120.00, 'Appetizer', 0, @vegan_id),
('Takoyaki (Octopus Balls)', 180.00, 320.00, 'Appetizer', 0, @pescatarian_id),
('Gyoza (Dumplings)', 120.00, 240.00, 'Appetizer', 0, NULL),
('Tempura Shrimp', 200.00, 380.00, 'Appetizer', 0, @pescatarian_id),
('Vegetable Spring Rolls', 90.00, 170.00, 'Appetizer', 0, @vegan_id),
('Chicken Yakitori', 140.00, 260.00, 'Appetizer', 0, @no_pork_id),
('Tofu Skewers', 100.00, 190.00, 'Appetizer', 0, @vegan_id),
('Seaweed Salad', 70.00, 140.00, 'Appetizer', 0, @vegan_id),

-- Main Courses
('Ichiraku Ramen Special', 350.00, 650.00, 'Main Course', 0, NULL),
('Naruto Udon Bowl', 280.00, 520.00, 'Main Course', 0, @vegetarian_id),
('Sasuke Teriyaki Chicken', 420.00, 780.00, 'Main Course', 0, @no_pork_id),
('Sakura Sushi Platter', 550.00, 980.00, 'Main Course', 0, @pescatarian_id),
('Kakashi Grilled Fish', 380.00, 720.00, 'Main Course', 0, @pescatarian_id),
('Beef Sukiyaki', 450.00, 850.00, 'Main Course', 0, @no_pork_id),
('Vegetarian Curry Bowl', 320.00, 600.00, 'Main Course', 0, @vegan_id),
('Tofu Teriyaki Bowl', 280.00, 520.00, 'Main Course', 0, @vegan_id),
('Chicken Katsu Curry', 400.00, 750.00, 'Main Course', 0, @no_pork_id),
('Salmon Teriyaki', 390.00, 730.00, 'Main Course', 0, @pescatarian_id),

-- Beverages
('Green Tea', 25.00, 50.00, 'Beverage', 0, @vegan_id),
('Matcha Latte', 45.00, 90.00, 'Beverage', 0, @vegetarian_id),
('Japanese Iced Coffee', 40.00, 80.00, 'Beverage', 0, @vegan_id),
('Sake (Premium)', 120.00, 240.00, 'Beverage', 0, NULL),
('Plum Wine', 100.00, 200.00, 'Beverage', 0, NULL),
('Fresh Orange Juice', 35.00, 70.00, 'Beverage', 0, @vegan_id),
('Mango Smoothie', 50.00, 100.00, 'Beverage', 0, @vegetarian_id),
('Sparkling Water', 20.00, 40.00, 'Beverage', 0, @vegan_id),
('Yuzu Lemonade', 40.00, 80.00, 'Beverage', 0, @vegan_id),
('Hot Sake', 110.00, 220.00, 'Beverage', 0, NULL),

-- Desserts
('Dango Trio (Sweet Rice Balls)', 90.00, 180.00, 'Dessert', 0, @vegan_id),
('Mochi Ice Cream', 110.00, 220.00, 'Dessert', 0, @vegetarian_id),
('Matcha Green Tea Cake', 140.00, 280.00, 'Dessert', 0, @vegetarian_id),
('Red Bean Mochi', 95.00, 190.00, 'Dessert', 0, @vegan_id),
('Sesame Balls', 85.00, 170.00, 'Dessert', 0, @vegan_id),
('Taiyaki (Fish-shaped Cake)', 80.00, 160.00, 'Dessert', 0, @vegetarian_id),
('Warabimochi', 75.00, 150.00, 'Dessert', 0, @vegan_id),
('Green Tea Ice Cream', 100.00, 200.00, 'Dessert', 0, @vegetarian_id),
('Anmitsu', 120.00, 240.00, 'Dessert', 0, @vegan_id),
('Dorayaki', 85.00, 170.00, 'Dessert', 0, @vegetarian_id);

-- ============================================================================
-- STEP 6: INSERT RECIPES (for all menu items)
-- ============================================================================

-- Ramen Appetizer Bowl
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 1, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 3, 0.5),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 4, 1.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 5, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 7, 0.3);

-- Miso Soup Shot
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 6, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 7, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 5, 0.05);

-- Edamame
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 8, 0.12);

-- Takoyaki
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 9, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 10, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 12, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 5, 0.05);

-- Gyoza
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 11, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 12, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 10, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 5, 0.03);

-- Tempura Shrimp
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 28, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 10, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 32, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 27, 0.5);

-- Vegetable Spring Rolls
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 12, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 31, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 5, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 10, 0.04);

-- Chicken Yakitori
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 14, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 15, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 35, 0.02);

-- Ichiraku Ramen Special
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1, 0.25),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 2, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 3, 1.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 4, 2.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 5, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 7, 0.5);

-- Naruto Udon Bowl
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 13, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 7, 0.4),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 5, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 4, 1.0);

-- Sasuke Teriyaki Chicken
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 14, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 15, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 5, 0.1);

-- Sakura Sushi Platter
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 16, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 17, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 18, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 4, 2.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 34, 0.01),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 33, 0.05);

-- Kakashi Grilled Fish
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 19, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 5, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 35, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 32, 0.01);

-- Beef Sukiyaki
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 29, 0.25),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 31, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 12, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 5, 0.1);

-- Vegetarian Curry Bowl
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 30, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 31, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 12, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 16, 0.15);

-- Tofu Teriyaki Bowl
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 30, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 15, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 16, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 5, 0.1);

-- Dango Trio
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 20, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 21, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 25, 0.03);

-- Mochi Ice Cream
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 20, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 23, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 25, 0.02);

-- Matcha Green Tea Cake
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 24, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 22, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 25, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 26, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 27, 2.0);

-- Red Bean Mochi
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 20, 0.07),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 21, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 25, 0.02);

-- Sesame Balls
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 20, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 21, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 25, 0.03),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 32, 0.01);

-- Tofu Skewers
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 30, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 15, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 5, 0.05);

-- Seaweed Salad
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Seaweed Salad'), 4, 2.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Seaweed Salad'), 33, 0.03),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Seaweed Salad'), 32, 0.01);

-- Chicken Katsu Curry
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Katsu Curry'), 14, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Katsu Curry'), 10, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Katsu Curry'), 16, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Katsu Curry'), 5, 0.1);

-- Salmon Teriyaki
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Salmon Teriyaki'), 17, 0.2),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Salmon Teriyaki'), 15, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Salmon Teriyaki'), 5, 0.1);

-- Beverages
-- Green Tea
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Green Tea'), 36, 0.01);

-- Matcha Latte
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Latte'), 37, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Latte'), 25, 0.01);

-- Japanese Iced Coffee
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Japanese Iced Coffee'), 38, 0.03);

-- Sake (Premium)
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sake (Premium)'), 39, 0.15);

-- Plum Wine
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Plum Wine'), 40, 0.12);

-- Fresh Orange Juice
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Fresh Orange Juice'), 41, 0.2);

-- Mango Smoothie
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mango Smoothie'), 42, 0.15),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mango Smoothie'), 25, 0.02);

-- Sparkling Water
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sparkling Water'), 43, 0.25);

-- Yuzu Lemonade
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Yuzu Lemonade'), 44, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Yuzu Lemonade'), 25, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Yuzu Lemonade'), 43, 0.2);

-- Hot Sake
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Hot Sake'), 39, 0.15);

-- Additional Desserts
-- Taiyaki (Fish-shaped Cake)
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Taiyaki (Fish-shaped Cake)'), 10, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Taiyaki (Fish-shaped Cake)'), 21, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Taiyaki (Fish-shaped Cake)'), 25, 0.03);

-- Warabimochi
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Warabimochi'), 46, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Warabimochi'), 25, 0.02);

-- Green Tea Ice Cream
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Green Tea Ice Cream'), 22, 0.02),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Green Tea Ice Cream'), 23, 0.1),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Green Tea Ice Cream'), 25, 0.03);

-- Anmitsu
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Anmitsu'), 47, 0.03),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Anmitsu'), 21, 0.05),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Anmitsu'), 25, 0.02);

-- Dorayaki
INSERT INTO recipe (menu_item_id, ingredient_id, quantity_needed) VALUES
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dorayaki'), 10, 0.08),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dorayaki'), 21, 0.06),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dorayaki'), 27, 1.0),
((SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dorayaki'), 25, 0.03);

-- ============================================================================
-- STEP 7: INSERT PACKAGES (at least 10)
-- ============================================================================

INSERT INTO package (package_name, package_type, package_price) VALUES
-- Full Service Packages
('Hidden Leaf Village Premium', 'Full Service', 15000.00),
('Uchiha Clan Elite', 'Full Service', 18000.00),
('Hokage Grand Celebration', 'Full Service', 22000.00),
('Akatsuki Deluxe Experience', 'Full Service', 25000.00),

-- Basic Packages
('Genin Starter Package', 'Basic', 8000.00),
('Chunin Standard Package', 'Basic', 10000.00),
('Jonin Professional Package', 'Basic', 12000.00),

-- Premium Packages
('Jinchuriki Special Package', 'Premium', 25000.00),
('Sage Mode Deluxe', 'Premium', 28000.00),
('Six Paths Ultimate Package', 'Premium', 32000.00),

-- Specialty Packages
('Ramen Lovers Special', 'Specialty', 12000.00),
('Sushi Master Collection', 'Specialty', 16000.00),
('Anime Fusion Experience', 'Specialty', 14000.00),
('Ninja Warrior Feast', 'Specialty', 19000.00),
('Vegetarian Paradise Package', 'Specialty', 13000.00);

-- ============================================================================
-- STEP 8: LINK PACKAGES TO MENU ITEMS (package_menu_items)
-- ============================================================================

-- Hidden Leaf Village Premium
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Uchiha Clan Elite
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Hokage Grand Celebration
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Akatsuki Deluxe Experience
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 2),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 2),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

-- Genin Starter Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1);

-- Chunin Standard Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Jonin Professional Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Jinchuriki Special Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 3),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Sage Mode Deluxe
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sage Mode Deluxe'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Six Paths Ultimate Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 2),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 2),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1),
((SELECT package_id FROM package WHERE package_name = 'Six Paths Ultimate Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Ramen Lovers Special
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1);

-- Sushi Master Collection
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 2),
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Anime Fusion Experience
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Ninja Warrior Feast
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Vegetarian Paradise Package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 2),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegetarian Paradise Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

-- ============================================================================
-- STEP 9: VERIFICATION AND SUMMARY
-- ============================================================================

SELECT 'Data insertion completed successfully!' AS Status;

SELECT 
    (SELECT COUNT(*) FROM dietary_restriction) AS 'Total Dietary Restrictions',
    (SELECT COUNT(*) FROM ingredient) AS 'Total Ingredients',
    (SELECT COUNT(*) FROM menu_item) AS 'Total Menu Items',
    (SELECT COUNT(*) FROM recipe) AS 'Total Recipes',
    (SELECT COUNT(*) FROM package) AS 'Total Packages',
    (SELECT COUNT(*) FROM package_menu_items) AS 'Total Package-Menu Links';

SELECT 'Menu Items by Type:' AS Info;
SELECT menu_type, COUNT(*) AS count FROM menu_item GROUP BY menu_type;

SELECT 'Menu Items by Dietary Restriction:' AS Info;
SELECT 
    COALESCE(dr.restriction_name, 'No Restriction') AS restriction_name,
    COUNT(*) AS count 
FROM menu_item mi
LEFT JOIN dietary_restriction dr ON mi.restriction_id = dr.restriction_id
GROUP BY dr.restriction_name
ORDER BY count DESC;

