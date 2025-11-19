const fs = require('fs');
const path = require('path');

// Fix couple preferences in 03_insert_weddings_and_guests.sql
const filePath = path.join(__dirname, '03_insert_weddings_and_guests.sql');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to match: INSERT INTO couple_preferences (couple_id, ceremony_type) VALUES (@var, 'Type');
const couplePrefPattern = /INSERT INTO couple_preferences \(couple_id, ceremony_type\) VALUES \((@\w+_couple_id), '([^']+)'\);/g;

content = content.replace(couplePrefPattern, (match, coupleVar, ceremonyType) => {
  const prefVar = coupleVar.replace('_couple_id', '_pref_id');
  return `INSERT INTO couple_preferences (couple_id, ceremony_type)
SELECT ${coupleVar}, '${ceremonyType}'
WHERE NOT EXISTS (
  SELECT 1 FROM couple_preferences 
  WHERE couple_id = ${coupleVar} AND ceremony_type = '${ceremonyType}'
);
SET ${prefVar} = COALESCE(
  (SELECT preference_id FROM couple_preferences WHERE couple_id = ${coupleVar} AND ceremony_type = '${ceremonyType}' LIMIT 1),
  LAST_INSERT_ID()
);`;
});

// Fix couple_preference_restrictions - convert VALUES to SELECT with WHERE NOT EXISTS
const cprPattern = /INSERT INTO couple_preference_restrictions \(preference_id, restriction_id\) VALUES\s*\((@\w+_pref_id), (@\w+_id)\)(?:,\s*\((@\w+_pref_id), (@\w+_id)\))*(?:,\s*\((@\w+_pref_id), \((SELECT[^)]+)\)\))*;/g;

// This is complex, let's do it manually for the remaining ones
// Instead, let's fix guests INSERT statements

// Pattern for guests: INSERT INTO guest (wedding_id, guest_name, rsvp_status, restriction_id) VALUES
// This is too complex to automate safely, so we'll need to do it manually

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed couple preferences in 03_insert_weddings_and_guests.sql');

