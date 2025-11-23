# 📋 Database Scripts Execution Order

## ⚠️ CRITICAL: Run scripts in this EXACT order

**Share this with your groupmates!**

---

## Step-by-Step Execution Order

### **Step 1: Database Setup** (REQUIRED - Must run FIRST)
```bash
mysql -u root -p wedding_management_db < backend/database/setup_database.sql
```

**What it does:**
- Creates all database tables
- Sets up relationships and constraints
- Includes all pricing structure changes
- **⚠️ MUST be run FIRST before any other scripts**

---

### **Step 2: Food Data & Dietary Restrictions** (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/01_insert_food_data.sql
```

**What it does:**
- Inserts all dietary restrictions (including "None")
- Inserts ingredients, menu items, packages
- Creates recipe and package relationships
- **⚠️ Must run BEFORE couples/weddings scripts**

---

### **Step 3: Couples** (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/02_insert_couples.sql
```

**What it does:**
- Inserts 18+ Naruto-themed couples
- **⚠️ Must run BEFORE weddings script (weddings need couple_id)**

---

### **Step 4: Weddings and Guests** (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/03_insert_weddings_and_guests.sql
```

**What it does:**
- Creates 12 weddings with tables and guests (dates scattered between 2024-2025)
- Creates couple preferences with dietary restrictions (includes additional preferences)
- Assigns packages to tables for weddings 1-5
- Creates inventory allocations for tables
- Updates wedding costs based on package assignments
- Payment statuses include 'paid', 'pending', and 'partially_paid'
- **⚠️ Must run AFTER couples script**

---

### **Step 5: Inventory Items** (OPTIONAL - but recommended)
```bash
mysql -u root -p wedding_management_db < backend/scripts/04_insert_inventory_items.sql
```

**What it does:**
- Inserts 40+ inventory items for wedding rentals
- Furniture, linens, lighting, decorations, equipment, etc.
- **Note:** Tables are NOT included as they are auto-created via API

---

### **Step 6: Assign Additional Couple Restrictions** (OPTIONAL - for even more preferences per couple)
```bash
mysql -u root -p wedding_management_db < backend/scripts/05_assign_couple_restrictions.sql
```

**What it does:**
- Creates additional preferences (2-3) for each couple with different ceremony types
- Each preference has different dietary restrictions
- Uses `INSERT IGNORE` to prevent duplicates
- Provides couples with even more preference options for testing

**Note:** Script 03 already includes some additional preferences per couple. This script adds even more preferences for comprehensive testing scenarios.

---

## 🚀 Quick Copy-Paste (All at Once)

**For Terminal:**
```bash
mysql -u root -p wedding_management_db < backend/database/setup_database.sql
mysql -u root -p wedding_management_db < backend/scripts/01_insert_food_data.sql
mysql -u root -p wedding_management_db < backend/scripts/02_insert_couples.sql
mysql -u root -p wedding_management_db < backend/scripts/03_insert_weddings_and_guests.sql
mysql -u root -p wedding_management_db < backend/scripts/04_insert_inventory_items.sql
# Optional: mysql -u root -p wedding_management_db < backend/scripts/05_assign_couple_restrictions.sql
```

**For MySQL Command Line:**
```sql
USE wedding_management_db;
source backend/database/setup_database.sql;
source backend/scripts/01_insert_food_data.sql;
source backend/scripts/02_insert_couples.sql;
source backend/scripts/03_insert_weddings_and_guests.sql;
source backend/scripts/04_insert_inventory_items.sql;
-- Optional: source backend/scripts/05_assign_couple_restrictions.sql;
```

**Using Node.js Script (Recommended):**
```bash
cd backend
node scripts/run-all-scripts.js
```

---

## ✅ Verification After Running

Run this to verify everything worked:
```sql
SELECT 
  (SELECT COUNT(*) FROM couple) as couples,
  (SELECT COUNT(*) FROM wedding) as weddings,
  (SELECT COUNT(*) FROM guest) as guests,
  (SELECT COUNT(*) FROM menu_item) as menu_items,
  (SELECT COUNT(*) FROM package) as packages,
  (SELECT COUNT(*) FROM dietary_restriction) as restrictions,
  (SELECT COUNT(*) FROM seating_table) as tables,
  (SELECT COUNT(*) FROM inventory_items) as inventory_items;
```

**Expected Results:**
- Couples: 18+
- Weddings: 12
- Guests: 186+
- Menu Items: 40+
- Packages: 20+
- Restrictions: 26
- Tables: 100+
- Inventory Items: 40+

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "Table doesn't exist" | Run Step 1 first (`setup_database.sql`) |
| "Couple not found" | Run Step 3 before Step 4 |
| "Restriction not found" | Run Step 2 before Step 3/4 |
| "Foreign key constraint fails" | Check script execution order |
| "Column cannot be null" | Make sure prerequisite data exists |

---

## 📝 Script Naming Convention

Scripts are numbered in execution order for easy identification:
- `00_cleanup_duplicates.sql` - Cleanup utility (removes duplicates)
- `01_insert_food_data.sql` - Food data, dietary restrictions, ingredients, menu items, packages
- `02_insert_couples.sql` - Couple records
- `03_insert_weddings_and_guests.sql` - Weddings, guests, preferences, table packages, cost calculations
- `04_insert_inventory_items.sql` - Inventory items for rentals
- `05_assign_couple_restrictions.sql` - Additional multiple preferences per couple (optional)

**Script 03 includes:**
- 12 weddings with dates scattered between 2024-2025
- Payment statuses: 'paid', 'pending', and 'partially_paid'
- Table package assignments for weddings 1-5
- Cost calculations (equipment + food costs)
- Additional couple preferences for testing
- Guest restrictions using junction tables

This numbering ensures scripts are executed in the correct order when sorted alphabetically.
