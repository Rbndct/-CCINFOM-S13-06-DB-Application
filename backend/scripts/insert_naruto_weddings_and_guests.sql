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
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@naruto_couple_id, 'Civil');
SET @naruto_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@naruto_pref_id, @vegetarian_id),
(@naruto_pref_id, @no_alcohol_id),
(@naruto_pref_id, @lactose_id);

-- Sasuke & Sakura - 2 restrictions: Peanut Allergy + Tree Nut Allergy (scattered: Allergies)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@sasuke_couple_id, 'Church');
SET @sasuke_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@sasuke_pref_id, @peanut_allergy_id),
(@sasuke_pref_id, @tree_nut_allergy_id);

-- Shikamaru & Temari - 4 restrictions: Halal + No Alcohol + No Pork + Low-Sodium (scattered: Religious, Dietary, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@shikamaru_couple_id, 'Garden');
SET @shikamaru_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@shikamaru_pref_id, @halal_id),
(@shikamaru_pref_id, @no_alcohol_id),
(@shikamaru_pref_id, @no_pork_id),
(@shikamaru_pref_id, @low_sodium_id);

-- Ino & Sai - 4 restrictions: Vegan + No Alcohol + Low-Sugar + Low-Fat (scattered: Dietary, Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@ino_couple_id, 'Beach');
SET @ino_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@ino_pref_id, @vegan_id),
(@ino_pref_id, @no_alcohol_id),
(@ino_pref_id, @low_sugar_id),
(@ino_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Low-Fat' LIMIT 1));

-- Choji & Karui - 1 restriction: Shellfish Allergy (scattered: Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@choji_couple_id, 'Outdoor');
SET @choji_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@choji_pref_id, @shellfish_allergy_id);

-- Kiba & Tamaki - 3 restrictions: Pescatarian + Seafood Allergy + Dairy Allergy (scattered: Dietary, Allergies)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@kiba_couple_id, 'Indoor');
SET @kiba_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@kiba_pref_id, @pescatarian_id),
(@kiba_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Seafood Allergy' LIMIT 1)),
(@kiba_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Dairy Allergy' LIMIT 1));

-- Minato & Kushina - 4 restrictions: Kosher + No Alcohol + Low-Sodium + Heart-Healthy (scattered: Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@minato_couple_id, 'Civil');
SET @minato_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@minato_pref_id, @kosher_id),
(@minato_pref_id, @no_alcohol_id),
(@minato_pref_id, @low_sodium_id),
(@minato_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Heart-Healthy' LIMIT 1));

-- Hashirama & Mito - 3 restrictions: Vegetarian + No Alcohol + Gluten Intolerant (scattered: Dietary, Religious, Intolerance)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@hashirama_couple_id, 'Church');
SET @hashirama_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@hashirama_pref_id, @vegetarian_id),
(@hashirama_pref_id, @no_alcohol_id),
(@hashirama_pref_id, @gluten_id);

-- Asuma & Kurenai - 4 restrictions: No Pork + Low-Sodium + Diabetic-Friendly + Egg Allergy (scattered: Dietary, Medical, Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@asuma_couple_id, 'Garden');
SET @asuma_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@asuma_pref_id, @no_pork_id),
(@asuma_pref_id, @low_sodium_id),
(@asuma_pref_id, @diabetic_id),
(@asuma_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Egg Allergy' LIMIT 1));

-- Gaara & Matsuri - 3 restrictions: Halal + No Alcohol + Wheat Allergy (scattered: Religious, Allergy)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@gaara_couple_id, 'Beach');
SET @gaara_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@gaara_pref_id, @halal_id),
(@gaara_pref_id, @no_alcohol_id),
(@gaara_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Wheat Allergy' LIMIT 1));

-- Rock Lee & Tenten - 2 restrictions: Soy Allergy + Fructose Intolerant (scattered: Allergy, Intolerance)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@rocklee_couple_id, 'Outdoor');
SET @rocklee_pref_id = LAST_INSERT_ID();
INSERT INTO couple_preference_restrictions (preference_id, restriction_id) VALUES
(@rocklee_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Soy Allergy' LIMIT 1)),
(@rocklee_pref_id, (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Fructose Intolerant' LIMIT 1));

-- Neji & Tenten - 4 restrictions: Gluten Free + No Alcohol + Low-Sugar + Diabetic-Friendly (scattered: Intolerance, Religious, Medical)
INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@neji_couple_id, 'Indoor');
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
-- STEP 7: CREATE TABLES FOR EACH WEDDING (5+ tables per wedding)
-- ============================================================================

-- Get ceremony types for each wedding from couple preferences (equal distribution: 4 Traditional, 4 Modern, 4 Outdoor)
SET @naruto_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @naruto_pref_id);
SET @sasuke_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @sasuke_pref_id);
SET @shikamaru_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @shikamaru_pref_id);
SET @ino_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @ino_pref_id);
SET @choji_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @choji_pref_id);
SET @kiba_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @kiba_pref_id);
SET @minato_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @minato_pref_id);
SET @hashirama_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @hashirama_pref_id);
SET @asuma_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @asuma_pref_id);
SET @gaara_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @gaara_pref_id);
SET @rocklee_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @rocklee_pref_id);
SET @neji_ceremony = (SELECT ceremony_type FROM couple_preferences WHERE preference_id = @neji_pref_id);

