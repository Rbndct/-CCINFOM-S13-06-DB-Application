-- ============================================================================
-- Insert Food Data
-- ============================================================================
-- This script clears existing food-related data and inserts comprehensive
-- dietary restrictions, ingredients, menu items, recipes, and packages
-- ============================================================================

USE wedding_management_db;

-- Disable safe updates to allow DELETE operations
SET SQL_SAFE_UPDATES = 0;

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

-- Clear menu_item_restrictions junction table (must be deleted before menu_item due to foreign key)
DELETE FROM menu_item_restrictions;

-- Delete menu items (junction table entries will be deleted via CASCADE if not already deleted)
DELETE FROM menu_item;

-- Delete ingredients
DELETE FROM ingredient;

-- Clear guest_restrictions junction table (if it references dietary restrictions)
DELETE FROM guest_restrictions;

-- Clear couple_preference_restrictions junction table (if it references dietary restrictions)
DELETE FROM couple_preference_restrictions;


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

INSERT INTO menu_item (menu_name, unit_cost, selling_price, menu_type) VALUES
-- Appetizers
('Ramen Appetizer Bowl', 150.00, 280.00, 'Appetizer'),
('Miso Soup Shot', 45.00, 95.00, 'Appetizer'),
('Edamame (Steamed Soybeans)', 60.00, 120.00, 'Appetizer'),
('Takoyaki (Octopus Balls)', 180.00, 320.00, 'Appetizer'),
('Gyoza (Dumplings)', 120.00, 240.00, 'Appetizer'),
('Tempura Shrimp', 200.00, 380.00, 'Appetizer'),
('Vegetable Spring Rolls', 90.00, 170.00, 'Appetizer'),
('Chicken Yakitori', 140.00, 260.00, 'Appetizer'),
('Tofu Skewers', 100.00, 190.00, 'Appetizer'),
('Seaweed Salad', 70.00, 140.00, 'Appetizer'),

-- Main Courses
('Ichiraku Ramen Special', 350.00, 650.00, 'Main Course'),
('Naruto Udon Bowl', 280.00, 520.00, 'Main Course'),
('Sasuke Teriyaki Chicken', 420.00, 780.00, 'Main Course'),
('Sakura Sushi Platter', 550.00, 980.00, 'Main Course'),
('Kakashi Grilled Fish', 380.00, 720.00, 'Main Course'),
('Beef Sukiyaki', 450.00, 850.00, 'Main Course'),
('Vegetarian Curry Bowl', 320.00, 600.00, 'Main Course'),
('Tofu Teriyaki Bowl', 280.00, 520.00, 'Main Course'),
('Chicken Katsu Curry', 400.00, 750.00, 'Main Course'),
('Salmon Teriyaki', 390.00, 730.00, 'Main Course'),

-- Beverages
('Green Tea', 25.00, 50.00, 'Beverage'),
('Matcha Latte', 45.00, 90.00, 'Beverage'),
('Japanese Iced Coffee', 40.00, 80.00, 'Beverage'),
('Sake (Premium)', 120.00, 240.00, 'Beverage'),
('Plum Wine', 100.00, 200.00, 'Beverage'),
('Fresh Orange Juice', 35.00, 70.00, 'Beverage'),
('Mango Smoothie', 50.00, 100.00, 'Beverage'),
('Sparkling Water', 20.00, 40.00, 'Beverage'),
('Yuzu Lemonade', 40.00, 80.00, 'Beverage'),
('Hot Sake', 110.00, 220.00, 'Beverage'),

-- Desserts
('Dango Trio (Sweet Rice Balls)', 90.00, 180.00, 'Dessert'),
('Mochi Ice Cream', 110.00, 220.00, 'Dessert'),
('Matcha Green Tea Cake', 140.00, 280.00, 'Dessert'),
('Red Bean Mochi', 95.00, 190.00, 'Dessert'),
('Sesame Balls', 85.00, 170.00, 'Dessert'),
('Taiyaki (Fish-shaped Cake)', 80.00, 160.00, 'Dessert'),
('Warabimochi', 75.00, 150.00, 'Dessert'),
('Green Tea Ice Cream', 100.00, 200.00, 'Dessert'),
('Anmitsu', 120.00, 240.00, 'Dessert'),
('Dorayaki', 85.00, 170.00, 'Dessert');

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
-- STEP 6.5: ADD MULTIPLE DIETARY RESTRICTIONS TO MENU ITEMS
-- ============================================================================
-- Some menu items have multiple dietary restrictions (2-4 restrictions)
-- This uses the menu_item_restrictions junction table

