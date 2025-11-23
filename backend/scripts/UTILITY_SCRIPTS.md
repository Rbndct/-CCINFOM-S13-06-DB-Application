# Utility Scripts Documentation

This document explains what each utility script does and when to use them.

## Main Runner Scripts

### `run-all-scripts.js` ✅ **KEEP - Main Setup Script**
**Purpose:** Executes all SQL setup scripts in the correct order using Node.js  
**Usage:** `node scripts/run-all-scripts.js`  
**When to use:** Alternative to `run_all_setup.sh` for cross-platform compatibility

---

## Diagnostic & Maintenance Scripts

### `test-db-connection.js` ✅ **KEEP - Useful for Troubleshooting**
**Purpose:** Tests database connection and diagnoses connection issues  
**Usage:** `node scripts/test-db-connection.js`  
**When to use:** 
- When you get database connection errors
- To verify database setup is correct
- To check if MySQL server is running

**What it checks:**
- MySQL server connection
- Database existence
- Table existence
- Query execution

---

### `check-duplicates.js` ✅ **KEEP - Data Integrity Check**
**Purpose:** Checks for duplicate records across all tables  
**Usage:** `node scripts/check-duplicates.js`  
**When to use:**
- After running setup scripts to verify data integrity
- When you suspect duplicate data
- Before important operations

**What it checks:**
- Duplicate couples
- Duplicate weddings
- Duplicate guests
- Duplicate inventory items
- Duplicate preferences
- Duplicate table packages
- Duplicate inventory allocations

---

### `check-auto-increment.js` ✅ **KEEP - Debugging Tool**
**Purpose:** Checks AUTO_INCREMENT values in junction tables  
**Usage:** `node scripts/check-auto-increment.js`  
**When to use:**
- When investigating skipped IDs in junction tables
- To verify AUTO_INCREMENT is working correctly
- For debugging data insertion issues

**What it checks:**
- `table_package` AUTO_INCREMENT
- `package_menu_items` AUTO_INCREMENT
- `menu_item_restrictions` AUTO_INCREMENT
- `guest_restrictions` AUTO_INCREMENT
- `couple_preference_restrictions` AUTO_INCREMENT

---

### `update-wedding-costs.js` ⚠️ **OPTIONAL - Maintenance Script**
**Purpose:** Updates wedding costs for all existing weddings  
**Usage:** `node scripts/update-wedding-costs.js`  
**When to use:**
- After manually changing package assignments
- After bulk data updates
- To recalculate costs for all weddings

**Note:** Cost calculation is already handled in SQL scripts, but this can be useful for maintenance.

---

### `fix-duplicate-prevention.js` ❌ **DELETE - No Longer Needed**
**Purpose:** One-time script to fix SQL files (adds WHERE NOT EXISTS checks)  
**Status:** **OBSOLETE** - SQL files already use INSERT IGNORE  
**Action:** Can be safely deleted

---

## Summary

**Keep these scripts:**
- ✅ `run-all-scripts.js` - Main runner
- ✅ `test-db-connection.js` - Troubleshooting
- ✅ `check-duplicates.js` - Data integrity
- ✅ `check-auto-increment.js` - Debugging
- ⚠️ `update-wedding-costs.js` - Optional maintenance

**Delete:**
- ❌ `fix-duplicate-prevention.js` - Obsolete (already fixed SQL files)