-- Wedding 1: Naruto & Hinata - 9 tables (Couple, VIP, Family, Friends categories)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding1_id, 'T-001', 'Couple', 2),
(@wedding1_id, 'T-002', 'VIP', 8),
(@wedding1_id, 'T-003', 'VIP', 6),
(@wedding1_id, 'T-004', 'Family', 10),
(@wedding1_id, 'T-005', 'Family', 10),
(@wedding1_id, 'T-006', 'Friends', 8),
(@wedding1_id, 'T-007', 'Friends', 8),
(@wedding1_id, 'T-008', 'Friends', 8),
(@wedding1_id, 'T-009', 'Friends', 8);
SET @wedding1_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 8;
SET @wedding1_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding1_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding1_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding1_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding1_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding1_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding1_table8 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding1_table9 = LAST_INSERT_ID();

-- Wedding 2: Sasuke & Sakura - 7 tables (Couple + 6 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding2_id, 'T-001', 'Couple', 2),
(@wedding2_id, 'T-002', 'VIP', 8),
(@wedding2_id, 'T-003', 'Family', 10),
(@wedding2_id, 'T-004', 'Family', 10),
(@wedding2_id, 'T-005', 'Friends', 8),
(@wedding2_id, 'T-006', 'Friends', 8),
(@wedding2_id, 'T-007', 'Friends', 8);
SET @wedding2_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding2_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding2_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding2_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding2_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding2_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding2_table7 = LAST_INSERT_ID();

-- Wedding 3: Shikamaru & Temari - 8 tables (Couple + 7 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding3_id, 'T-001', 'Couple', 2),
(@wedding3_id, 'T-002', 'VIP', 8),
(@wedding3_id, 'T-003', 'VIP', 6),
(@wedding3_id, 'T-004', 'Family', 10),
(@wedding3_id, 'T-005', 'Family', 10),
(@wedding3_id, 'T-006', 'Friends', 8),
(@wedding3_id, 'T-007', 'Friends', 8),
(@wedding3_id, 'T-008', 'Friends', 8);
SET @wedding3_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding3_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding3_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding3_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding3_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding3_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding3_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding3_table8 = LAST_INSERT_ID();

-- Wedding 4: Ino & Sai - 7 tables (Couple + 6 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding4_id, 'T-001', 'Couple', 2),
(@wedding4_id, 'T-002', 'VIP', 8),
(@wedding4_id, 'T-003', 'Family', 10),
(@wedding4_id, 'T-004', 'Family', 10),
(@wedding4_id, 'T-005', 'Friends', 8),
(@wedding4_id, 'T-006', 'Friends', 8),
(@wedding4_id, 'T-007', 'Friends', 8);
SET @wedding4_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding4_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding4_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding4_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding4_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding4_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding4_table7 = LAST_INSERT_ID();

-- Wedding 5: Choji & Karui - 11 tables (Couple + 10 others, largest wedding)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding5_id, 'T-001', 'Couple', 2),
(@wedding5_id, 'T-002', 'VIP', 8),
(@wedding5_id, 'T-003', 'VIP', 8),
(@wedding5_id, 'T-004', 'Family', 10),
(@wedding5_id, 'T-005', 'Family', 10),
(@wedding5_id, 'T-006', 'Family', 10),
(@wedding5_id, 'T-007', 'Friends', 8),
(@wedding5_id, 'T-008', 'Friends', 8),
(@wedding5_id, 'T-009', 'Friends', 8),
(@wedding5_id, 'T-010', 'Friends', 8),
(@wedding5_id, 'T-011', 'Friends', 8);
SET @wedding5_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 10;
SET @wedding5_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 9;
SET @wedding5_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 8;
SET @wedding5_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding5_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding5_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding5_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding5_table8 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding5_table9 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding5_table10 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding5_table11 = LAST_INSERT_ID();

