-- Migration: Create guest_restrictions junction table for many-to-many relationship
-- This allows guests to have multiple dietary restrictions

-- Step 1: Create the junction table
CREATE TABLE IF NOT EXISTS guest_restrictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_id INT NOT NULL,
  restriction_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guest(guest_id) ON DELETE CASCADE,
  FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id) ON DELETE CASCADE,
  UNIQUE KEY unique_guest_restriction (guest_id, restriction_id),
  INDEX idx_gr_guest_id (guest_id),
  INDEX idx_gr_restriction_id (restriction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Migrate existing data from guest.restriction_id to guest_restrictions
-- Only migrate if restriction_id is not NULL
INSERT INTO guest_restrictions (guest_id, restriction_id)
SELECT guest_id, restriction_id
FROM guest
WHERE restriction_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM guest_restrictions gr 
  WHERE gr.guest_id = guest.guest_id 
  AND gr.restriction_id = guest.restriction_id
);

-- Step 3: Make restriction_id nullable (it will remain for backward compatibility but won't be used)
-- Note: We keep the column for now to maintain backward compatibility
-- ALTER TABLE guest MODIFY COLUMN restriction_id INT NULL;