-- Get additional restriction IDs
SET @gluten_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Gluten Intolerant' LIMIT 1);
SET @low_sodium_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Sodium' LIMIT 1);
SET @low_sugar_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Sugar' LIMIT 1);
SET @diabetic_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Diabetic-Friendly' LIMIT 1);
SET @halal_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Halal' LIMIT 1);
SET @kosher_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Kosher' LIMIT 1);
SET @no_alcohol_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Alcohol' LIMIT 1);
SET @peanut_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Peanut Allergy' LIMIT 1);
SET @tree_nut_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Tree Nut Allergy' LIMIT 1);
SET @shellfish_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Shellfish Allergy' LIMIT 1);
SET @dairy_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Dairy Allergy' LIMIT 1);
SET @egg_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Egg Allergy' LIMIT 1);

-- Add restrictions to menu items via junction table (1-4 restrictions each)

-- Single restrictions for menu items
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Miso Soup Shot'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Edamame (Steamed Soybeans)'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @pescatarian_id FROM menu_item mi WHERE mi.menu_name = 'Takoyaki (Octopus Balls)'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @pescatarian_id)
UNION ALL
SELECT mi.menu_item_id, @pescatarian_id FROM menu_item mi WHERE mi.menu_name = 'Tempura Shrimp'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @pescatarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Vegetable Spring Rolls'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @no_pork_id FROM menu_item mi WHERE mi.menu_name = 'Chicken Yakitori'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @no_pork_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Skewers'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Seaweed Salad'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Naruto Udon Bowl'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @no_pork_id FROM menu_item mi WHERE mi.menu_name = 'Sasuke Teriyaki Chicken'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @no_pork_id)
UNION ALL
SELECT mi.menu_item_id, @pescatarian_id FROM menu_item mi WHERE mi.menu_name = 'Sakura Sushi Platter'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @pescatarian_id)
UNION ALL
SELECT mi.menu_item_id, @pescatarian_id FROM menu_item mi WHERE mi.menu_name = 'Kakashi Grilled Fish'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @pescatarian_id)
UNION ALL
SELECT mi.menu_item_id, @no_pork_id FROM menu_item mi WHERE mi.menu_name = 'Beef Sukiyaki'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @no_pork_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Vegetarian Curry Bowl'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Teriyaki Bowl'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @no_pork_id FROM menu_item mi WHERE mi.menu_name = 'Chicken Katsu Curry'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @no_pork_id)
UNION ALL
SELECT mi.menu_item_id, @pescatarian_id FROM menu_item mi WHERE mi.menu_name = 'Salmon Teriyaki'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @pescatarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Green Tea'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Matcha Latte'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Japanese Iced Coffee'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Fresh Orange Juice'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Mango Smoothie'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Sparkling Water'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Yuzu Lemonade'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Dango Trio (Sweet Rice Balls)'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Mochi Ice Cream'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Matcha Green Tea Cake'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Red Bean Mochi'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Sesame Balls'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Taiyaki (Fish-shaped Cake)'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Warabimochi'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Green Tea Ice Cream'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id)
UNION ALL
SELECT mi.menu_item_id, @vegan_id FROM menu_item mi WHERE mi.menu_name = 'Anmitsu'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegan_id)
UNION ALL
SELECT mi.menu_item_id, @vegetarian_id FROM menu_item mi WHERE mi.menu_name = 'Dorayaki'
AND NOT EXISTS (SELECT 1 FROM menu_item_restrictions mir WHERE mir.menu_item_id = mi.menu_item_id AND mir.restriction_id = @vegetarian_id);

-- Miso Soup Shot: 2 restrictions (Vegetarian + Low-Sodium)
-- Note: Vegetarian is already added above, adding Low-Sodium
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Miso Soup Shot'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
);

-- Edamame: 3 restrictions (Vegan + Gluten Free + Low-Sodium)
-- Note: Vegan is already added above, adding Gluten Free and Low-Sodium
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Edamame (Steamed Soybeans)'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Edamame (Steamed Soybeans)'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
);

-- Vegetable Spring Rolls: 3 restrictions (Vegan + Gluten Free + Low-Fat)
SET @low_fat_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Fat' LIMIT 1);
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Vegetable Spring Rolls'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_fat_id FROM menu_item mi WHERE mi.menu_name = 'Vegetable Spring Rolls'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_fat_id
);

-- Tofu Skewers: 4 restrictions (Vegan + Gluten Free + Low-Sodium + Low-Fat)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Skewers'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Skewers'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
)
UNION ALL
SELECT mi.menu_item_id, @low_fat_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Skewers'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_fat_id
);

-- Naruto Udon Bowl: 2 restrictions (Vegetarian + Low-Sodium)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Naruto Udon Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
);

-- Vegetarian Curry Bowl: 3 restrictions (Vegan + Gluten Free + Low-Sodium)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Vegetarian Curry Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Vegetarian Curry Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
);