-- Wedding 6: Kiba & Tamaki - 6 tables (Couple + 5 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding6_id, 'T-001', 'Couple', 2),
(@wedding6_id, 'T-002', 'VIP', 8),
(@wedding6_id, 'T-003', 'Family', 10),
(@wedding6_id, 'T-004', 'Friends', 8),
(@wedding6_id, 'T-005', 'Friends', 8),
(@wedding6_id, 'T-006', 'Friends', 8);
SET @wedding6_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding6_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding6_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding6_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding6_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding6_table6 = LAST_INSERT_ID();

-- Wedding 7: Minato & Kushina - 13 tables (Couple + 12 others, very large wedding)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding7_id, 'T-001', 'Couple', 2),
(@wedding7_id, 'T-002', 'VIP', 8),
(@wedding7_id, 'T-003', 'VIP', 8),
(@wedding7_id, 'T-004', 'VIP', 6),
(@wedding7_id, 'T-005', 'Family', 10),
(@wedding7_id, 'T-006', 'Family', 10),
(@wedding7_id, 'T-007', 'Family', 10),
(@wedding7_id, 'T-008', 'Family', 10),
(@wedding7_id, 'T-009', 'Friends', 8),
(@wedding7_id, 'T-010', 'Friends', 8),
(@wedding7_id, 'T-011', 'Friends', 8),
(@wedding7_id, 'T-012', 'Friends', 8),
(@wedding7_id, 'T-013', 'Friends', 8);
SET @wedding7_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 12;
SET @wedding7_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 11;
SET @wedding7_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 10;
SET @wedding7_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 9;
SET @wedding7_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 8;
SET @wedding7_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding7_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding7_table8 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding7_table9 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding7_table10 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding7_table11 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding7_table12 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding7_table13 = LAST_INSERT_ID();

-- Wedding 8: Hashirama & Mito - 11 tables (Couple + 10 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding8_id, 'T-001', 'Couple', 2),
(@wedding8_id, 'T-002', 'VIP', 8),
(@wedding8_id, 'T-003', 'VIP', 8),
(@wedding8_id, 'T-004', 'Family', 10),
(@wedding8_id, 'T-005', 'Family', 10),
(@wedding8_id, 'T-006', 'Family', 10),
(@wedding8_id, 'T-007', 'Friends', 8),
(@wedding8_id, 'T-008', 'Friends', 8),
(@wedding8_id, 'T-009', 'Friends', 8),
(@wedding8_id, 'T-010', 'Friends', 8),
(@wedding8_id, 'T-011', 'Friends', 8);
SET @wedding8_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 10;
SET @wedding8_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 9;
SET @wedding8_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 8;
SET @wedding8_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding8_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding8_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding8_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding8_table8 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding8_table9 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding8_table10 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding8_table11 = LAST_INSERT_ID();

-- Wedding 9: Asuma & Kurenai - 7 tables (Couple + 6 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding9_id, 'T-001', 'Couple', 2),
(@wedding9_id, 'T-002', 'VIP', 8),
(@wedding9_id, 'T-003', 'Family', 10),
(@wedding9_id, 'T-004', 'Family', 10),
(@wedding9_id, 'T-005', 'Friends', 8),
(@wedding9_id, 'T-006', 'Friends', 8),
(@wedding9_id, 'T-007', 'Friends', 8);
SET @wedding9_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding9_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding9_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding9_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding9_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding9_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding9_table7 = LAST_INSERT_ID();

-- Wedding 10: Gaara & Matsuri - 7 tables (Couple + 6 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding10_id, 'T-001', 'Couple', 2),
(@wedding10_id, 'T-002', 'VIP', 8),
(@wedding10_id, 'T-003', 'Family', 10),
(@wedding10_id, 'T-004', 'Family', 10),
(@wedding10_id, 'T-005', 'Friends', 8),
(@wedding10_id, 'T-006', 'Friends', 8),
(@wedding10_id, 'T-007', 'Friends', 8);
SET @wedding10_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding10_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding10_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding10_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding10_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding10_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding10_table7 = LAST_INSERT_ID();

-- Wedding 11: Rock Lee & Tenten - 8 tables (Couple + 7 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding11_id, 'T-001', 'Couple', 2),
(@wedding11_id, 'T-002', 'VIP', 8),
(@wedding11_id, 'T-003', 'VIP', 6),
(@wedding11_id, 'T-004', 'Family', 10),
(@wedding11_id, 'T-005', 'Family', 10),
(@wedding11_id, 'T-006', 'Friends', 8),
(@wedding11_id, 'T-007', 'Friends', 8),
(@wedding11_id, 'T-008', 'Friends', 8);
SET @wedding11_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 7;
SET @wedding11_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 6;
SET @wedding11_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding11_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding11_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding11_table6 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding11_table7 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding11_table8 = LAST_INSERT_ID();

