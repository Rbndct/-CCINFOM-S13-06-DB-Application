# Database Scripts Execution Guide

This guide explains the order and purpose of each SQL script in the `backend/scripts/` directory.

## Execution Order

Execute the scripts in the following order to properly set up the database:

### 1. Database Setup (if not already done)
```sql
-- Run the main database setup script first
source backend/database/setup_database.sql;
```

### 2. Dietary Restrictions and Food Data
```sql
-- This script inserts all dietary restrictions (including "None") and food-related data
source backend/scripts/insert_complete_food_data.sql;
```

**Important Notes:**
- The "None" restriction is automatically inserted as the first restriction (ID 1)
- This script clears and re-inserts all food-related data
- Menu items use `NULL` for no restriction, but the "None" restriction is available for guests/couples

### 3. Naruto Couples
```sql
-- Insert Naruto-themed couples
source backend/scripts/insert_naruto_couples.sql;
```

**Note:** If Naruto & Hinata don't exist, you may need to insert them manually first:
```sql
INSERT INTO couple (partner1_name, partner2_name, partner1_phone, partner2_phone, partner1_email, partner2_email, planner_contact) 
VALUES ('Naruto', 'Hinata', '+63 917 000 0001', '+63 917 000 0002', 'naruto.uzumaki@konoha.nin', 'hinata.hyuga@konoha.nin', 'planner@konoha.nin');
```

### 4. Naruto Weddings and Guests
```sql
-- Insert 12+ weddings with 10+ guests each, all with varied dietary restrictions
source backend/scripts/insert_naruto_weddings_and_guests.sql;
```

**What this script does:**
- Creates 12 weddings from different Naruto couples
- Each wedding has at least 10-15 guests (150+ total guests)
- Couples have varied dietary restrictions:
  - Naruto & Hinata: Vegetarian, No Alcohol
  - Sasuke & Sakura: None (flexible)
  - Shikamaru & Temari: Halal, No Alcohol
  - Ino & Sai: Vegan
  - Choji & Karui: None (food lovers!)
  - Kiba & Tamaki: Pescatarian
  - Minato & Kushina: Kosher
  - Hashirama & Mito: Vegetarian
  - Asuma & Kurenai: No Pork, Low-Sodium
  - Gaara & Matsuri: Halal
  - Rock Lee & Tenten: None
  - Neji & Tenten: Gluten Free
- Guests have varied restrictions including:
  - None, Vegetarian, Vegan, Pescatarian
  - No Pork, No Beef
  - Lactose Intolerant, Gluten Intolerant
  - Halal, Kosher, No Alcohol
  - Various Allergies (Peanut, Tree Nut, Shellfish, Seafood, Dairy, Egg, Soy)
  - Medical restrictions (Diabetic-Friendly, Low-Sodium, Low-Sugar)

### 5. Inventory Items (Optional)
```sql
-- Insert inventory items (excluding tables - tables are auto-created via API)
source backend/scripts/insert_inventory_items.sql;
```

**Note:** Tables are NOT included in the inventory script as they are automatically created as inventory allocations when tables are created via the API. Table inventory items are named: `"{ceremony_type} Table - {capacity} seats"` and are automatically billed.

## Script Details

### insert_complete_food_data.sql
- **Purpose:** Sets up all food-related data including dietary restrictions, ingredients, menu items, recipes, and packages
- **Key Feature:** Inserts "None" as the first dietary restriction (ID 1) for system use
- **Warning:** This script DELETES all existing food-related data before inserting new data

### insert_naruto_couples.sql
- **Purpose:** Inserts 16+ Naruto-themed couples with realistic contact information
- **Note:** Naruto & Hinata should already exist, but this adds additional couples

### insert_naruto_weddings_and_guests.sql
- **Purpose:** Creates comprehensive test data with weddings and guests
- **Features:**
  - 12 weddings with varied dates, venues, and costs
  - 150+ guests with diverse dietary restrictions
  - Proper junction table entries for guest_restrictions
  - Couple preferences with varied restrictions for testing

### insert_naruto_inventory.sql
- **Purpose:** Inserts Naruto-themed inventory items for wedding rentals

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

## Troubleshooting

### Error: "Couple not found"
- Make sure `insert_naruto_couples.sql` has been run
- Check that Naruto & Hinata exist in the database
- If they don't exist, insert them manually (see step 3 above)

### Error: "Restriction not found"
- Make sure `insert_complete_food_data.sql` has been run first
- The "None" restriction should be ID 1

### Error: "Foreign key constraint fails"
- Make sure scripts are run in the correct order
- Check that all referenced tables exist (run setup_database.sql first)

## Quick Start

For a complete setup, run these commands in order:

```bash
# 1. Setup database (if not done)
mysql -u root -p wedding_management_db < backend/database/setup_database.sql

# 2. Insert food data and restrictions
mysql -u root -p wedding_management_db < backend/scripts/insert_complete_food_data.sql

# 3. Insert couples
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_couples.sql

# 4. Insert weddings and guests
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_weddings_and_guests.sql

# 5. (Optional) Insert inventory
mysql -u root -p wedding_management_db < backend/scripts/insert_naruto_inventory.sql
```

Or using MySQL command line:

```sql
USE wedding_management_db;
source backend/database/setup_database.sql;
source backend/scripts/insert_complete_food_data.sql;
source backend/scripts/insert_naruto_couples.sql;
source backend/scripts/insert_naruto_weddings_and_guests.sql;
source backend/scripts/insert_naruto_inventory.sql;
```

