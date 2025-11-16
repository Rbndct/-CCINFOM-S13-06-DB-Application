-- ============================================================================
-- Naruto-Themed Weddings and Guests Insert Script
-- ============================================================================
-- This script creates 10+ weddings from Naruto couples, each with at least
-- 10 guests, all with varied dietary restrictions for testing purposes
-- ============================================================================

USE wedding_management_db;

-- ============================================================================
-- STEP 1: GET COUPLE IDs (assuming couples are already inserted)
-- ============================================================================
-- NOTE: Make sure to run insert_naruto_couples.sql first if couples don't exist
-- If Naruto & Hinata don't exist, you may need to insert them first

SET @naruto_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Naruto' AND partner2_name = 'Hinata' LIMIT 1);
SET @sasuke_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Sasuke' AND partner2_name = 'Sakura' LIMIT 1);
SET @shikamaru_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Shikamaru' AND partner2_name = 'Temari' LIMIT 1);
SET @ino_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Ino' AND partner2_name = 'Sai' LIMIT 1);
SET @choji_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Choji' AND partner2_name = 'Karui' LIMIT 1);
SET @kiba_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Kiba' AND partner2_name = 'Tamaki' LIMIT 1);
SET @minato_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Minato' AND partner2_name = 'Kushina' LIMIT 1);
SET @hashirama_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Hashirama' AND partner2_name = 'Mito' LIMIT 1);
SET @asuma_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Asuma' AND partner2_name = 'Kurenai' LIMIT 1);
SET @gaara_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Gaara' AND partner2_name = 'Matsuri' LIMIT 1);
SET @rocklee_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Rock Lee' AND partner2_name = 'Tenten' LIMIT 1);
SET @neji_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Neji' AND partner2_name = 'Tenten' LIMIT 1);

-- ============================================================================
-- STEP 2: GET RESTRICTION IDs
-- ============================================================================

SET @none_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'None' LIMIT 1);
SET @vegetarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Vegetarian' LIMIT 1);
SET @vegan_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Vegan' LIMIT 1);
SET @pescatarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Pescatarian' LIMIT 1);
SET @no_pork_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Pork' LIMIT 1);
SET @no_beef_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Beef' LIMIT 1);
SET @lactose_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Lactose Intolerant' LIMIT 1);
SET @gluten_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Gluten Intolerant' LIMIT 1);
SET @halal_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Halal' LIMIT 1);
SET @kosher_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Kosher' LIMIT 1);
SET @no_alcohol_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Alcohol' LIMIT 1);
SET @peanut_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Peanut Allergy' LIMIT 1);
SET @tree_nut_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Tree Nut Allergy' LIMIT 1);
SET @shellfish_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Shellfish Allergy' LIMIT 1);
SET @seafood_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Seafood Allergy' LIMIT 1);
SET @dairy_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Dairy Allergy' LIMIT 1);
SET @egg_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Egg Allergy' LIMIT 1);
SET @soy_allergy_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Soy Allergy' LIMIT 1);
SET @diabetic_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Diabetic-Friendly' LIMIT 1);
SET @low_sodium_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Sodium' LIMIT 1);
SET @low_sugar_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Sugar' LIMIT 1);

-- ============================================================================
-- STEP 3: CREATE COUPLE PREFERENCES WITH VARIED RESTRICTIONS (0-4 restrictions)
-- ============================================================================

-- Naruto & Hinata - 3 restrictions: Vegetarian + No Alcohol + Lactose Intolerant (scattered: Dietary, Religious, Intolerance)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@naruto_couple_id, 'Traditional');
SET @naruto_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@naruto_pref_id, @vegetarian_id),
(@naruto_pref_id, @no_alcohol_id),
(@naruto_pref_id, @lactose_id);

-- Sasuke & Sakura - 2 restrictions: Peanut Allergy + Tree Nut Allergy (scattered: Allergies)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@sasuke_couple_id, 'Modern');
SET @sasuke_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@sasuke_pref_id, @peanut_allergy_id),
(@sasuke_pref_id, @tree_nut_allergy_id);

-- Shikamaru & Temari - 4 restrictions: Halal + No Alcohol + No Pork + Low-Sodium (scattered: Religious, Dietary, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@shikamaru_couple_id, 'Traditional');
SET @shikamaru_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@shikamaru_pref_id, @halal_id),
(@shikamaru_pref_id, @no_alcohol_id),
(@shikamaru_pref_id, @no_pork_id),
(@shikamaru_pref_id, @low_sodium_id);

-- Ino & Sai - 4 restrictions: Vegan + No Alcohol + Low-Sugar + Low-Fat (scattered: Dietary, Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@ino_couple_id, 'Modern');
SET @ino_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@ino_pref_id, @vegan_id),
(@ino_pref_id, @no_alcohol_id),
(@ino_pref_id, @low_sugar_id),
(@ino_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Fat' LIMIT 1));

-- Choji & Karui - 1 restriction: Shellfish Allergy (scattered: Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@choji_couple_id, 'Traditional');
SET @choji_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@choji_pref_id, @shellfish_allergy_id);

