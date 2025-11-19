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
mysql -u root -p wedding_management_db < backend/scripts/insert_complete_food_data.sql
```

**What it does:**
- Inserts all dietary restrictions (including "None")
- Inserts ingredients, menu items, packages
- Creates recipe and package relationships
- **⚠️ Must run BEFORE couples/weddings scripts**

---

### **Step 3: Naruto Couples** (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_couples.sql
```

**What it does:**
- Inserts 13+ Naruto-themed couples
- **⚠️ Must run BEFORE weddings script (weddings need couple_id)**

---

### **Step 4: Naruto Weddings and Guests** (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_weddings_and_guests.sql
```

**What it does:**
- Creates 12 weddings with tables and guests
- Creates inventory allocations
- **⚠️ Must run AFTER couples script**

---

### **Step 5: Inventory Items** (OPTIONAL - but recommended)
```bash
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_inventory.sql
```

**What it does:**
- Inserts 21+ Naruto-themed inventory items
- Furniture, linens, lighting, decorations, etc.

---

### **Step 6: Assign Packages to Wedding 1** (OPTIONAL - for complete wedding data)
```bash
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_wedding1_packages.sql
```

**What it does:**
- Assigns packages to all tables for Naruto & Hinata's wedding (wedding_id = 1)
- Makes the wedding complete with appropriate package assignments
- VIP tables get premium packages, family tables get full service, friends get standard/basic

---

## 🚀 Quick Copy-Paste (All at Once)

**For Terminal:**
```bash
mysql -u root -p wedding_management_db < backend/database/setup_database.sql
mysql -u root -p wedding_management_db < backend/scripts/insert_complete_food_data.sql
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_couples.sql
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_weddings_and_guests.sql
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_inventory.sql
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_wedding1_packages.sql
```

**For MySQL Command Line:**
```sql
USE wedding_management_db;
source backend/database/setup_database.sql;
source backend/scripts/insert_complete_food_data.sql;
source backend/scripts/insert_naruto_couples.sql;
source backend/scripts/insert_naruto_weddings_and_guests.sql;
source backend/scripts/insert_naruto_inventory.sql;
source backend/scripts/insert_naruto_wedding1_packages.sql;
```

---

## ✅ Verification After Running

Run this to verify everything worked:
```sql

```

Expected:
- Couples: 13+
- Weddings: 12
- Guests: 120+
- Menu Items: 48+
- Packages: 20+
- Restrictions: 20+
- Tables: 60+

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "Table doesn't exist" | Run Step 1 first (`setup_database.sql`) |
| "Couple not found" | Run Step 3 before Step 4 |
| "Restriction not found" | Run Step 2 before Step 3/4 |
| "Foreign key constraint fails" | Check script execution order |

SELECT 
  (SELECT COUNT(*) FROM couple) as couples,
  (SELECT COUNT(*) FROM wedding) as weddings,
  (SELECT COUNT(*) FROM guest) as guests,
  (SELECT COUNT(*) FROM menu_item) as menu_items,
  (SELECT COUNT(*) FROM package) as packages,
  (SELECT COUNT(*) FROM dietary_restriction) as restrictions,
  (SELECT COUNT(*) FROM seating_table) as tables;