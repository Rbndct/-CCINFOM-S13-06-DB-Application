-- ============================================================================
-- Assign Naruto-Themed Dietary Restrictions to Couples
-- ============================================================================
-- This script:
-- 1. Adds a "None" dietary restriction (hidden from display)
-- 2. Creates multiple preferences for each couple with Naruto-themed restrictions
-- 3. Uses ceremony types from frontend: Civil, Church, Garden, Beach, Outdoor, Indoor
-- 4. Ensures each couple has at least one preference with restrictions
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
-- STEP 3: Assign Naruto-themed restrictions to each couple
-- Some couples will have multiple preferences (2-3 preferences each)
-- ============================================================================

-- ============================================================================
-- Sasuke & Sakura (Couple ID 1) - Uchiha clan, medical ninja
-- ============================================================================
-- Preference 1: Civil ceremony - Vegetarian, No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT 1, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 1 AND ceremony_type = 'Civil');

SET @pref_id_1a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 1 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 1, 'Church'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 1 AND ceremony_type = 'Church');

SET @pref_id_1b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 1 AND ceremony_type = 'Church' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_1b, @vegetarian_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_1b AND restriction_id = @vegetarian_id
);

-- ============================================================================
-- Shikamaru & Temari (Couple ID 2) - Strategic, Sand village
-- ============================================================================
-- Preference 1: Beach ceremony - Pescatarian, No Pork
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT 2, 'Beach'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 2 AND ceremony_type = 'Beach');

SET @pref_id_2a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 2 AND ceremony_type = 'Beach' LIMIT 1);
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
SELECT 2, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 2 AND ceremony_type = 'Outdoor');

SET @pref_id_2b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 2 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 3, 'Church'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 3 AND ceremony_type = 'Church');

SET @pref_id_3a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 3 AND ceremony_type = 'Church' LIMIT 1);
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
SELECT 3, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 3 AND ceremony_type = 'Indoor');

SET @pref_id_3b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 3 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 4, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 4 AND ceremony_type = 'Garden');

SET @pref_id_4a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 4 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 4, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 4 AND ceremony_type = 'Outdoor');

SET @pref_id_4b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 4 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 5, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 5 AND ceremony_type = 'Outdoor');

SET @pref_id_5a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 5 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 5, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 5 AND ceremony_type = 'Garden');

SET @pref_id_5b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 5 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 6, 'Church'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Church');

SET @pref_id_6a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Church' LIMIT 1);
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
SELECT 6, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Civil');

SET @pref_id_6b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 6, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Indoor');

SET @pref_id_6c = (SELECT preference_id FROM couple_preferences WHERE couple_id = 6 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 7, 'Church'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 7 AND ceremony_type = 'Church');

SET @pref_id_7a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 7 AND ceremony_type = 'Church' LIMIT 1);
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
SELECT 7, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 7 AND ceremony_type = 'Civil');

SET @pref_id_7b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 7 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 8, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 8 AND ceremony_type = 'Indoor');

SET @pref_id_8a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 8 AND ceremony_type = 'Indoor' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_8a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_8a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Civil ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT 8, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 8 AND ceremony_type = 'Civil');

SET @pref_id_8b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 8 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 9, 'Beach'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 9 AND ceremony_type = 'Beach');

SET @pref_id_9a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 9 AND ceremony_type = 'Beach' LIMIT 1);
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
SELECT 9, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 9 AND ceremony_type = 'Outdoor');

SET @pref_id_9b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 9 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 10, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Garden');

SET @pref_id_10a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 10, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Outdoor');

SET @pref_id_10b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 10, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Indoor');

SET @pref_id_10c = (SELECT preference_id FROM couple_preferences WHERE couple_id = 10 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 11, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 11 AND ceremony_type = 'Indoor');

SET @pref_id_11a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 11 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 11, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 11 AND ceremony_type = 'Garden');

SET @pref_id_11b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 11 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 12, 'Church'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 12 AND ceremony_type = 'Church');

SET @pref_id_12a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 12 AND ceremony_type = 'Church' LIMIT 1);
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
SELECT 12, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 12 AND ceremony_type = 'Civil');

SET @pref_id_12b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 12 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 13, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 13 AND ceremony_type = 'Indoor');

SET @pref_id_13a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 13 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 13, 'Civil'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 13 AND ceremony_type = 'Civil');

SET @pref_id_13b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 13 AND ceremony_type = 'Civil' LIMIT 1);
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
SELECT 14, 'Beach'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 14 AND ceremony_type = 'Beach');

SET @pref_id_14a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 14 AND ceremony_type = 'Beach' LIMIT 1);
INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
SELECT @pref_id_14a, @no_alcohol_id
WHERE NOT EXISTS (
    SELECT 1 FROM couple_preference_restrictions 
    WHERE preference_id = @pref_id_14a AND restriction_id = @no_alcohol_id
);

-- Preference 2: Outdoor ceremony - No Alcohol
INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT 14, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 14 AND ceremony_type = 'Outdoor');

SET @pref_id_14b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 14 AND ceremony_type = 'Outdoor' LIMIT 1);
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
SELECT 15, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 15 AND ceremony_type = 'Indoor');

SET @pref_id_15a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 15 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 15, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 15 AND ceremony_type = 'Garden');

SET @pref_id_15b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 15 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 16, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 16 AND ceremony_type = 'Garden');

SET @pref_id_16a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 16 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 16, 'Indoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 16 AND ceremony_type = 'Indoor');

SET @pref_id_16b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 16 AND ceremony_type = 'Indoor' LIMIT 1);
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
SELECT 17, 'Garden'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 17 AND ceremony_type = 'Garden');

SET @pref_id_17a = (SELECT preference_id FROM couple_preferences WHERE couple_id = 17 AND ceremony_type = 'Garden' LIMIT 1);
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
SELECT 17, 'Outdoor'
WHERE NOT EXISTS (SELECT 1 FROM couple_preferences WHERE couple_id = 17 AND ceremony_type = 'Outdoor');

SET @pref_id_17b = (SELECT preference_id FROM couple_preferences WHERE couple_id = 17 AND ceremony_type = 'Outdoor' LIMIT 1);
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