-- Kiba & Tamaki - 3 restrictions: Pescatarian + Seafood Allergy + Dairy Allergy (scattered: Dietary, Allergies)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@kiba_couple_id, 'Outdoor');
SET @kiba_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@kiba_pref_id, @pescatarian_id),
(@kiba_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Seafood Allergy' LIMIT 1)),
(@kiba_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Dairy Allergy' LIMIT 1));

-- Minato & Kushina - 4 restrictions: Kosher + No Alcohol + Low-Sodium + Heart-Healthy (scattered: Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@minato_couple_id, 'Traditional');
SET @minato_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@minato_pref_id, @kosher_id),
(@minato_pref_id, @no_alcohol_id),
(@minato_pref_id, @low_sodium_id),
(@minato_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Heart-Healthy' LIMIT 1));

-- Hashirama & Mito - 3 restrictions: Vegetarian + No Alcohol + Gluten Intolerant (scattered: Dietary, Religious, Intolerance)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@hashirama_couple_id, 'Traditional');
SET @hashirama_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@hashirama_pref_id, @vegetarian_id),
(@hashirama_pref_id, @no_alcohol_id),
(@hashirama_pref_id, @gluten_id);

-- Asuma & Kurenai - 4 restrictions: No Pork + Low-Sodium + Diabetic-Friendly + Egg Allergy (scattered: Dietary, Medical, Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@asuma_couple_id, 'Modern');
SET @asuma_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@asuma_pref_id, @no_pork_id),
(@asuma_pref_id, @low_sodium_id),
(@asuma_pref_id, @diabetic_id),
(@asuma_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Egg Allergy' LIMIT 1));

-- Gaara & Matsuri - 3 restrictions: Halal + No Alcohol + Wheat Allergy (scattered: Religious, Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@gaara_couple_id, 'Traditional');
SET @gaara_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@gaara_pref_id, @halal_id),
(@gaara_pref_id, @no_alcohol_id),
(@gaara_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Wheat Allergy' LIMIT 1));

-- Rock Lee & Tenten - 2 restrictions: Soy Allergy + Fructose Intolerant (scattered: Allergy, Intolerance)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@rocklee_couple_id, 'Modern');
SET @rocklee_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@rocklee_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Soy Allergy' LIMIT 1)),
(@rocklee_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Fructose Intolerant' LIMIT 1));

-- Neji & Tenten - 4 restrictions: Gluten Free + No Alcohol + Low-Sugar + Diabetic-Friendly (scattered: Intolerance, Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@neji_couple_id, 'Traditional');
SET @neji_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@neji_pref_id, @gluten_id),
(@neji_pref_id, @no_alcohol_id),
(@neji_pref_id, @low_sugar_id),
(@neji_pref_id, @diabetic_id);

-- ============================================================================
-- STEP 4: CREATE WEDDINGS
-- ============================================================================

-- Wedding 1: Naruto & Hinata - Spring Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@naruto_couple_id, '2024-04-15', '14:00:00', 'Konoha Grand Hall', 120, 500000.00, 350000.00, 'paid', @naruto_pref_id);
SET @wedding1_id = LAST_INSERT_ID();

-- Wedding 2: Sasuke & Sakura - Summer Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@sasuke_couple_id, '2024-06-20', '16:00:00', 'Uchiha Clan Estate', 80, 750000.00, 500000.00, 'paid', @sasuke_pref_id);
SET @wedding2_id = LAST_INSERT_ID();

-- Wedding 3: Shikamaru & Temari - Autumn Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@shikamaru_couple_id, '2024-09-10', '15:00:00', 'Nara Family Gardens', 100, 600000.00, 400000.00, 'pending', @shikamaru_pref_id);
SET @wedding3_id = LAST_INSERT_ID();

-- Wedding 4: Ino & Sai - Spring Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@ino_couple_id, '2024-05-05', '13:00:00', 'Yamanaka Flower Garden', 90, 550000.00, 380000.00, 'paid', @ino_pref_id);
SET @wedding4_id = LAST_INSERT_ID();

-- Wedding 5: Choji & Karui - Summer Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@choji_couple_id, '2024-07-25', '17:00:00', 'Akimichi Banquet Hall', 150, 800000.00, 550000.00, 'paid', @choji_pref_id);
SET @wedding5_id = LAST_INSERT_ID();

-- Wedding 6: Kiba & Tamaki - Outdoor Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@kiba_couple_id, '2024-08-15', '16:30:00', 'Inuzuka Training Grounds', 70, 450000.00, 300000.00, 'pending', @kiba_pref_id);
SET @wedding6_id = LAST_INSERT_ID();

-- Wedding 7: Minato & Kushina - Historical Wedding (Past date for historical context)
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@minato_couple_id, '2023-10-10', '14:00:00', 'Konoha Memorial Hall', 200, 1000000.00, 700000.00, 'paid', @minato_pref_id);
SET @wedding7_id = LAST_INSERT_ID();

-- Wedding 8: Hashirama & Mito - Historical Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@hashirama_couple_id, '2023-11-20', '15:00:00', 'Senju Clan Temple', 180, 900000.00, 600000.00, 'paid', @hashirama_pref_id);
SET @wedding8_id = LAST_INSERT_ID();

-- Wedding 9: Asuma & Kurenai - Winter Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@asuma_couple_id, '2024-12-15', '16:00:00', 'Sarutobi Family Estate', 85, 650000.00, 450000.00, 'pending', @asuma_pref_id);
SET @wedding9_id = LAST_INSERT_ID();