-- Tofu Teriyaki Bowl: 4 restrictions (Vegan + Gluten Free + Low-Sodium + Low-Fat)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Teriyaki Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Teriyaki Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
)
UNION ALL
SELECT mi.menu_item_id, @low_fat_id FROM menu_item mi WHERE mi.menu_name = 'Tofu Teriyaki Bowl'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_fat_id
);

-- Green Tea: 2 restrictions (Vegan + Low-Sugar)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sugar_id FROM menu_item mi WHERE mi.menu_name = 'Green Tea'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sugar_id
);

-- Matcha Latte: 3 restrictions (Vegetarian + Low-Sugar + Diabetic-Friendly)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sugar_id FROM menu_item mi WHERE mi.menu_name = 'Matcha Latte'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sugar_id
)
UNION ALL
SELECT mi.menu_item_id, @diabetic_id FROM menu_item mi WHERE mi.menu_name = 'Matcha Latte'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @diabetic_id
);

-- Japanese Iced Coffee: 2 restrictions (Vegan + Low-Sugar)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sugar_id FROM menu_item mi WHERE mi.menu_name = 'Japanese Iced Coffee'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sugar_id
);

-- Dango Trio: 2 restrictions (Vegan + Gluten Free)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Dango Trio (Sweet Rice Balls)'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
);

-- Red Bean Mochi: 3 restrictions (Vegan + Gluten Free + Low-Sodium)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Red Bean Mochi'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Red Bean Mochi'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
);

-- Sesame Balls: 4 restrictions (Vegan + Gluten Free + Low-Sodium + Low-Fat)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Sesame Balls'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sodium_id FROM menu_item mi WHERE mi.menu_name = 'Sesame Balls'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sodium_id
)
UNION ALL
SELECT mi.menu_item_id, @low_fat_id FROM menu_item mi WHERE mi.menu_name = 'Sesame Balls'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_fat_id
);

-- Warabimochi: 3 restrictions (Vegan + Gluten Free + Low-Sugar)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @gluten_id FROM menu_item mi WHERE mi.menu_name = 'Warabimochi'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @gluten_id
)
UNION ALL
SELECT mi.menu_item_id, @low_sugar_id FROM menu_item mi WHERE mi.menu_name = 'Warabimochi'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sugar_id
);

-- Anmitsu: 2 restrictions (Vegan + Low-Sugar)
INSERT INTO menu_item_restrictions (menu_item_id, restriction_id)
SELECT mi.menu_item_id, @low_sugar_id FROM menu_item mi WHERE mi.menu_name = 'Anmitsu'
AND NOT EXISTS (
    SELECT 1 FROM menu_item_restrictions mir 
    WHERE mir.menu_item_id = mi.menu_item_id 
    AND mir.restriction_id = @low_sugar_id
);

-- ============================================================================
-- STEP 7: INSERT PACKAGES (at least 10)
-- ============================================================================

INSERT INTO package (package_name, package_type, selling_price) VALUES
-- Full Service Packages (Realistic pricing: 180-220% markup)
('Hidden Leaf Village Premium', 'Full Service', 2500.00),
('Uchiha Clan Elite', 'Full Service', 4100.00),
('Hokage Grand Celebration', 'Full Service', 6600.00),
('Akatsuki Deluxe Experience', 'Full Service', 6300.00),

-- Basic Packages (Realistic pricing: 200-250% markup)
('Genin Starter Package', 'Basic', 1450.00),
('Chunin Standard Package', 'Basic', 2240.00),
('Jonin Professional Package', 'Basic', 3990.00),

-- Premium Packages (Realistic pricing: 180-200% markup)
('Jinchuriki Special Package', 'Premium', 8400.00),
('Sage Mode Deluxe', 'Premium', 9450.00),
('Six Paths Ultimate Package', 'Premium', 9000.00),

-- Specialty Packages (Realistic pricing: 180-220% markup)
('Ramen Lovers Special', 'Specialty', 3830.00),
('Sushi Master Collection', 'Specialty', 3900.00),
('Anime Fusion Experience', 'Specialty', 3810.00),
('Ninja Warrior Feast', 'Specialty', 6750.00),
('Vegetarian Paradise Package', 'Specialty', 4620.00),

-- Diet-Specific Packages (Realistic pricing: 200-220% markup)
('Vegan Delight Package', 'Specialty', 4200.00),
('Gluten-Free Gourmet', 'Specialty', 4800.00),
('Low-Sodium Healthy Choice', 'Specialty', 3600.00),
('Halal Certified Feast', 'Specialty', 5500.00),
('Heart-Healthy Selection', 'Specialty', 3800.00);

-- ============================================================================
-- STEP 8: LINK PACKAGES TO MENU ITEMS (package_menu_items)
-- ============================================================================

