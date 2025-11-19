-- ============================================================================
-- Assign Couple Restrictions
-- ============================================================================
-- This script creates multiple preferences for each couple (2-3 preferences each)
-- for different ceremony types with Naruto-themed dietary restrictions.
-- Uses WHERE NOT EXISTS checks so it's safe to run after other scripts.
-- 
-- Purpose: Provides couples with multiple preference options for testing
-- (e.g., they can choose between Civil, Church, Garden ceremonies, each with
-- different restrictions). This is more comprehensive than the single preference
-- created per couple in 03_insert_weddings_and_guests.sql
-- ============================================================================

USE wedding_management_db;

-- ============================================================================
-- STEP 1: Add "None" dietary restriction if it doesn't exist
-- ============================================================================

INSERT INTO dietary_restriction (restriction_name, severity_level, restriction_type)
SELECT 'None', 'Low', 'Dietary'
WHERE NOT EXISTS (
    SELECT 1 FROM dietary_restriction WHERE restriction_name = 'None'
);

SET @none_restriction_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'None' LIMIT 1);

-- ============================================================================
-- STEP 2: Get restriction IDs for mapping
-- ============================================================================

SET @vegetarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Vegetarian' LIMIT 1);
SET @pescatarian_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'Pescatarian' LIMIT 1);
SET @no_pork_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Pork' LIMIT 1);
SET @no_alcohol_id = (SELECT restriction_id FROM dietary_restriction WHERE restriction_name = 'No Alcohol' LIMIT 1);

-- ============================================================================
-- STEP 3: Get couple IDs by name (dynamic lookup)
-- ============================================================================

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
SET @naruto_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Naruto' AND partner2_name = 'Hinata' LIMIT 1);
SET @kakashi_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Kakashi' AND partner2_name = 'Rin' LIMIT 1);
SET @jiraiya_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Jiraiya' AND partner2_name = 'Tsunade' LIMIT 1);
SET @boruto_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Boruto' AND partner2_name = 'Sarada' LIMIT 1);
SET @mitsuki_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Mitsuki' AND partner2_name = 'Sumire' LIMIT 1);
SET @shikadai_couple_id = (SELECT couple_id FROM couple WHERE partner1_name = 'Shikadai' AND partner2_name = 'Chocho' LIMIT 1);

-- ============================================================================
-- STEP 4: Assign Naruto-themed restrictions to each couple
-- Some couples will have multiple preferences (2-3 preferences each)
-- ============================================================================

-- ============================================================================
-- Sasuke & Sakura - Uchiha clan, medical ninja
-- ============================================================================
-- Preference 1: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @sasuke_couple_id, 'Civil'
WHERE @sasuke_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @sasuke_couple_id AND ceremony_type = 'Civil');

SET @pref_id_1a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @sasuke_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_1a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_1a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_1a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_1a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Church ceremony - Vegetarian only
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @sasuke_couple_id, 'Church'
WHERE @sasuke_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @sasuke_couple_id AND ceremony_type = 'Church');

SET @pref_id_1b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @sasuke_couple_id AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_1b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_1b AND restriction_id = @vegetarian_id
);

-- ============================================================================
-- Shikamaru & Temari - Strategic, Sand village
-- ============================================================================
-- Preference 1: Beach ceremony - Pescatarian, No Pork
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @shikamaru_couple_id, 'Beach'
WHERE @shikamaru_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @shikamaru_couple_id AND ceremony_type = 'Beach');

SET @pref_id_2a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @shikamaru_couple_id AND ceremony_type = 'Beach' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_2a, @pescatarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_2a AND restriction_id = @pescatarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_2a, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_2a AND restriction_id = @no_pork_id
);

-- Preference 2: Outdoor ceremony - Pescatarian, No Pork
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @shikamaru_couple_id, 'Outdoor'
WHERE @shikamaru_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @shikamaru_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_2b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @shikamaru_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_2b, @pescatarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_2b AND restriction_id = @pescatarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_2b, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_2b AND restriction_id = @no_pork_id
);

-- ============================================================================
-- Ino & Sai (Couple ID 3) - Yamanaka clan, Root member
-- ============================================================================
-- Preference 1: Church ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @ino_couple_id, 'Church'
WHERE @ino_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @ino_couple_id AND ceremony_type = 'Church');

SET @pref_id_3a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @ino_couple_id AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_3a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_3a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_3a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_3a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @ino_couple_id, 'Indoor'
WHERE @ino_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @ino_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_3b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @ino_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_3b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_3b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_3b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_3b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Choji & Karui (Couple ID 4) - Akimichi clan (loves food), Cloud village
-- ============================================================================
-- Preference 1: Garden ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @choji_couple_id, 'Garden'
WHERE @choji_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @choji_couple_id AND ceremony_type = 'Garden');