-- Wedding 10: Gaara & Matsuri - Sand Village Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@gaara_couple_id, '2024-10-05', '17:00:00', 'Sand Village Oasis', 95, 700000.00, 480000.00, 'paid', @gaara_pref_id);
SET @wedding10_id = LAST_INSERT_ID();

-- Wedding 11: Rock Lee & Tenten - Energetic Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@rocklee_couple_id, '2024-09-30', '14:30:00', 'Konoha Training Arena', 110, 580000.00, 390000.00, 'paid', @rocklee_pref_id);
SET @wedding11_id = LAST_INSERT_ID();

-- Wedding 12: Neji & Tenten - Traditional Wedding
INSERT INTO wedding (couple_id, wedding_date, wedding_time, venue, guest_count, total_cost, production_cost, payment_status, preference_id) VALUES
(@neji_couple_id, '2024-11-10', '15:30:00', 'Hyuga Clan Compound', 75, 520000.00, 360000.00, 'pending', @neji_pref_id);
SET @wedding12_id = LAST_INSERT_ID();

-- ============================================================================
-- STEP 5: CREATE GUESTS WITH VARIED DIETARY RESTRICTIONS
-- ============================================================================

-- Wedding 1: Naruto & Hinata (120 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding1_id, 'Kakashi Hatake', 'accepted', @none_id),
(@wedding1_id, 'Choji Akimichi', 'pending', @none_id),
(@wedding1_id, 'Sasuke Uchiha', 'accepted', @none_id),
(@wedding1_id, 'Neji Hyuga', 'declined', @none_id),
(@wedding1_id, 'Rock Lee', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding1_id, 'Iruka Umino', 'accepted', @vegetarian_id),
(@wedding1_id, 'Shino Aburame', 'pending', @vegan_id),
(@wedding1_id, 'Kurenai Yuhi', 'accepted', @lactose_id),
(@wedding1_id, 'Guy Sensei', 'accepted', @gluten_id),
(@wedding1_id, 'Jiraiya', 'pending', @no_alcohol_id),
(@wedding1_id, 'Hanabi Hyuga', 'accepted', @vegetarian_id),
(@wedding1_id, 'Hiashi Hyuga', 'accepted', @halal_id),
(@wedding1_id, 'Kiba Inuzuka', 'declined', @pescatarian_id),
(@wedding1_id, 'Shikamaru Nara', 'accepted', @diabetic_id),
(@wedding1_id, 'Sakura Haruno', 'pending', @low_sugar_id),
(@wedding1_id, 'Ino Yamanaka', 'accepted', @vegetarian_id),
(@wedding1_id, 'Tenten', 'accepted', @gluten_id),
(@wedding1_id, 'Sai Yamanaka', 'pending', @vegan_id),
-- 2+ restrictions (will be added via junction table - base restriction set here)
(@wedding1_id, 'Tsunade', 'accepted', @peanut_allergy_id), -- Will add 2 more via junction
(@wedding1_id, 'Konohamaru Sarutobi', 'accepted', @shellfish_allergy_id); -- Will add 1 more via junction

-- Wedding 2: Sasuke & Sakura (80 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding2_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding2_id, 'Kakashi Hatake', 'pending', @none_id),
(@wedding2_id, 'Choji Akimichi', 'accepted', @none_id),
(@wedding2_id, 'Rock Lee', 'declined', @none_id),
(@wedding2_id, 'Tenten', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding2_id, 'Hinata Hyuga', 'accepted', @vegetarian_id),
(@wedding2_id, 'Itachi Uchiha', 'pending', @kosher_id),
(@wedding2_id, 'Fugaku Uchiha', 'accepted', @halal_id),
(@wedding2_id, 'Mikoto Uchiha', 'accepted', @no_pork_id),
(@wedding2_id, 'Ino Yamanaka', 'pending', @vegan_id),
(@wedding2_id, 'Shikamaru Nara', 'accepted', @diabetic_id),
(@wedding2_id, 'Kiba Inuzuka', 'declined', @pescatarian_id),
(@wedding2_id, 'Shino Aburame', 'accepted', @tree_nut_allergy_id),
-- 2+ restrictions (will be added via junction table)
(@wedding2_id, 'Orochimaru', 'accepted', @vegan_id),
(@wedding2_id, 'Kabuto Yakushi', 'pending', @vegetarian_id);

-- Wedding 3: Shikamaru & Temari (100 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding3_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding3_id, 'Choji Akimichi', 'pending', @none_id),
(@wedding3_id, 'Rock Lee', 'accepted', @none_id),
(@wedding3_id, 'Tenten', 'declined', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding3_id, 'Hinata Hyuga', 'accepted', @vegetarian_id),
(@wedding3_id, 'Ino Yamanaka', 'pending', @vegan_id),
(@wedding3_id, 'Kiba Inuzuka', 'accepted', @pescatarian_id),
(@wedding3_id, 'Shino Aburame', 'accepted', @halal_id),
(@wedding3_id, 'Gaara', 'accepted', @halal_id),
(@wedding3_id, 'Kankuro', 'pending', @halal_id),
(@wedding3_id, 'Baki', 'accepted', @halal_id),
(@wedding3_id, 'Shikaku Nara', 'declined', @diabetic_id),
(@wedding3_id, 'Yoshino Nara', 'accepted', @low_sodium_id),
-- 2+ restrictions (will be added via junction table)
(@wedding3_id, 'Kakashi Hatake', 'accepted', @halal_id);

