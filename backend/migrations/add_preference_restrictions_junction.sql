-- Migration: Add junction table for preference-dietary restrictions (many-to-many)
-- This allows each preference to have multiple dietary restrictions

USE wedding_management_db;

-- Make restriction_id nullable in couple_preferences table (since we're using junction table now)
ALTER TABLE couple_preferences MODIFY COLUMN restriction_id INT NULL;

-- Create junction table for preference-dietary restrictions
CREATE TABLE IF NOT EXISTS preference_dietary_restrictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preference_id INT NOT NULL,
  restriction_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preference_id) REFERENCES couple_preferences(preference_id) ON DELETE CASCADE,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
  UNIQUE KEY unique_preference_restriction (preference_id, restriction_id)
);

-- Create index for better query performance
CREATE INDEX idx_pref_restriction_pref_id ON preference_dietary_restrictions(preference_id);
CREATE INDEX idx_pref_restriction_rest_id ON preference_dietary_restrictions(restriction_id);

-- Migrate existing data: For each existing preference with a restriction_id,
-- create a junction entry (if restriction_id is not null)
INSERT INTO preference_dietary_restrictions (preference_id, restriction_id)
SELECT preference_id, restriction_id
FROM couple_preferences
WHERE restriction_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM preference_dietary_restrictions pdr 
  WHERE pdr.preference_id = couple_preferences.preference_id 
  AND pdr.restriction_id = couple_preferences.restriction_id
);

SELECT 'Migration completed: preference_dietary_restrictions table created and data migrated' AS message;

