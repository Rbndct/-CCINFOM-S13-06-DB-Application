-- Migration: Add preference_id column to wedding table
-- Run this SQL script to add the preference_id foreign key column

USE wedding_management_db;

-- Check if column exists before adding (MySQL 8.0+)
-- For older MySQL versions, you may need to manually check and run ALTER TABLE

ALTER TABLE wedding 
ADD COLUMN preference_id INT NULL,
ADD CONSTRAINT fk_wedding_preference 
  FOREIGN KEY (preference_id) 
  REFERENCES couple_preferences(preference_id) 
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_wedding_preference_id ON wedding(preference_id);



