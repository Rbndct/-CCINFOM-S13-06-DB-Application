-- Migration: Create junction table for couple preferences and dietary restrictions
-- This allows each preference to have multiple dietary restrictions (proper relational design)

USE wedding_management_db;

-- Step 1: Make restriction_id nullable if it exists (we won't use it anymore, using junction table)
SET @restriction_id_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'couple_preferences' 
  AND COLUMN_NAME = 'restriction_id'
);

SET @sql = IF(@restriction_id_exists > 0, 
  'ALTER TABLE couple_preferences MODIFY COLUMN restriction_id INT NULL', 
  'SELECT "Column restriction_id does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Drop restriction_ids JSON column if it exists (we're using junction table instead)
SET @restriction_ids_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'couple_preferences' 
  AND COLUMN_NAME = 'restriction_ids'
);

SET @sql2 = IF(@restriction_ids_exists > 0, 
  'ALTER TABLE couple_preferences DROP COLUMN restriction_ids', 
  'SELECT "Column restriction_ids does not exist" AS message');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Step 3: Drop old junction table if it exists (preference_dietary_restrictions)
DROP TABLE IF EXISTS preference_dietary_restrictions;

-- Step 4: Create junction table for couple_preference_restrictions
CREATE TABLE IF NOT EXISTS couple_preference_restrictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preference_id INT NOT NULL,
  restriction_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preference_id) REFERENCES couple_preferences(preference_id) ON DELETE CASCADE,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
  UNIQUE KEY unique_preference_restriction (preference_id, restriction_id)
);

-- Step 5: Create indexes for better query performance
-- Note: Indexes are created automatically with the table, but we'll add them explicitly
-- Check if indexes exist before creating (MySQL doesn't support IF NOT EXISTS for indexes)
SET @idx1_exists = (
  SELECT COUNT(*) 
  FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'couple_preference_restrictions' 
  AND INDEX_NAME = 'idx_cpr_preference_id'
);

SET @sql_idx1 = IF(@idx1_exists = 0, 
  'CREATE INDEX idx_cpr_preference_id ON couple_preference_restrictions(preference_id)', 
  'SELECT "Index idx_cpr_preference_id already exists" AS message');
PREPARE stmt_idx1 FROM @sql_idx1;
EXECUTE stmt_idx1;
DEALLOCATE PREPARE stmt_idx1;

SET @idx2_exists = (
  SELECT COUNT(*) 
  FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'couple_preference_restrictions' 
  AND INDEX_NAME = 'idx_cpr_restriction_id'
);

SET @sql_idx2 = IF(@idx2_exists = 0, 
  'CREATE INDEX idx_cpr_restriction_id ON couple_preference_restrictions(restriction_id)', 
  'SELECT "Index idx_cpr_restriction_id already exists" AS message');
PREPARE stmt_idx2 FROM @sql_idx2;
EXECUTE stmt_idx2;
DEALLOCATE PREPARE stmt_idx2;

-- Step 6: Migrate existing data from restriction_ids JSON column (if it exists)
SET @json_col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'couple_preferences' 
  AND COLUMN_NAME = 'restriction_ids'
  AND DATA_TYPE = 'json'
);

-- Migrate from JSON array if it exists
SET @sql_migrate = IF(@json_col_exists > 0,
  'INSERT INTO couple_preference_restrictions (preference_id, restriction_id)
   SELECT 
     cp.preference_id,
     JSON_UNQUOTE(JSON_EXTRACT(cp.restriction_ids, CONCAT(\'$[\', idx.n, \']\'))) AS restriction_id
   FROM couple_preferences cp
   CROSS JOIN (
     SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
     SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
   ) idx
   WHERE JSON_EXTRACT(cp.restriction_ids, CONCAT(\'$[\', idx.n, \']\')) IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM couple_preference_restrictions cpr 
     WHERE cpr.preference_id = cp.preference_id 
     AND cpr.restriction_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(cp.restriction_ids, CONCAT(\'$[\', idx.n, \']\'))) AS UNSIGNED)
   )',
  'SELECT "No restriction_ids JSON column found to migrate" AS message');
PREPARE stmt_migrate FROM @sql_migrate;
EXECUTE stmt_migrate;
DEALLOCATE PREPARE stmt_migrate;

SELECT 'Migration completed: couple_preference_restrictions junction table created and data migrated' AS message;