SET @pref_id_4a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @choji_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_4a, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_4a AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_4a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_4a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @choji_couple_id, 'Outdoor'
WHERE @choji_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @choji_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_4b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @choji_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_4b, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_4b AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_4b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_4b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Kiba & Tamaki (Couple ID 5) - Inuzuka clan (dog users)
-- ============================================================================
-- Preference 1: Outdoor ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @kiba_couple_id, 'Outdoor'
WHERE @kiba_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @kiba_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_5a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @kiba_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_5a, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_5a AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_5a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_5a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Garden ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @kiba_couple_id, 'Garden'
WHERE @kiba_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @kiba_couple_id AND ceremony_type = 'Garden');

SET @pref_id_5b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @kiba_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_5b, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_5b AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_5b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_5b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Minato & Kushina (Couple ID 6) - Fourth Hokage, Uzumaki clan
-- ============================================================================
-- Preference 1: Church ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @minato_couple_id, 'Church'
WHERE @minato_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Church');

SET @pref_id_6a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @minato_couple_id, 'Civil'
WHERE @minato_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Civil');

SET @pref_id_6b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6b AND restriction_id = @no_alcohol_id
);

-- Preference 3: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @minato_couple_id, 'Indoor'
WHERE @minato_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_6c = (SELECT preference_id FROM couple_preferences WHERE couple_id = @minato_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6c, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6c AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_6c, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_6c AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Hashirama & Mito (Couple ID 7) - First Hokage, Uzumaki clan
-- ============================================================================
-- Preference 1: Church ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @hashirama_couple_id, 'Church'
WHERE @hashirama_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @hashirama_couple_id AND ceremony_type = 'Church');

SET @pref_id_7a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @hashirama_couple_id AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_7a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_7a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_7a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_7a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @hashirama_couple_id, 'Civil'
WHERE @hashirama_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @hashirama_couple_id AND ceremony_type = 'Civil');

SET @pref_id_7b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @hashirama_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_7b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_7b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_7b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_7b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Asuma & Kurenai (Couple ID 8) - Jonin sensei, genjutsu specialist
-- ============================================================================
-- Preference 1: Indoor ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @asuma_couple_id, 'Indoor'
WHERE @asuma_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @asuma_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_8a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @asuma_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_8a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_8a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @asuma_couple_id, 'Civil'
WHERE @asuma_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @asuma_couple_id AND ceremony_type = 'Civil');

SET @pref_id_8b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @asuma_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_8b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_8b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Gaara & Matsuri (Couple ID 9) - Kazekage, Sand village
-- ============================================================================
-- Preference 1: Beach ceremony - Pescatarian, No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @gaara_couple_id, 'Beach'
WHERE @gaara_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @gaara_couple_id AND ceremony_type = 'Beach');

SET @pref_id_9a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @gaara_couple_id AND ceremony_type = 'Beach' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_9a, @pescatarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_9a AND restriction_id = @pescatarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_9a, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_9a AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_9a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_9a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - Pescatarian, No Pork
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @gaara_couple_id, 'Outdoor'
WHERE @gaara_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @gaara_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_9b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @gaara_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_9b, @pescatarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_9b AND restriction_id = @pescatarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_9b, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_9b AND restriction_id = @no_pork_id
);

-- ============================================================================
-- Rock Lee & Tenten (Couple ID 10) - Taijutsu specialist, weapons master
-- ============================================================================
-- Preference 1: Garden ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @rocklee_couple_id, 'Garden'
WHERE @rocklee_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Garden');

SET @pref_id_10a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @rocklee_couple_id, 'Outdoor'
WHERE @rocklee_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_10b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10b AND restriction_id = @no_alcohol_id
);

-- Preference 3: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @rocklee_couple_id, 'Indoor'
WHERE @rocklee_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_10c = (SELECT preference_id FROM couple_preferences WHERE couple_id = @rocklee_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10c, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10c AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_10c, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_10c AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Shino & Kurenai (Couple ID 11) - Aburame clan, genjutsu specialist
-- ============================================================================
-- Preference 1: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @neji_couple_id, 'Indoor'
WHERE @neji_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @neji_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_11a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @neji_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_11a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_11a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_11a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_11a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Garden ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @neji_couple_id, 'Garden'
WHERE @neji_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @neji_couple_id AND ceremony_type = 'Garden');

SET @pref_id_11b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @neji_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_11b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_11b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_11b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_11b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Neji & Tenten (Couple ID 12) - Hyuga clan, weapons master
-- ============================================================================
-- Preference 1: Church ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @naruto_couple_id, 'Church'
WHERE @naruto_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @naruto_couple_id AND ceremony_type = 'Church');

SET @pref_id_12a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @naruto_couple_id AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_12a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_12a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_12a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_12a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @naruto_couple_id, 'Civil'
WHERE @naruto_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @naruto_couple_id AND ceremony_type = 'Civil');

SET @pref_id_12b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @naruto_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_12b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_12b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_12b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_12b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Kakashi & Rin (Couple ID 13) - Copy ninja, medical ninja
-- ============================================================================
-- Preference 1: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @kakashi_couple_id, 'Indoor'
WHERE @kakashi_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @kakashi_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_13a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @kakashi_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_13a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_13a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_13a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_13a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @kakashi_couple_id, 'Civil'
WHERE @kakashi_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @kakashi_couple_id AND ceremony_type = 'Civil');

