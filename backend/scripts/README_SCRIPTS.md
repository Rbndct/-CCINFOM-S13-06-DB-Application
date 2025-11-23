# Database Scripts Execution Guide

This guide explains the order and purpose of each SQL script in the `backend/scripts/` directory.

## Execution Order

Execute the scripts in the following **numbered order** to properly set up the database:

### 1. Database Setup (REQUIRED - Must run FIRST)
```bash
mysql -u root -p wedding_management_db < backend/database/setup_database.sql
```

**What it does:**
- Creates all database tables
- Sets up relationships and constraints
- Includes all pricing structure changes
- **⚠️ MUST be run FIRST before any other scripts**

---

### 2. 01_insert_food_data.sql (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/01_insert_food_data.sql
```

**What it does:**
- Inserts all dietary restrictions (including "None" as ID 1)
- Inserts ingredients, menu items, recipes, and packages
- Creates recipe and package relationships
- **⚠️ Must run BEFORE couples/weddings scripts**

**Important Notes:**
- The "None" restriction is automatically inserted as the first restriction (ID 1)
- This script clears and re-inserts all food-related data
- Menu items use `NULL` for no restriction, but the "None" restriction is available for guests/couples

---

### 3. 02_insert_couples.sql (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/02_insert_couples.sql
```

**What it does:**
- Inserts 18+ Naruto-themed couples with realistic contact information
- **⚠️ Must run BEFORE weddings script (weddings need couple_id)**

---

### 4. 03_insert_weddings_and_guests.sql (REQUIRED)
```bash
mysql -u root -p wedding_management_db < backend/scripts/03_insert_weddings_and_guests.sql
```

**What it does:**
- Creates 12 weddings from different Naruto couples (dates scattered between 2024-2025)
- Each wedding has at least 10-15 guests (186+ total guests)
- Creates couple preferences with varied dietary restrictions (includes additional preferences)
- Assigns packages to tables for weddings 1-5
- Creates inventory allocations for tables
- Updates wedding costs based on package assignments
- Payment statuses include 'paid', 'pending', and 'partially_paid'
- **⚠️ Must run AFTER couples script**

**Features:**
- 12 weddings with varied dates (2024-2025), venues, and costs
- 186+ guests with diverse dietary restrictions
- Proper junction table entries for guest_restrictions (uses INSERT IGNORE)
- Couple preferences with varied restrictions for testing
- Table package assignments for multiple weddings
- Cost calculations (equipment + food costs)
- Additional couple preferences for different ceremony types
- Couples have varied dietary restrictions:
  - Naruto & Hinata: Vegetarian, No Alcohol, Lactose Intolerant
  - Sasuke & Sakura: Peanut Allergy, Tree Nut Allergy
  - Shikamaru & Temari: Halal, No Alcohol, No Pork, Low-Sodium
  - Ino & Sai: Vegan, No Alcohol, Low-Sugar, Low-Fat
  - Choji & Karui: Shellfish Allergy
  - Kiba & Tamaki: Pescatarian, Seafood Allergy, Dairy Allergy
  - Minato & Kushina: Kosher, No Alcohol, Low-Sodium, Heart-Healthy
  - Hashirama & Mito: Vegetarian, No Alcohol, Gluten Intolerant
  - Asuma & Kurenai: No Pork, Low-Sodium, Diabetic-Friendly, Egg Allergy
  - Gaara & Matsuri: Halal, No Alcohol, Wheat Allergy
  - Rock Lee & Tenten: Soy Allergy, Fructose Intolerant
  - Neji & Tenten: Gluten Free, No Alcohol, Low-Sugar, Diabetic-Friendly

---

### 5. 04_insert_inventory_items.sql (OPTIONAL - but recommended)
```bash
mysql -u root -p wedding_management_db < backend/scripts/04_insert_inventory_items.sql
```

**What it does:**
- Inserts 40+ inventory items for wedding rentals
- Furniture, linens, lighting, decorations, equipment, etc.
- **Note:** Tables are NOT included as they are automatically created as inventory allocations when tables are created via the API

---

### 6. 05_assign_packages_to_wedding1.sql (OPTIONAL - for complete wedding data)
```bash
mysql -u root -p wedding_management_db < backend/scripts/05_assign_packages_to_wedding1.sql
```

**What it does:**
- Assigns packages to all tables for the first wedding (wedding_id = 1)
- Makes the wedding complete with appropriate package assignments
- VIP tables get premium packages, family tables get full service, friends get standard/basic

---

### 5. 05_assign_couple_restrictions.sql (OPTIONAL - for multiple preferences per couple)
```bash
mysql -u root -p wedding_management_db < backend/scripts/05_assign_couple_restrictions.sql
```

**What it does:**
- Creates multiple preferences (2-3) for each couple with different ceremony types
- Each preference has different dietary restrictions
- Uses `WHERE NOT EXISTS` checks so it's safe to run after other scripts
- Provides couples with multiple preference options for testing