-- Wedding 12: Neji & Tenten - 6 tables (Couple + 5 others)
INSERT INTO seating_table (wedding_id, table_number, table_category, capacity) VALUES
(@wedding12_id, 'T-001', 'Couple', 2),
(@wedding12_id, 'T-002', 'VIP', 8),
(@wedding12_id, 'T-003', 'Family', 10),
(@wedding12_id, 'T-004', 'Friends', 8),
(@wedding12_id, 'T-005', 'Friends', 8),
(@wedding12_id, 'T-006', 'Friends', 8);
SET @wedding12_table1 = CAST(LAST_INSERT_ID() AS SIGNED) - 5;
SET @wedding12_table2 = CAST(LAST_INSERT_ID() AS SIGNED) - 4;
SET @wedding12_table3 = CAST(LAST_INSERT_ID() AS SIGNED) - 3;
SET @wedding12_table4 = CAST(LAST_INSERT_ID() AS SIGNED) - 2;
SET @wedding12_table5 = CAST(LAST_INSERT_ID() AS SIGNED) - 1;
SET @wedding12_table6 = LAST_INSERT_ID();

-- ============================================================================
-- STEP 8: ASSIGN SOME GUESTS TO TABLES (random seating)
-- ============================================================================

-- Wedding 1: Assign guests to tables (mix of seated and unseated)
-- Note: T-001 is the Couple table (capacity 2), so we skip it and start from T-002
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding1_id AND guest_name IN ('Kakashi Hatake', 'Iruka Umino', 'Shino Aburame', 'Kurenai Yuhi', 'Guy Sensei');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding1_id AND guest_name IN ('Jiraiya', 'Hanabi Hyuga', 'Hiashi Hyuga');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding1_id AND guest_name IN ('Kiba Inuzuka', 'Shikamaru Nara', 'Sakura Haruno', 'Ino Yamanaka', 'Tenten');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding1_id AND table_number = 'T-005' LIMIT 1) WHERE wedding_id = @wedding1_id AND guest_name IN ('Sai Yamanaka', 'Tsunade', 'Konohamaru Sarutobi');

-- Wedding 2: Assign guests to tables
-- Note: @wedding2_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding2_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding2_id AND guest_name IN ('Naruto Uzumaki', 'Kakashi Hatake', 'Hinata Hyuga', 'Itachi Uchiha');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding2_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding2_id AND guest_name IN ('Fugaku Uchiha', 'Mikoto Uchiha', 'Ino Yamanaka', 'Shikamaru Nara');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding2_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding2_id AND guest_name IN ('Kiba Inuzuka', 'Shino Aburame', 'Orochimaru', 'Kabuto Yakushi');

-- Wedding 3: Assign guests to tables
-- Note: @wedding3_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding3_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding3_id AND guest_name IN ('Naruto Uzumaki', 'Hinata Hyuga', 'Ino Yamanaka', 'Kiba Inuzuka');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding3_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding3_id AND guest_name IN ('Shino Aburame', 'Gaara', 'Kankuro', 'Baki');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding3_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding3_id AND guest_name IN ('Shikaku Nara', 'Yoshino Nara', 'Kakashi Hatake');

-- Wedding 4: Assign guests to tables
-- Note: @wedding4_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding4_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding4_id AND guest_name IN ('Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Hinata Hyuga');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding4_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding4_id AND guest_name IN ('Shikamaru Nara', 'Choji Akimichi', 'Inoichi Yamanaka', 'Yamato');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding4_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding4_id AND guest_name IN ('Sai', 'Tenten', 'Rock Lee', 'Kurenai Yuhi', 'Asuma Sarutobi');

-- Wedding 5: Assign guests to tables
-- Note: @wedding5_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding5_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding5_id AND guest_name IN ('Naruto Uzumaki', 'Hinata Hyuga', 'Shikamaru Nara', 'Temari', 'Ino Yamanaka');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding5_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding5_id AND guest_name IN ('Sai Yamanaka', 'Kiba Inuzuka', 'Shino Aburame', 'Choza Akimichi', 'Chocho Akimichi');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding5_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding5_id AND guest_name IN ('Darui', 'A', 'Samui', 'Omoi', 'Kakashi Hatake');

-- Wedding 6: Assign guests to tables
-- Note: @wedding6_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding6_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding6_id AND guest_name IN ('Kakashi Hatake', 'Rock Lee', 'Tenten', 'Naruto Uzumaki');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding6_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding6_id AND guest_name IN ('Hinata Hyuga', 'Shino Aburame', 'Tsume Inuzuka', 'Hana Inuzuka', 'Akamaru');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding6_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding6_id AND guest_name IN ('Guy Sensei', 'Shikamaru Nara', 'Choji Akimichi', 'Ino Yamanaka', 'Kurenai Yuhi');