-- Wedding 4: Ino & Sai (90 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding4_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding4_id, 'Sasuke Uchiha', 'pending', @none_id),
(@wedding4_id, 'Kakashi Hatake', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding4_id, 'Sakura Haruno', 'accepted', @vegan_id),
(@wedding4_id, 'Hinata Hyuga', 'pending', @vegetarian_id),
(@wedding4_id, 'Shikamaru Nara', 'accepted', @vegan_id),
(@wedding4_id, 'Choji Akimichi', 'declined', @vegan_id),
(@wedding4_id, 'Inoichi Yamanaka', 'accepted', @vegan_id),
(@wedding4_id, 'Yamato', 'pending', @vegan_id),
(@wedding4_id, 'Sai', 'accepted', @vegan_id),
(@wedding4_id, 'Tenten', 'accepted', @vegan_id),
(@wedding4_id, 'Rock Lee', 'pending', @vegan_id),
-- 2+ restrictions (will be added via junction table)
(@wedding4_id, 'Kurenai Yuhi', 'accepted', @vegan_id),
(@wedding4_id, 'Asuma Sarutobi', 'accepted', @vegan_id);

-- Wedding 5: Choji & Karui (150 guests - showing 15 key guests with mixed RSVP)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
(@wedding5_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding5_id, 'Hinata Hyuga', 'pending', @none_id),
(@wedding5_id, 'Shikamaru Nara', 'accepted', @none_id),
(@wedding5_id, 'Temari', 'declined', @none_id),
(@wedding5_id, 'Ino Yamanaka', 'accepted', @none_id),
(@wedding5_id, 'Sai Yamanaka', 'pending', @none_id),
(@wedding5_id, 'Kiba Inuzuka', 'accepted', @none_id),
(@wedding5_id, 'Shino Aburame', 'accepted', @none_id),
(@wedding5_id, 'Choza Akimichi', 'pending', @none_id),
(@wedding5_id, 'Chocho Akimichi', 'accepted', @none_id),
(@wedding5_id, 'Darui', 'declined', @none_id),
(@wedding5_id, 'A', 'accepted', @none_id),
(@wedding5_id, 'Samui', 'pending', @none_id),
(@wedding5_id, 'Omoi', 'accepted', @none_id),
(@wedding5_id, 'Kakashi Hatake', 'accepted', @none_id);

-- Wedding 6: Kiba & Tamaki (70 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding6_id, 'Kakashi Hatake', 'accepted', @none_id),
(@wedding6_id, 'Rock Lee', 'pending', @none_id),
(@wedding6_id, 'Tenten', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding6_id, 'Naruto Uzumaki', 'accepted', @pescatarian_id),
(@wedding6_id, 'Hinata Hyuga', 'pending', @pescatarian_id),
(@wedding6_id, 'Shino Aburame', 'accepted', @pescatarian_id),
(@wedding6_id, 'Tsume Inuzuka', 'declined', @pescatarian_id),
(@wedding6_id, 'Hana Inuzuka', 'accepted', @pescatarian_id),
(@wedding6_id, 'Akamaru', 'pending', @pescatarian_id),
(@wedding6_id, 'Guy Sensei', 'accepted', @pescatarian_id),
(@wedding6_id, 'Shikamaru Nara', 'accepted', @pescatarian_id),
(@wedding6_id, 'Choji Akimichi', 'pending', @pescatarian_id),
(@wedding6_id, 'Ino Yamanaka', 'accepted', @pescatarian_id),
-- 2+ restrictions (will be added via junction table)
(@wedding6_id, 'Kurenai Yuhi', 'accepted', @pescatarian_id);

-- Wedding 7: Minato & Kushina (200 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding7_id, 'Kushina Uzumaki', 'accepted', @none_id),
(@wedding7_id, 'Minato Namikaze', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding7_id, 'Hiruzen Sarutobi', 'accepted', @kosher_id),
(@wedding7_id, 'Jiraiya', 'pending', @kosher_id),
(@wedding7_id, 'Tsunade', 'accepted', @kosher_id),
(@wedding7_id, 'Orochimaru', 'declined', @kosher_id),
(@wedding7_id, 'Fugaku Uchiha', 'accepted', @kosher_id),
(@wedding7_id, 'Hiashi Hyuga', 'pending', @kosher_id),
(@wedding7_id, 'Choza Akimichi', 'accepted', @kosher_id),
(@wedding7_id, 'Shikaku Nara', 'accepted', @kosher_id),
(@wedding7_id, 'Inoichi Yamanaka', 'pending', @kosher_id),
(@wedding7_id, 'Tsume Inuzuka', 'accepted', @kosher_id),
(@wedding7_id, 'Danzo Shimura', 'declined', @kosher_id),
(@wedding7_id, 'Koharu Utatane', 'accepted', @kosher_id),
(@wedding7_id, 'Homura Mitokado', 'pending', @kosher_id),
-- 2+ restrictions (will be added via junction table)
(@wedding7_id, 'Mikoto Uchiha', 'accepted', @kosher_id),
(@wedding7_id, 'Biwa Juzo', 'accepted', @kosher_id);