**Note:** This is different from `03_insert_weddings_and_guests.sql` which creates one preference per couple for their specific wedding. This script adds additional preferences so couples can choose between different ceremony types.

---

## Script Details

### 01_insert_food_data.sql
- **Purpose:** Sets up all food-related data including dietary restrictions, ingredients, menu items, recipes, and packages
- **Key Feature:** Inserts "None" as the first dietary restriction (ID 1) for system use
- **Warning:** This script DELETES all existing food-related data before inserting new data

### 02_insert_couples.sql
- **Purpose:** Inserts 18+ Naruto-themed couples with realistic contact information
- **Note:** Includes Naruto & Hinata and other popular pairings

### 03_insert_weddings_and_guests.sql
- **Purpose:** Creates comprehensive test data with weddings and guests
- **Features:**
  - 12 weddings with varied dates (2024-2025), venues, and costs
  - Payment statuses: 'paid', 'pending', and 'partially_paid'
  - 186+ guests with diverse dietary restrictions
  - Proper junction table entries for guest_restrictions (uses INSERT IGNORE)
  - Couple preferences with varied restrictions for testing
  - Additional couple preferences for different ceremony types
  - Table package assignments for weddings 1-5
  - Cost calculations (equipment + food costs)
  - Inventory allocations for tables

### 04_insert_inventory_items.sql
- **Purpose:** Inserts inventory items for wedding rentals
- **Note:** Tables are auto-created via API, so they're not included here

### 05_assign_couple_restrictions.sql
- **Purpose:** Creates additional preferences per couple for different ceremony types
- **Note:** This is optional and provides even more comprehensive preference data for testing
- **Difference from script 03:** Script 03 already includes some additional preferences. This script adds even more preferences for comprehensive testing scenarios.

---

## Testing Dietary Restrictions

The scripts are designed to provide comprehensive test data for dietary restrictions:

1. **"None" Restriction:** 
   - Automatically assigned when no restrictions are provided
   - Available in the dietary_restriction table (ID 1)
   - Used by guests and couples who have no dietary restrictions

2. **Varied Restrictions:**
   - Each couple has different restriction preferences
   - Guests within each wedding have diverse restrictions
   - Includes all restriction types: Dietary, Intolerance, Religious, Allergy, Medical

3. **Junction Tables:**
   - `guest_restrictions`: Links guests to multiple restrictions
   - `couple_preference_restrictions`: Links couple preferences to multiple restrictions
   - Both tables properly populated in the scripts

---

## Quick Start

For a complete setup, run these commands in order:

**Using MySQL Command Line:**
```bash
# 1. Setup database (if not done)
mysql -u root -p wedding_management_db < backend/database/setup_database.sql

# 2. Insert food data and restrictions
mysql -u root -p wedding_management_db < backend/scripts/01_insert_food_data.sql

# 3. Insert couples
mysql -u root -p wedding_management_db < backend/scripts/02_insert_couples.sql

# 4. Insert weddings and guests
mysql -u root -p wedding_management_db < backend/scripts/03_insert_weddings_and_guests.sql

# 5. (Optional) Insert inventory
mysql -u root -p wedding_management_db < backend/scripts/04_insert_inventory_items.sql

# 6. (Optional) Assign even more preferences to couples
mysql -u root -p wedding_management_db < backend/scripts/05_assign_couple_restrictions.sql
```

**Using Node.js Script (Recommended):**
```bash
cd backend
node scripts/run-all-scripts.js
```

**Using MySQL Command Line (source):**
```sql
USE wedding_management_db;
source backend/database/setup_database.sql;
source backend/scripts/01_insert_food_data.sql;
source backend/scripts/02_insert_couples.sql;
source backend/scripts/03_insert_weddings_and_guests.sql;
source backend/scripts/04_insert_inventory_items.sql;
-- Optional: source backend/scripts/05_assign_couple_restrictions.sql;
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

## Script Naming Convention

Scripts are numbered in execution order:
- `00_cleanup_duplicates.sql` - Cleanup utility (removes duplicates)
- `01_insert_food_data.sql` - Food data, dietary restrictions, ingredients, menu items, packages
- `02_insert_couples.sql` - Couple records
- `03_insert_weddings_and_guests.sql` - Weddings, guests, preferences, table packages, cost calculations
- `04_insert_inventory_items.sql` - Inventory items for rentals
- `05_assign_couple_restrictions.sql` - Additional multiple preferences per couple (optional)

**Script 03 includes:**
- Wedding dates scattered between 2024-2025
- Payment statuses: 'paid', 'pending', and 'partially_paid'
- Table package assignments for weddings 1-5
- Cost calculations based on package assignments
- Additional couple preferences for testing

This numbering ensures scripts are executed in the correct order when sorted alphabetically.