-- Wedding 7: Assign guests to tables
-- Note: @wedding7_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding7_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding7_id AND guest_name IN ('Kushina Uzumaki', 'Minato Namikaze', 'Hiruzen Sarutobi', 'Jiraiya');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding7_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding7_id AND guest_name IN ('Tsunade', 'Orochimaru', 'Fugaku Uchiha', 'Hiashi Hyuga');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding7_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding7_id AND guest_name IN ('Choza Akimichi', 'Shikaku Nara', 'Inoichi Yamanaka', 'Tsume Inuzuka');

-- Wedding 8: Assign guests to tables
-- Note: @wedding8_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding8_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding8_id AND guest_name IN ('Hashirama Senju', 'Mito Uzumaki', 'Hagoromo Otsutsuki', 'Tobirama Senju');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding8_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding8_id AND guest_name IN ('Madara Uchiha', 'Izuna Uchiha', 'Tajima Uchiha', 'Butsuma Senju');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding8_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding8_id AND guest_name IN ('Kawarama Senju', 'Itama Senju', 'Hamura Otsutsuki', 'Kaguya Otsutsuki');

-- Wedding 9: Assign guests to tables
-- Note: @wedding9_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding9_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding9_id AND guest_name IN ('Kurenai Yuhi', 'Asuma Sarutobi', 'Kakashi Hatake', 'Shikamaru Nara');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding9_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding9_id AND guest_name IN ('Choji Akimichi', 'Ino Yamanaka', 'Hiruzen Sarutobi', 'Konohamaru Sarutobi');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding9_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding9_id AND guest_name IN ('Mirai Sarutobi', 'Guy Sensei', 'Yamato', 'Iruka Umino', 'Naruto Uzumaki');

-- Wedding 10: Assign guests to tables
-- Note: @wedding10_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding10_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding10_id AND guest_name IN ('Matsuri', 'Gaara', 'Naruto Uzumaki', 'Kankuro');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding10_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding10_id AND guest_name IN ('Temari', 'Baki', 'Yashamaru', 'Rasa');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding10_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding10_id AND guest_name IN ('Shikamaru Nara', 'Kakashi Hatake', 'Shijima', 'Yodo', 'Pakura', 'Chiyo');

-- Wedding 11: Assign guests to tables
-- Note: @wedding11_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding11_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding11_id AND guest_name IN ('Guy Sensei', 'Neji Hyuga', 'Naruto Uzumaki', 'Hinata Hyuga');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding11_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding11_id AND guest_name IN ('Sakura Haruno', 'Sasuke Uchiha', 'Shikamaru Nara', 'Choji Akimichi');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding11_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding11_id AND guest_name IN ('Ino Yamanaka', 'Kiba Inuzuka', 'Shino Aburame', 'Kakashi Hatake', 'Rock Lee');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding11_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding11_id AND guest_name IN ('Tenten', 'Iruka Umino', 'Tsunade');

-- Wedding 12: Assign guests to tables
-- Note: @wedding12_table1 is the Couple table (capacity 2), so we skip it and start from table2
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding12_id AND table_number = 'T-002' LIMIT 1) WHERE wedding_id = @wedding12_id AND guest_name IN ('Naruto Uzumaki', 'Sasuke Uchiha', 'Hiashi Hyuga', 'Hizashi Hyuga');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding12_id AND table_number = 'T-003' LIMIT 1) WHERE wedding_id = @wedding12_id AND guest_name IN ('Hinata Hyuga', 'Hanabi Hyuga', 'Rock Lee', 'Guy Sensei');
UPDATE guest SET table_id = (SELECT table_id FROM seating_table WHERE wedding_id = @wedding12_id AND table_number = 'T-004' LIMIT 1) WHERE wedding_id = @wedding12_id AND guest_name IN ('Shikamaru Nara', 'Choji Akimichi', 'Ino Yamanaka', 'Kakashi Hatake', 'Kurenai Yuhi');

-- ============================================================================
-- STEP 9: UPDATE GUEST RSVP STATUS TO BE RANDOM AND COVER ALL TEST CASES
-- ============================================================================
-- Randomize RSVP statuses to cover all scenarios: accepted, pending, declined
-- This ensures comprehensive testing of RSVP functionality