-- Wedding 8: Hashirama & Mito (180 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding8_id, 'Hashirama Senju', 'accepted', @none_id),
(@wedding8_id, 'Mito Uzumaki', 'pending', @none_id),
(@wedding8_id, 'Hagoromo Otsutsuki', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding8_id, 'Tobirama Senju', 'accepted', @vegetarian_id),
(@wedding8_id, 'Madara Uchiha', 'pending', @vegetarian_id),
(@wedding8_id, 'Izuna Uchiha', 'accepted', @vegetarian_id),
(@wedding8_id, 'Tajima Uchiha', 'declined', @vegetarian_id),
(@wedding8_id, 'Butsuma Senju', 'accepted', @vegetarian_id),
(@wedding8_id, 'Kawarama Senju', 'pending', @vegetarian_id),
(@wedding8_id, 'Itama Senju', 'accepted', @vegetarian_id),
(@wedding8_id, 'Hamura Otsutsuki', 'accepted', @vegetarian_id),
(@wedding8_id, 'Kaguya Otsutsuki', 'pending', @vegetarian_id),
(@wedding8_id, 'Asura Otsutsuki', 'accepted', @vegetarian_id),
(@wedding8_id, 'Indra Otsutsuki', 'declined', @vegetarian_id),
(@wedding8_id, 'Black Zetsu', 'accepted', @vegetarian_id),
-- 2+ restrictions (will be added via junction table)
(@wedding8_id, 'Tobirama Senju', 'accepted', @vegetarian_id);

-- Wedding 9: Asuma & Kurenai (85 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding9_id, 'Kurenai Yuhi', 'accepted', @none_id),
(@wedding9_id, 'Asuma Sarutobi', 'pending', @none_id),
(@wedding9_id, 'Kakashi Hatake', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding9_id, 'Shikamaru Nara', 'accepted', @no_pork_id),
(@wedding9_id, 'Choji Akimichi', 'pending', @no_pork_id),
(@wedding9_id, 'Ino Yamanaka', 'accepted', @no_pork_id),
(@wedding9_id, 'Hiruzen Sarutobi', 'declined', @no_pork_id),
(@wedding9_id, 'Konohamaru Sarutobi', 'accepted', @no_pork_id),
(@wedding9_id, 'Mirai Sarutobi', 'pending', @no_pork_id),
(@wedding9_id, 'Guy Sensei', 'accepted', @no_pork_id),
(@wedding9_id, 'Yamato', 'accepted', @no_pork_id),
(@wedding9_id, 'Iruka Umino', 'pending', @no_pork_id),
(@wedding9_id, 'Naruto Uzumaki', 'accepted', @no_pork_id),
(@wedding9_id, 'Sakura Haruno', 'declined', @no_pork_id),
-- 2+ restrictions (will be added via junction table)
(@wedding9_id, 'Sasuke Uchiha', 'accepted', @no_pork_id);

-- Wedding 10: Gaara & Matsuri (95 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding10_id, 'Matsuri', 'accepted', @none_id),
(@wedding10_id, 'Gaara', 'pending', @none_id),
(@wedding10_id, 'Naruto Uzumaki', 'accepted', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding10_id, 'Kankuro', 'accepted', @halal_id),
(@wedding10_id, 'Temari', 'pending', @halal_id),
(@wedding10_id, 'Baki', 'accepted', @halal_id),
(@wedding10_id, 'Yashamaru', 'declined', @halal_id),
(@wedding10_id, 'Rasa', 'accepted', @halal_id),
(@wedding10_id, 'Shikamaru Nara', 'pending', @halal_id),
(@wedding10_id, 'Kakashi Hatake', 'accepted', @halal_id),
(@wedding10_id, 'Shijima', 'accepted', @halal_id),
(@wedding10_id, 'Yodo', 'pending', @halal_id),
(@wedding10_id, 'Pakura', 'accepted', @halal_id),
(@wedding10_id, 'Sasori', 'declined', @halal_id),
-- 2+ restrictions (will be added via junction table)
(@wedding10_id, 'Chiyo', 'accepted', @halal_id);