SET @pref_id_13b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @kakashi_couple_id AND ceremony_type = 'Civil' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_13b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_13b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_13b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_13b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Jiraiya & Tsunade (Couple ID 14) - Sannin
-- ============================================================================
-- Preference 1: Beach ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @jiraiya_couple_id, 'Beach'
WHERE @jiraiya_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @jiraiya_couple_id AND ceremony_type = 'Beach');

SET @pref_id_14a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @jiraiya_couple_id AND ceremony_type = 'Beach' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_14a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_14a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @jiraiya_couple_id, 'Outdoor'
WHERE @jiraiya_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @jiraiya_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_14b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @jiraiya_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_14b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_14b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Boruto & Sarada (Couple ID 15) - Next generation
-- ============================================================================
-- Preference 1: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @boruto_couple_id, 'Indoor'
WHERE @boruto_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @boruto_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_15a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @boruto_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_15a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_15a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_15a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_15a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Garden ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @boruto_couple_id, 'Garden'
WHERE @boruto_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @boruto_couple_id AND ceremony_type = 'Garden');

SET @pref_id_15b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @boruto_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_15b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_15b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_15b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_15b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Mitsuki & Sumire (Couple ID 16) - Synthetic human, former Root
-- ============================================================================
-- Preference 1: Garden ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @mitsuki_couple_id, 'Garden'
WHERE @mitsuki_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @mitsuki_couple_id AND ceremony_type = 'Garden');

SET @pref_id_16a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @mitsuki_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_16a, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_16a AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_16a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_16a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Indoor ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @mitsuki_couple_id, 'Indoor'
WHERE @mitsuki_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @mitsuki_couple_id AND ceremony_type = 'Indoor');

SET @pref_id_16b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @mitsuki_couple_id AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_16b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_16b AND restriction_id = @vegetarian_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_16b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_16b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- Shikadai & Chocho (Couple ID 17) - Next generation, Akimichi
-- ============================================================================
-- Preference 1: Garden ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @shikadai_couple_id, 'Garden'
WHERE @shikadai_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @shikadai_couple_id AND ceremony_type = 'Garden');

SET @pref_id_17a = (SELECT preference_id FROM couple_preferences WHERE couple_id = @shikadai_couple_id AND ceremony_type = 'Garden' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_17a, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_17a AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_17a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_17a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - No Pork, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT @shikadai_couple_id, 'Outdoor'
WHERE @shikadai_couple_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = @shikadai_couple_id AND ceremony_type = 'Outdoor');

SET @pref_id_17b = (SELECT preference_id FROM couple_preferences WHERE couple_id = @shikadai_couple_id AND ceremony_type = 'Outdoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_17b, @no_pork_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_17b AND restriction_id = @no_pork_id
);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_17b, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_17b AND restriction_id = @no_alcohol_id
);

-- ============================================================================
-- STEP 4: Ensure all couples without preferences get "None" restriction
-- ============================================================================

-- For any couples that don't have preferences yet, create one with "None"
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT c.couple_id, 'Civil'
FROM couple c
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preferences cp WHERE cp.couple_id = c.couple_id
);

-- Add "None" restriction to any preferences that don't have any restrictions
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT cp.preference_id, @none_restriction_id
FROM couple_preferences cp
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions cpr 
    WHERE cpr.preference_id = cp.preference_id
);

-- ============================================================================
-- STEP 5: Verification and Summary
-- ============================================================================

SELECT 'Dietary restrictions assignment completed!' AS Status;

SELECT 
    c.couple_id,
    CONCAT(c.partner1_name, ' & ', c.partner2_name) AS couple_name,
    cp.ceremony_type,
    GROUP_CONCAT(dr.restriction_name ORDER BY dr.restriction_name SEPARATOR ', ') AS restrictions
FROM couple c
LEFT JOIN couple_preferences cp ON c.couple_id = cp.couple_id
LEFT JOIN couple_preference_restrictions cpr ON cp.preference_id = cpr.preference_id
LEFT JOIN dietary_restriction dr ON cpr.restriction_id = dr.restriction_id
GROUP BY c.couple_id, c.partner1_name, c.partner2_name, cp.preference_id, cp.ceremony_type
ORDER BY c.couple_id, cp.preference_id;

SELECT 
    (SELECT COUNT(*) FROM couple) AS total_couples,
    (SELECT COUNT(DISTINCT couple_id) FROM couple_preferences) AS couples_with_preferences,
    (SELECT COUNT(*) FROM couple_preferences) AS total_preferences,
    (SELECT COUNT(*) FROM couple_preference_restrictions) AS total_restriction_assignments,
    (SELECT COUNT(*) FROM dietary_restriction WHERE restriction_name = 'None') AS none_restriction_exists;