-- Wedding 1: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Kakashi Hatake', 'Sasuke Uchiha', 'Rock Lee', 'Iruka Umino', 'Kurenai Yuhi', 'Guy Sensei', 'Hanabi Hyuga', 'Hiashi Hyuga', 'Shikamaru Nara', 'Ino Yamanaka', 'Tenten', 'Tsunade', 'Konohamaru Sarutobi') THEN 'accepted'
    WHEN guest_name IN ('Choji Akimichi', 'Shino Aburame', 'Jiraiya', 'Sakura Haruno', 'Sai Yamanaka') THEN 'pending'
    WHEN guest_name IN ('Neji Hyuga', 'Kiba Inuzuka') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding1_id;

-- Wedding 2: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Naruto Uzumaki', 'Choji Akimichi', 'Tenten', 'Hinata Hyuga', 'Fugaku Uchiha', 'Mikoto Uchiha', 'Shikamaru Nara', 'Shino Aburame', 'Orochimaru') THEN 'accepted'
    WHEN guest_name IN ('Kakashi Hatake', 'Itachi Uchiha', 'Ino Yamanaka', 'Kabuto Yakushi') THEN 'pending'
    WHEN guest_name IN ('Rock Lee', 'Kiba Inuzuka') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding2_id;

-- Wedding 3: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Naruto Uzumaki', 'Choji Akimichi', 'Rock Lee', 'Hinata Hyuga', 'Kiba Inuzuka', 'Shino Aburame', 'Gaara', 'Kankuro', 'Baki', 'Yoshino Nara', 'Kakashi Hatake') THEN 'accepted'
    WHEN guest_name IN ('Ino Yamanaka') THEN 'pending'
    WHEN guest_name IN ('Tenten', 'Shikaku Nara') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding3_id;

-- Wedding 4: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Naruto Uzumaki', 'Kakashi Hatake', 'Sakura Haruno', 'Shikamaru Nara', 'Inoichi Yamanaka', 'Sai', 'Tenten', 'Kurenai Yuhi', 'Asuma Sarutobi') THEN 'accepted'
    WHEN guest_name IN ('Sasuke Uchiha', 'Hinata Hyuga', 'Yamato', 'Rock Lee') THEN 'pending'
    WHEN guest_name IN ('Choji Akimichi') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding4_id;

-- Wedding 5: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Naruto Uzumaki', 'Shikamaru Nara', 'Ino Yamanaka', 'Kiba Inuzuka', 'Shino Aburame', 'Choza Akimichi', 'Chocho Akimichi', 'A', 'Omoi', 'Kakashi Hatake') THEN 'accepted'
    WHEN guest_name IN ('Hinata Hyuga', 'Sai Yamanaka', 'Samui') THEN 'pending'
    WHEN guest_name IN ('Temari', 'Darui') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding5_id;

-- Wedding 6: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Kakashi Hatake', 'Rock Lee', 'Tenten', 'Naruto Uzumaki', 'Hinata Hyuga', 'Shino Aburame', 'Tsume Inuzuka', 'Hana Inuzuka', 'Guy Sensei', 'Shikamaru Nara', 'Ino Yamanaka', 'Kurenai Yuhi') THEN 'accepted'
    WHEN guest_name IN ('Akamaru') THEN 'pending'
    WHEN guest_name IN ('Choji Akimichi') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding6_id;

-- Wedding 7: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Kushina Uzumaki', 'Minato Namikaze', 'Hiruzen Sarutobi', 'Tsunade', 'Fugaku Uchiha', 'Hiashi Hyuga', 'Choza Akimichi', 'Shikaku Nara', 'Inoichi Yamanaka', 'Tsume Inuzuka', 'Koharu Utatane', 'Mikoto Uchiha', 'Biwa Juzo') THEN 'accepted'
    WHEN guest_name IN ('Jiraiya', 'Homura Mitokado') THEN 'pending'
    WHEN guest_name IN ('Orochimaru', 'Danzo Shimura') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding7_id;

-- Wedding 8: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Hashirama Senju', 'Mito Uzumaki', 'Hagoromo Otsutsuki', 'Tobirama Senju', 'Izuna Uchiha', 'Butsuma Senju', 'Kawarama Senju', 'Itama Senju', 'Hamura Otsutsuki', 'Asura Otsutsuki', 'Black Zetsu') THEN 'accepted'
    WHEN guest_name IN ('Madara Uchiha', 'Kaguya Otsutsuki') THEN 'pending'
    WHEN guest_name IN ('Tajima Uchiha', 'Indra Otsutsuki') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding8_id;

-- Wedding 9: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Kurenai Yuhi', 'Asuma Sarutobi', 'Kakashi Hatake', 'Shikamaru Nara', 'Choji Akimichi', 'Ino Yamanaka', 'Konohamaru Sarutobi', 'Mirai Sarutobi', 'Guy Sensei', 'Yamato', 'Iruka Umino', 'Naruto Uzumaki', 'Sasuke Uchiha') THEN 'accepted'
    WHEN guest_name IN ('Hiruzen Sarutobi') THEN 'pending'
    WHEN guest_name IN ('Sakura Haruno') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding9_id;

