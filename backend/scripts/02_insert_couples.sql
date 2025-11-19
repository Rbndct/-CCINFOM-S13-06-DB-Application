-- ============================================================================
-- Insert Couples
-- ============================================================================
-- This script inserts Naruto-themed couples with realistic contact information
-- ============================================================================

USE wedding_management_db;

-- Disable safe updates to allow DELETE operations
SET SQL_SAFE_UPDATES = 0;

-- Insert Naruto-themed couples (with duplicate prevention)
INSERT INTO couple (partner1_name, partner2_name, partner1_phone, partner2_phone, partner1_email, partner2_email, planner_contact)
SELECT * FROM (
  SELECT 'Naruto' as partner1_name, 'Hinata' as partner2_name, '+63 917 000 0001' as partner1_phone, '+63 917 000 0002' as partner2_phone, 'naruto.uzumaki@konoha.nin' as partner1_email, 'hinata.hyuga@konoha.nin' as partner2_email, 'wedding.planner@konoha.nin' as planner_contact
  UNION ALL SELECT 'Sasuke', 'Sakura', '+63 917 123 4567', '+63 917 123 4568', 'sasuke.uchiha@konoha.nin', 'sakura.haruno@konoha.nin', 'wedding.planner@konoha.nin'
  UNION ALL SELECT 'Shikamaru', 'Temari', '+63 917 234 5678', '+63 917 234 5679', 'shikamaru.nara@konoha.nin', 'temari.nara@sand.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Ino', 'Sai', '+63 917 345 6789', '+63 917 345 6790', 'ino.yamanaka@konoha.nin', 'sai.yamanaka@konoha.nin', 'wedding.planning@konoha.nin'
  UNION ALL SELECT 'Choji', 'Karui', '+63 917 456 7890', '+63 917 456 7891', 'choji.akimichi@konoha.nin', 'karui.akimichi@cloud.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Kiba', 'Tamaki', '+63 917 567 8901', '+63 917 567 8902', 'kiba.inuzuka@konoha.nin', 'tamaki.inuzuka@konoha.nin', 'wedding@konoha.nin'
  UNION ALL SELECT 'Minato', 'Kushina', '+63 917 678 9012', '+63 917 678 9013', 'minato.namikaze@konoha.nin', 'kushina.uzumaki@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Hashirama', 'Mito', '+63 917 789 0123', '+63 917 789 0124', 'hashirama.senju@konoha.nin', 'mito.uzumaki@konoha.nin', 'wedding.planner@konoha.nin'
  UNION ALL SELECT 'Asuma', 'Kurenai', '+63 917 890 1234', '+63 917 890 1235', 'asuma.sarutobi@konoha.nin', 'kurenai.yuuhi@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Gaara', 'Matsuri', '+63 917 901 2345', '+63 917 901 2346', 'gaara.kazekage@sand.nin', 'matsuri@sand.nin', 'wedding@sand.nin'
  UNION ALL SELECT 'Rock Lee', 'Tenten', '+63 917 012 3456', '+63 917 012 3457', 'rock.lee@konoha.nin', 'tenten@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Shino', 'Kurenai', '+63 917 123 7890', '+63 917 123 7891', 'shino.aburame@konoha.nin', 'kurenai.yuuhi2@konoha.nin', 'wedding.planning@konoha.nin'
  UNION ALL SELECT 'Neji', 'Tenten', '+63 917 234 8901', '+63 917 234 8902', 'neji.hyuga@konoha.nin', 'tenten.hyuga@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Kakashi', 'Rin', '+63 917 345 9012', '+63 917 345 9013', 'kakashi.hatake@konoha.nin', 'rin.nohara@konoha.nin', 'wedding@konoha.nin'
  UNION ALL SELECT 'Jiraiya', 'Tsunade', '+63 917 456 0123', '+63 917 456 0124', 'jiraiya@konoha.nin', 'tsunade.senju@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Boruto', 'Sarada', '+63 917 567 1234', '+63 917 567 1235', 'boruto.uzumaki@konoha.nin', 'sarada.uchiha@konoha.nin', 'wedding.planner@konoha.nin'
  UNION ALL SELECT 'Mitsuki', 'Sumire', '+63 917 678 2345', '+63 917 678 2346', 'mitsuki@konoha.nin', 'sumire.kakei@konoha.nin', 'planner@konoha.nin'
  UNION ALL SELECT 'Shikadai', 'Chocho', '+63 917 789 3456', '+63 917 789 3457', 'shikadai.nara@konoha.nin', 'chocho.akimichi@konoha.nin', 'wedding@konoha.nin'
) AS new_couples
WHERE NOT EXISTS (
  SELECT 1 FROM couple c 
  WHERE c.partner1_name = new_couples.partner1_name 
    AND c.partner2_name = new_couples.partner2_name
);

-- Old INSERT statement (replaced above):
-- INSERT INTO couple (partner1_name, partner2_name, partner1_phone, partner2_phone, partner1_email, partner2_email, planner_contact) VALUES
-- Main Canon Couple (Naruto & Hinata)
-- ('Naruto', 'Hinata', '+63 917 000 0001', '+63 917 000 0002', 'naruto.uzumaki@konoha.nin', 'hinata.hyuga@konoha.nin', 'wedding.planner@konoha.nin'),

-- ============================================================================
-- Summary
-- ============================================================================
-- Total Couples Added: 16
-- 
-- Couples Included:
--   1. Sasuke & Sakura (Canon)
--   2. Shikamaru & Temari (Canon)
--   3. Ino & Sai (Canon)
--   4. Choji & Karui (Canon)
--   5. Kiba & Tamaki (Canon)
--   6. Minato & Kushina (Historical - Naruto's parents)
--   7. Hashirama & Mito (Historical - First Hokage)
--   8. Asuma & Kurenai (Canon)
--   9. Gaara & Matsuri (Popular pairing)
--  10. Rock Lee & Tenten (Popular pairing)
--  11. Shino & Kurenai (Alternative pairing)
--  12. Neji & Tenten (Popular pairing)
--  13. Kakashi & Rin (Historical)
--  14. Jiraiya & Tsunade (Popular pairing)
--  15. Boruto & Sarada (Boruto era - next generation)
--  16. Mitsuki & Sumire (Boruto era)
--  17. Shikadai & Chocho (Boruto era)
-- 
-- All couples have:
--   - Realistic Philippine phone numbers (+63 format)
--   - Konoha/Sand/Cloud village email addresses
--   - Wedding planner contact emails
-- ============================================================================