-- Wedding 11: Rock Lee & Tenten (110 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - most guests have no restrictions, mixed RSVP
(@wedding11_id, 'Guy Sensei', 'accepted', @none_id),
(@wedding11_id, 'Neji Hyuga', 'pending', @none_id),
(@wedding11_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding11_id, 'Hinata Hyuga', 'declined', @none_id),
(@wedding11_id, 'Sakura Haruno', 'accepted', @none_id),
(@wedding11_id, 'Sasuke Uchiha', 'pending', @none_id),
(@wedding11_id, 'Shikamaru Nara', 'accepted', @none_id),
(@wedding11_id, 'Choji Akimichi', 'accepted', @none_id),
(@wedding11_id, 'Ino Yamanaka', 'pending', @none_id),
(@wedding11_id, 'Kiba Inuzuka', 'accepted', @none_id),
(@wedding11_id, 'Shino Aburame', 'declined', @none_id),
(@wedding11_id, 'Kakashi Hatake', 'accepted', @none_id),
(@wedding11_id, 'Rock Lee', 'pending', @none_id),
(@wedding11_id, 'Tenten', 'accepted', @none_id),
-- 1 restriction
(@wedding11_id, 'Iruka Umino', 'accepted', @vegetarian_id),
-- 2+ restrictions (will be added via junction table)
(@wedding11_id, 'Tsunade', 'pending', @none_id);

-- Wedding 12: Neji & Tenten (75 guests - at least 10 shown with varied restrictions 0-4)
INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
-- 0 restrictions (None) - mixed RSVP statuses
(@wedding12_id, 'Naruto Uzumaki', 'accepted', @none_id),
(@wedding12_id, 'Sasuke Uchiha', 'pending', @none_id),
(@wedding12_id, 'Sakura Haruno', 'declined', @none_id),
-- 1 restriction - mixed RSVP statuses
(@wedding12_id, 'Hiashi Hyuga', 'accepted', @gluten_id),
(@wedding12_id, 'Hizashi Hyuga', 'pending', @gluten_id),
(@wedding12_id, 'Hinata Hyuga', 'accepted', @gluten_id),
(@wedding12_id, 'Hanabi Hyuga', 'declined', @gluten_id),
(@wedding12_id, 'Rock Lee', 'accepted', @gluten_id),
(@wedding12_id, 'Guy Sensei', 'pending', @gluten_id),
(@wedding12_id, 'Shikamaru Nara', 'accepted', @gluten_id),
(@wedding12_id, 'Choji Akimichi', 'accepted', @gluten_id),
(@wedding12_id, 'Ino Yamanaka', 'pending', @gluten_id),
(@wedding12_id, 'Kakashi Hatake', 'accepted', @gluten_id),
(@wedding12_id, 'Tenten', 'declined', @gluten_id),
-- 2+ restrictions (will be added via junction table)
(@wedding12_id, 'Kurenai Yuhi', 'accepted', @gluten_id);

-- ============================================================================
-- STEP 6: POPULATE GUEST_RESTRICTIONS JUNCTION TABLE
-- ============================================================================
-- Note: This adds multiple restrictions (2-4) to some guests for testing
-- Guests with 0 restrictions (None) and 1 restriction are already set in main table

-- Add junction table entries for guests with 1 restriction (from main table)
INSERT INTO guest_restrictions (guest_id, restriction_id)
SELECT g.guest_id, g.restriction_id FROM guest g 
WHERE g.wedding_id IN (@wedding1_id, @wedding2_id, @wedding3_id, @wedding4_id, @wedding5_id, @wedding6_id, @wedding7_id, @wedding8_id, @wedding9_id, @wedding10_id, @wedding11_id, @wedding12_id)
AND g.restriction_id IS NOT NULL
AND g.restriction_id != @none_id
AND NOT EXISTS (
    SELECT 1 FROM guest_restrictions gr WHERE gr.guest_id = g.guest_id AND gr.restriction_id = g.restriction_id
);

-- Add multiple restrictions (2-4) to specific guests for testing
-- Wedding 1: Guests with 2-4 restrictions
INSERT INTO guest_restrictions (guest_id, restriction_id)
-- Tsunade: 3 restrictions (Peanut Allergy + Tree Nut Allergy + No Alcohol)
-- Note: Peanut Allergy is already in main table, adding 2 more via junction
SELECT g.guest_id, @tree_nut_allergy_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Tsunade'
UNION ALL
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Tsunade'
UNION ALL
-- Konohamaru: 2 restrictions (Shellfish Allergy + Seafood Allergy)
-- Note: Shellfish Allergy is already in main table, adding 1 more via junction
SELECT g.guest_id, @seafood_allergy_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Konohamaru Sarutobi'
UNION ALL
-- Shikamaru: 2 restrictions (Diabetic + Low-Sugar)
-- Note: Diabetic is already in main table, adding 1 more via junction
SELECT g.guest_id, @low_sugar_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Shikamaru Nara'
UNION ALL
-- Sakura: 3 restrictions (Low-Sugar + Low-Sodium + Diabetic-Friendly)
-- Note: Low-Sugar is already in main table, adding 2 more via junction
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Sakura Haruno'
UNION ALL
SELECT g.guest_id, @diabetic_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Sakura Haruno'
UNION ALL
-- Hiashi Hyuga: 4 restrictions (Halal + No Alcohol + No Pork + Low-Sodium)
-- Note: Halal is already in main table, adding 3 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Hiashi Hyuga'
UNION ALL
SELECT g.guest_id, @no_pork_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Hiashi Hyuga'
UNION ALL
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding1_id AND g.guest_name = 'Hiashi Hyuga'
UNION ALL
-- Wedding 2: Guests with 2-4 restrictions
-- Orochimaru: 2 restrictions (Vegan + No Alcohol)
-- Note: Vegan is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding2_id AND g.guest_name = 'Orochimaru'
UNION ALL
-- Kabuto: 3 restrictions (Vegetarian + No Alcohol + Low-Fat)
-- Note: Vegetarian is already in main table, adding 2 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding2_id AND g.guest_name = 'Kabuto Yakushi'
UNION ALL
SELECT g.guest_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Fat' LIMIT 1) FROM guest g WHERE g.wedding_id = @wedding2_id AND g.guest_name = 'Kabuto Yakushi'
UNION ALL
-- Wedding 3: Guests with 2-4 restrictions
-- Kakashi: 2 restrictions (Halal + No Alcohol)
-- Note: Halal is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding3_id AND g.guest_name = 'Kakashi Hatake'
UNION ALL
-- Wedding 4: Guests with 2-4 restrictions
-- Kurenai: 2 restrictions (Vegan + No Alcohol)
-- Note: Vegan is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Kurenai Yuhi'
UNION ALL
-- Asuma: 3 restrictions (Vegan + No Alcohol + Low-Sodium)
-- Note: Vegan is already in main table, adding 2 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Asuma Sarutobi'
UNION ALL
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Asuma Sarutobi'
UNION ALL
-- Inoichi: 4 restrictions (Vegan + No Alcohol + Low-Sugar + Low-Fat)
-- Note: Vegan is already in main table, adding 3 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Inoichi Yamanaka'
UNION ALL
SELECT g.guest_id, @low_sugar_id FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Inoichi Yamanaka'
UNION ALL
SELECT g.guest_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Fat' LIMIT 1) FROM guest g WHERE g.wedding_id = @wedding4_id AND g.guest_name = 'Inoichi Yamanaka'
UNION ALL
-- Wedding 6: Guests with 2-4 restrictions
-- Kurenai: 2 restrictions (Pescatarian + No Alcohol)
-- Note: Pescatarian is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding6_id AND g.guest_name = 'Kurenai Yuhi'
UNION ALL
-- Wedding 7: Guests with 2-4 restrictions
-- Mikoto: 2 restrictions (Kosher + No Alcohol)
-- Note: Kosher is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding7_id AND g.guest_name = 'Mikoto Uchiha'
UNION ALL
-- Biwa Juzo: 3 restrictions (Kosher + No Alcohol + Low-Sodium)
-- Note: Kosher is already in main table, adding 2 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding7_id AND g.guest_name = 'Biwa Juzo'
UNION ALL
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding7_id AND g.guest_name = 'Biwa Juzo'
UNION ALL
-- Wedding 8: Guests with 2-4 restrictions
-- Tobirama: 2 restrictions (Vegetarian + No Alcohol)
-- Note: Vegetarian is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding8_id AND g.guest_name = 'Tobirama Senju'
UNION ALL
-- Madara: 4 restrictions (Vegetarian + No Alcohol + Low-Sodium + Heart-Healthy)
-- Note: Vegetarian is already in main table, adding 3 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding8_id AND g.guest_name = 'Madara Uchiha'
UNION ALL
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding8_id AND g.guest_name = 'Madara Uchiha'
UNION ALL
SELECT g.guest_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Heart-Healthy' LIMIT 1) FROM guest g WHERE g.wedding_id = @wedding8_id AND g.guest_name = 'Madara Uchiha'
UNION ALL
-- Wedding 9: Guests with 2-4 restrictions
-- Sasuke: 2 restrictions (No Pork + Low-Sodium)
-- Note: No Pork is already in main table, adding 1 more via junction
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding9_id AND g.guest_name = 'Sasuke Uchiha'
UNION ALL
-- Wedding 10: Guests with 2-4 restrictions
-- Chiyo: 2 restrictions (Halal + No Alcohol)
-- Note: Halal is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding10_id AND g.guest_name = 'Chiyo'
UNION ALL
-- Wedding 11: Guests with 2-4 restrictions
-- Tsunade: 3 restrictions (Peanut Allergy + Tree Nut Allergy + No Alcohol)
-- Note: None is in main table, adding 3 restrictions via junction
SELECT g.guest_id, @peanut_allergy_id FROM guest g WHERE g.wedding_id = @wedding11_id AND g.guest_name = 'Tsunade'
UNION ALL
SELECT g.guest_id, @tree_nut_allergy_id FROM guest g WHERE g.wedding_id = @wedding11_id AND g.guest_name = 'Tsunade'
UNION ALL
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding11_id AND g.guest_name = 'Tsunade'
UNION ALL
-- Iruka: 2 restrictions (Vegetarian + No Alcohol)
-- Note: Vegetarian is already in main table, adding 1 more via junction
SELECT g.guest_id, @no_alcohol_id FROM guest g WHERE g.wedding_id = @wedding11_id AND g.guest_name = 'Iruka Umino'
UNION ALL
-- Wedding 12: Guests with 2-4 restrictions
-- Kurenai: 3 restrictions (Gluten Free + Low-Sugar + Diabetic-Friendly)
-- Note: Gluten is already in main table, adding 2 more via junction
SELECT g.guest_id, @low_sugar_id FROM guest g WHERE g.wedding_id = @wedding12_id AND g.guest_name = 'Kurenai Yuhi'
UNION ALL
SELECT g.guest_id, @diabetic_id FROM guest g WHERE g.wedding_id = @wedding12_id AND g.guest_name = 'Kurenai Yuhi'
UNION ALL
-- Hiashi: 4 restrictions (Gluten Free + Low-Sugar + Diabetic-Friendly + Low-Sodium)
-- Note: Gluten is already in main table, adding 3 more via junction
SELECT g.guest_id, @low_sugar_id FROM guest g WHERE g.wedding_id = @wedding12_id AND g.guest_name = 'Hiashi Hyuga'
UNION ALL
SELECT g.guest_id, @diabetic_id FROM guest g WHERE g.wedding_id = @wedding12_id AND g.guest_name = 'Hiashi Hyuga'
UNION ALL
SELECT g.guest_id, @low_sodium_id FROM guest g WHERE g.wedding_id = @wedding12_id AND g.guest_name = 'Hiashi Hyuga';

-- Add "None" restriction to guests who have no specific restrictions (0 restrictions)
INSERT INTO guest_restrictions (guest_id, restriction_id)
SELECT g.guest_id, @none_id FROM guest g 
WHERE g.wedding_id IN (@wedding1_id, @wedding2_id, @wedding3_id, @wedding4_id, @wedding5_id, @wedding6_id, @wedding7_id, @wedding8_id, @wedding9_id, @wedding10_id, @wedding11_id, @wedding12_id)
AND g.restriction_id = @none_id
AND NOT EXISTS (
    SELECT 1 FROM guest_restrictions gr WHERE gr.guest_id = g.guest_id
);

-- Add single restriction to guests who have 1 restriction (not already added via junction table above)
INSERT INTO guest_restrictions (guest_id, restriction_id)
SELECT g.guest_id, g.restriction_id FROM guest g 
WHERE g.wedding_id IN (@wedding1_id, @wedding2_id, @wedding3_id, @wedding4_id, @wedding5_id, @wedding6_id, @wedding7_id, @wedding8_id, @wedding9_id, @wedding10_id, @wedding11_id, @wedding12_id)
AND g.restriction_id IS NOT NULL
AND g.restriction_id != @none_id
AND NOT EXISTS (
    SELECT 1 FROM guest_restrictions gr WHERE gr.guest_id = g.guest_id AND gr.restriction_id = g.restriction_id
);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Weddings Created: 12
-- Total Guests Created: 150+ (at least 10 per wedding, many have 12-15)
-- 
-- Couples with Varied Restrictions (0-4 restrictions):
--   1. Naruto & Hinata - 2 restrictions: Vegetarian, No Alcohol
--   2. Sasuke & Sakura - 0 restrictions: None (flexible)
--   3. Shikamaru & Temari - 3 restrictions: Halal, No Alcohol, No Pork
--   4. Ino & Sai - 4 restrictions: Vegan, No Alcohol, Low-Sugar, Low-Fat
--   5. Choji & Karui - 0 restrictions: None (food lovers!)
--   6. Kiba & Tamaki - 1 restriction: Pescatarian
--   7. Minato & Kushina - 4 restrictions: Kosher, No Alcohol, Low-Sodium, Heart-Healthy
--   8. Hashirama & Mito - 2 restrictions: Vegetarian, No Alcohol
--   9. Asuma & Kurenai - 3 restrictions: No Pork, Low-Sodium, Diabetic-Friendly
--  10. Gaara & Matsuri - 2 restrictions: Halal, No Alcohol
--  11. Rock Lee & Tenten - 0 restrictions: None
--  12. Neji & Tenten - 4 restrictions: Gluten Free, No Alcohol, Low-Sugar, Diabetic-Friendly
--
-- Guest Restrictions Distribution (0-4 restrictions per guest):
--   - 0 restrictions (None): Many guests have no restrictions
--   - 1 restriction: Various single restrictions (Vegetarian, Vegan, Halal, Kosher, etc.)
--   - 2 restrictions: Examples include:
--     * Konohamaru: Shellfish Allergy + Seafood Allergy
--     * Shikamaru: Diabetic + Low-Sugar
--     * Orochimaru: Vegan + No Alcohol
--     * Kakashi: Halal + No Alcohol
--   - 3 restrictions: Examples include:
--     * Tsunade: Peanut Allergy + Tree Nut Allergy + No Alcohol
--     * Sakura: Low-Sugar + Low-Sodium + Diabetic-Friendly
--     * Asuma: Vegan + No Alcohol + Low-Sodium
--     * Kurenai: Gluten Free + Low-Sugar + Diabetic-Friendly
--   - 4 restrictions: Examples include:
--     * Hiashi Hyuga: Halal + No Alcohol + No Pork + Low-Sodium
--     * Inoichi Yamanaka: Vegan + No Alcohol + Low-Sugar + Low-Fat
--     * Madara Uchiha: Vegetarian + No Alcohol + Low-Sodium + Heart-Healthy
--     * Hiashi Hyuga (Wedding 12): Gluten Free + Low-Sugar + Diabetic-Friendly + Low-Sodium
--
-- All Restriction Types Included:
--   - None, Vegetarian, Vegan, Pescatarian
--   - No Pork, No Beef
--   - Lactose Intolerant, Gluten Intolerant
--   - Halal, Kosher, No Alcohol
--   - Peanut Allergy, Tree Nut Allergy, Shellfish Allergy, Seafood Allergy
--   - Dairy Allergy, Egg Allergy, Soy Allergy
--   - Diabetic-Friendly, Low-Sodium, Low-Sugar, Low-Fat, Heart-Healthy
-- ============================================================================

