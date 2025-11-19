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
- Creates 12 weddings with tables and guests
- Creates inventory allocations for tables
- Creates couple preferences with dietary restrictions
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

### **Step 6: Assign Packages to Wedding 1** (OPTIONAL - for complete wedding data)
```bash
mysql -u root -p wedding_management_db < backend/scripts/05_assign_packages_to_wedding1.sql
```

**What it does:**
- Assigns packages to all tables for the first wedding (wedding_id = 1)
- Makes the wedding complete with appropriate package assignments
- VIP tables get premium packages, family tables get full service, friends get standard/basic

---

### **Step 7: Assign Couple Restrictions** (OPTIONAL - for multiple preferences per couple)
```bash
mysql -u root -p wedding_management_db < backend/scripts/06_assign_couple_restrictions.sql
```

**What it does:**
- Creates multiple preferences (2-3) for each couple with different ceremony types
- Each preference has different dietary restrictions
- Uses `WHERE NOT EXISTS` checks so it's safe to run after other scripts
- Provides couples with multiple preference options for testing

**Note:** This is different from Step 4 which creates one preference per couple for their specific wedding. This script adds additional preferences so couples can choose between different ceremony types.

---

## 🚀 Quick Copy-Paste (All at Once)

**For Terminal:**
```bash
mysql -u root -p wedding_management_db < backend/database/setup_database.sql
mysql -u root -p wedding_management_db < backend/scripts/01_insert_food_data.sql
mysql -u root -p wedding_management_db < backend/scripts/02_insert_couples.sql
mysql -u root -p wedding_management_db < backend/scripts/03_insert_weddings_and_guests.sql
mysql -u root -p wedding_management_db < backend/scripts/04_insert_inventory_items.sql
mysql -u root -p wedding_management_db < backend/scripts/05_assign_packages_to_wedding1.sql
mysql -u root -p wedding_management_db < backend/scripts/06_assign_couple_restrictions.sql
```

**For MySQL Command Line:**
```sql
USE wedding_management_db;
source backend/database/setup_database.sql;
source backend/scripts/01_insert_food_data.sql;
source backend/scripts/02_insert_couples.sql;
source backend/scripts/03_insert_weddings_and_guests.sql;
source backend/scripts/04_insert_inventory_items.sql;
source backend/scripts/05_assign_packages_to_wedding1.sql;
source backend/scripts/06_assign_couple_restrictions.sql;
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
- `01_insert_food_data.sql` - Food data and dietary restrictions
- `02_insert_couples.sql` - Couple records
- `03_insert_weddings_and_guests.sql` - Weddings, guests, and preferences
- `04_insert_inventory_items.sql` - Inventory items
- `05_assign_packages_to_wedding1.sql` - Package assignments
- `06_assign_couple_restrictions.sql` - Multiple preferences per couple

This numbering ensures scripts are executed in the correct order when sorted alphabetically.