-- Wedding 10: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Matsuri', 'Gaara', 'Naruto Uzumaki', 'Kankuro', 'Temari', 'Baki', 'Rasa', 'Shikamaru Nara', 'Kakashi Hatake', 'Shijima', 'Yodo', 'Pakura', 'Chiyo') THEN 'accepted'
    WHEN guest_name IN ('Yashamaru') THEN 'pending'
    WHEN guest_name IN ('Sasori') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding10_id;

-- Wedding 11: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Guy Sensei', 'Neji Hyuga', 'Naruto Uzumaki', 'Hinata Hyuga', 'Sakura Haruno', 'Sasuke Uchiha', 'Shikamaru Nara', 'Choji Akimichi', 'Ino Yamanaka', 'Kiba Inuzuka', 'Shino Aburame', 'Kakashi Hatake', 'Rock Lee', 'Tenten', 'Iruka Umino') THEN 'accepted'
    WHEN guest_name IN ('Tsunade') THEN 'pending'
    ELSE rsvp_status
END WHERE wedding_id = @wedding11_id;

-- Wedding 12: Mix of all RSVP statuses
UPDATE guest SET rsvp_status = CASE 
    WHEN guest_name IN ('Naruto Uzumaki', 'Sasuke Uchiha', 'Hiashi Hyuga', 'Hizashi Hyuga', 'Hinata Hyuga', 'Rock Lee', 'Guy Sensei', 'Shikamaru Nara', 'Choji Akimichi', 'Ino Yamanaka', 'Kakashi Hatake', 'Kurenai Yuhi') THEN 'accepted'
    WHEN guest_name IN ('Hanabi Hyuga') THEN 'pending'
    WHEN guest_name IN ('Sakura Haruno', 'Tenten') THEN 'declined'
    ELSE rsvp_status
END WHERE wedding_id = @wedding12_id;

-- ============================================================================
-- STEP 10: CREATE INVENTORY ALLOCATION FOR TABLES
-- ============================================================================
-- Note: Tables are inventory items. We need to create inventory allocations
-- for each table based on the ceremony type and table capacity.
-- The rental cost formula: Base 300 PHP + (capacity * 25 PHP per seat)

-- Helper function to get or create inventory item and return its ID
-- We'll create inventory items if they don't exist, then create allocations

-- Create inventory items for generic seating tables (capacity-based only)
INSERT IGNORE INTO inventory_items (item_name, category, item_condition, quantity_available, unit_rental_cost, rental_cost) VALUES
('Seating Table - 2 seats', 'Furniture', 'Excellent', 999, 350.00, 350.00),
('Seating Table - 6 seats', 'Furniture', 'Excellent', 999, 450.00, 450.00),
('Seating Table - 8 seats', 'Furniture', 'Excellent', 999, 500.00, 500.00),
('Seating Table - 10 seats', 'Furniture', 'Excellent', 999, 550.00, 550.00);

-- Get inventory item IDs
SET @table_2_id = (SELECT inventory_id FROM inventory_items WHERE item_name = 'Seating Table - 2 seats' LIMIT 1);
SET @table_6_id = (SELECT inventory_id FROM inventory_items WHERE item_name = 'Seating Table - 6 seats' LIMIT 1);
SET @table_8_id = (SELECT inventory_id FROM inventory_items WHERE item_name = 'Seating Table - 8 seats' LIMIT 1);
SET @table_10_id = (SELECT inventory_id FROM inventory_items WHERE item_name = 'Seating Table - 10 seats' LIMIT 1);