-- Hidden Leaf Village Premium (Cost: ~895, Price: 2500, Markup: ~180%)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hidden Leaf Village Premium'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Uchiha Clan Elite (Cost: ~1470, Price: 4100, Markup: ~180%) - Varied quantities
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 3),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Uchiha Clan Elite'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Hokage Grand Celebration (Cost: ~2370, Price: 6600, Markup: ~180%) - High quantity package
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 4),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1),
((SELECT package_id FROM package WHERE package_name = 'Hokage Grand Celebration'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Akatsuki Deluxe Experience (Cost: ~2240, Price: 6300, Markup: ~180%)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tempura Shrimp'), 2),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 2),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Akatsuki Deluxe Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

-- Genin Starter Package (Cost: ~415, Price: 1450, Markup: ~250%) - Minimal items
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Genin Starter Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1);

-- Chunin Standard Package (Cost: ~640, Price: 2240, Markup: ~250%)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Chunin Standard Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Jonin Professional Package (Cost: ~1330, Price: 3990, Markup: ~200%)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jonin Professional Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Jinchuriki Special Package (Cost: ~2800, Price: 8400, Markup: ~200%) - High quantity
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 3),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 1),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Jinchuriki Special Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Sage Mode Deluxe (Cost: ~3150, Price: 9450, Markup: ~200%) - Large variety
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

-- Six Paths Ultimate Package (Cost: ~3000, Price: 9000, Markup: ~200%)
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

-- Ramen Lovers Special (Cost: ~1370, Price: 3830, Markup: ~180%) - High quantity ramen
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 4),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ramen Lovers Special'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1);

-- Sushi Master Collection (Cost: ~1300, Price: 3900, Markup: ~200%) - Minimal items, high quantity
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sakura Sushi Platter'), 3),
((SELECT package_id FROM package WHERE package_name = 'Sushi Master Collection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Anime Fusion Experience (Cost: ~1270, Price: 3810, Markup: ~200%)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Anime Fusion Experience'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Ninja Warrior Feast (Cost: ~2250, Price: 6750, Markup: ~200%) - High quantity appetizers
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ramen Appetizer Bowl'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Takoyaki (Octopus Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Gyoza (Dumplings)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Ichiraku Ramen Special'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Ninja Warrior Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Mochi Ice Cream'), 1);

-- Vegetarian Paradise Package (Cost: ~1540, Price: 4620, Markup: ~200%)
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
-- DIET-SPECIFIC PACKAGES
-- ============================================================================

-- Vegan Delight Package (Cost: ~1400, Price: 4200, Markup: ~200%) - All vegan items
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 3),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 2),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Vegan Delight Package'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

-- Gluten-Free Gourmet (Cost: ~1600, Price: 4800, Markup: ~200%) - Gluten-free items only
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 2),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Dango Trio (Sweet Rice Balls)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1),
((SELECT package_id FROM package WHERE package_name = 'Gluten-Free Gourmet'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

-- Low-Sodium Healthy Choice (Cost: ~1200, Price: 3600, Markup: ~200%) - Low-sodium items
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 1),
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Naruto Udon Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetarian Curry Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Low-Sodium Healthy Choice'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Red Bean Mochi'), 1);

-- Halal Certified Feast (Cost: ~1833, Price: 5500, Markup: ~200%) - Halal items (no pork, no alcohol)
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Miso Soup Shot'), 2),
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Yakitori'), 3),
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sasuke Teriyaki Chicken'), 1),
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Beef Sukiyaki'), 1),
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Chicken Katsu Curry'), 1),
((SELECT package_id FROM package WHERE package_name = 'Halal Certified Feast'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Matcha Green Tea Cake'), 1);

-- Heart-Healthy Selection (Cost: ~1267, Price: 3800, Markup: ~200%) - Low-fat, heart-healthy items
INSERT INTO package_menu_items (package_id, menu_item_id, quantity) VALUES
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Edamame (Steamed Soybeans)'), 2),
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Vegetable Spring Rolls'), 2),
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Skewers'), 2),
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Kakashi Grilled Fish'), 1),
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Tofu Teriyaki Bowl'), 1),
((SELECT package_id FROM package WHERE package_name = 'Heart-Healthy Selection'), (SELECT menu_item_id FROM menu_item WHERE menu_name = 'Sesame Balls'), 1);

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
    COUNT(DISTINCT mir.menu_item_id) AS count 
FROM menu_item mi
LEFT JOIN menu_item_restrictions mir ON mi.menu_item_id = mir.menu_item_id
LEFT JOIN dietary_restriction dr ON mir.restriction_id = dr.restriction_id
GROUP BY dr.restriction_name
ORDER BY count DESC;

