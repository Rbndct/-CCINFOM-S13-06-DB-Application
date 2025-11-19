#!/bin/bash

# Database Setup Script Runner
# This script runs all database setup scripts in the correct order

echo "=========================================="
echo "Wedding Management DB - Setup Scripts"
echo "=========================================="
echo ""

# Get MySQL password
read -sp "Enter MySQL root password: " MYSQL_PASSWORD
echo ""

# Database name
DB_NAME="wedding_management_db"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Step 1/5: Setting up database schema..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < "$SCRIPT_DIR/../database/setup_database.sql"
if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create database schema"
    exit 1
fi
echo ""

echo "Step 2/5: Inserting food data and dietary restrictions..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < "$SCRIPT_DIR/01_insert_food_data.sql"
if [ $? -eq 0 ]; then
    echo "✅ Food data inserted successfully"
else
    echo "❌ Failed to insert food data"
    exit 1
fi
echo ""

echo "Step 3/5: Inserting couples..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < "$SCRIPT_DIR/02_insert_couples.sql"
if [ $? -eq 0 ]; then
    echo "✅ Couples inserted successfully"
else
    echo "❌ Failed to insert couples"
    exit 1
fi
echo ""

echo "Step 4/5: Inserting weddings and guests..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < "$SCRIPT_DIR/03_insert_weddings_and_guests.sql"
if [ $? -eq 0 ]; then
    echo "✅ Weddings and guests inserted successfully"
else
    echo "❌ Failed to insert weddings and guests"
    exit 1
fi
echo ""

echo "Step 5/5: Inserting inventory items..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < "$SCRIPT_DIR/04_insert_inventory_items.sql"
if [ $? -eq 0 ]; then
    echo "✅ Inventory items inserted successfully"
else
    echo "❌ Failed to insert inventory items"
    exit 1
fi
echo ""

echo "=========================================="
echo "✅ All setup scripts completed successfully!"
echo "=========================================="
echo ""
echo "Verifying data..."
mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" -e "
SELECT 
  (SELECT COUNT(*) FROM couple) as couples,
  (SELECT COUNT(*) FROM wedding) as weddings,
  (SELECT COUNT(*) FROM guest) as guests,
  (SELECT COUNT(*) FROM menu_item) as menu_items,
  (SELECT COUNT(*) FROM package) as packages,
  (SELECT COUNT(*) FROM dietary_restriction) as restrictions,
  (SELECT COUNT(*) FROM seating_table) as tables;
"

echo ""
echo "Setup complete! 🎉"