-- Create inventory allocations for each table
-- Wedding 1 (Civil): 9 tables (1x2 Couple, 1x6 VIP, 1x8 VIP, 2x10 Family, 4x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding1_id, @table_2_id, 1, 350.00, 350.00),
(@wedding1_id, @table_6_id, 1, 450.00, 450.00),
(@wedding1_id, @table_8_id, 5, 500.00, 2500.00),
(@wedding1_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 2 (Church): 7 tables (1x2 Couple, 1x8 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding2_id, @table_2_id, 1, 350.00, 350.00),
(@wedding2_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding2_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 3 (Garden): 8 tables (1x2 Couple, 1x8 VIP, 1x6 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding3_id, @table_2_id, 1, 350.00, 350.00),
(@wedding3_id, @table_6_id, 1, 450.00, 450.00),
(@wedding3_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding3_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 4 (Beach): 7 tables (1x2 Couple, 1x8 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding4_id, @table_2_id, 1, 350.00, 350.00),
(@wedding4_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding4_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 5 (Outdoor): 11 tables (1x2 Couple, 2x8 VIP, 3x10 Family, 5x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding5_id, @table_2_id, 1, 350.00, 350.00),
(@wedding5_id, @table_8_id, 7, 500.00, 3500.00),
(@wedding5_id, @table_10_id, 3, 550.00, 1650.00);

-- Wedding 6 (Indoor): 6 tables (1x2 Couple, 1x8 VIP, 1x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding6_id, @table_2_id, 1, 350.00, 350.00),
(@wedding6_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding6_id, @table_10_id, 1, 550.00, 550.00);

-- Wedding 7 (Civil): 13 tables (1x2 Couple, 2x8 VIP, 1x6 VIP, 4x10 Family, 5x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding7_id, @table_2_id, 1, 350.00, 350.00),
(@wedding7_id, @table_6_id, 1, 450.00, 450.00),
(@wedding7_id, @table_8_id, 7, 500.00, 3500.00),
(@wedding7_id, @table_10_id, 4, 550.00, 2200.00);

-- Wedding 8 (Church): 11 tables (1x2 Couple, 2x8 VIP, 3x10 Family, 5x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding8_id, @table_2_id, 1, 350.00, 350.00),
(@wedding8_id, @table_8_id, 7, 500.00, 3500.00),
(@wedding8_id, @table_10_id, 3, 550.00, 1650.00);

-- Wedding 9 (Garden): 7 tables (1x2 Couple, 1x8 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding9_id, @table_2_id, 1, 350.00, 350.00),
(@wedding9_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding9_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 10 (Beach): 7 tables (1x2 Couple, 1x8 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding10_id, @table_2_id, 1, 350.00, 350.00),
(@wedding10_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding10_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 11 (Outdoor): 8 tables (1x2 Couple, 1x8 VIP, 1x6 VIP, 2x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding11_id, @table_2_id, 1, 350.00, 350.00),
(@wedding11_id, @table_6_id, 1, 450.00, 450.00),
(@wedding11_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding11_id, @table_10_id, 2, 550.00, 1100.00);

-- Wedding 12 (Indoor): 6 tables (1x2 Couple, 1x8 VIP, 1x10 Family, 3x8 Friends)
INSERT INTO inventory_allocation (wedding_id, inventory_id, quantity_used, unit_rental_cost, rental_cost) VALUES
(@wedding12_id, @table_2_id, 1, 350.00, 350.00),
(@wedding12_id, @table_8_id, 4, 500.00, 2000.00),
(@wedding12_id, @table_10_id, 1, 550.00, 550.00);

-- ============================================================================
-- ADDITIONAL NARUTO-THEMED INVENTORY ITEMS
-- ============================================================================
-- Add at least 10 Naruto-themed inventory items for furniture, decorations, and equipment

INSERT IGNORE INTO inventory_items (item_name, category, item_condition, quantity_available, unit_rental_cost, rental_cost) VALUES
-- Furniture & Seating
('Konoha Village Archway', 'Decoration', 'Excellent', 50, 2500.00, 2500.00),
('Uchiha Clan Banner Set', 'Decoration', 'Excellent', 30, 800.00, 800.00),
('Hokage Monument Replica', 'Decoration', 'Excellent', 20, 3500.00, 3500.00),
('Ninja Scroll Backdrop', 'Decoration', 'Excellent', 40, 1200.00, 1200.00),
('Sakura Petal Centerpiece', 'Decoration', 'Excellent', 100, 150.00, 150.00),

-- Equipment & Lighting
('Rasengan LED Light Display', 'Equipment', 'Excellent', 25, 1800.00, 1800.00),
('Sharingan Projector', 'Equipment', 'Excellent', 15, 2200.00, 2200.00),
('Chakra Glow String Lights', 'Equipment', 'Excellent', 60, 450.00, 450.00),
('Ninja Tool Display Stand', 'Furniture', 'Excellent', 35, 600.00, 600.00),
('Kunai & Shuriken Decorative Set', 'Decoration', 'Excellent', 50, 300.00, 300.00),

-- Additional Items
('Akatsuki Cloud Table Runner', 'Decoration', 'Excellent', 80, 200.00, 200.00),
('Tailed Beast Plush Set', 'Decoration', 'Excellent', 12, 500.00, 500.00),
('Ninja Headband Collection', 'Decoration', 'Excellent', 100, 100.00, 100.00),
('Sage Mode Photo Booth Props', 'Equipment', 'Excellent', 20, 900.00, 900.00),
('Hidden Leaf Village Map Backdrop', 'Decoration', 'Excellent', 30, 1500.00, 1500.00);

-- ============================================================================
-- SUMMARY UPDATED
-- ============================================================================

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

