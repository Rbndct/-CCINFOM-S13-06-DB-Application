# Test Cases for CRUD Operations - Rbee Wedding

## Prerequisites
- Base URL: `http://localhost:3001`
- Couple ID: (You'll need to create or get an existing couple ID)
- Dietary Restriction IDs: (Check available restrictions, typically: 1=None, 2=Vegetarian, 3=Vegan, etc.)

---

## 1. WEDDING CRUD

### CREATE Wedding (POST)
**Endpoint:** `POST /api/weddings`

**Request Body:**
```json
{
  "couple_id": 1,
  "wedding_date": "2025-12-31",
  "wedding_time": "11:00:00",
  "venue": "Makati",
  "guest_count": 50,
  "equipment_rental_cost": 5000.00,
  "food_cost": 15000.00,
  "total_cost": 20000.00,
  "payment_status": "pending",
  "preference_id": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wedding created successfully",
  "data": {
    "wedding_id": 1,
    "couple_id": 1,
    "wedding_date": "2025-12-31",
    "wedding_time": "11:00:00",
    "venue": "Makati",
    "payment_status": "pending",
    ...
  }
}
```

**Save the `wedding_id` from response for next steps!**

---

### READ Wedding (GET)
**Endpoint:** `GET /api/weddings/:id`

**Example:**
```
GET /api/weddings/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "wedding_id": 1,
    "couple_id": 1,
    "wedding_date": "2025-12-31",
    "wedding_time": "11:00:00",
    "venue": "Makati",
    "payment_status": "pending",
    ...
  }
}
```

---

### UPDATE Wedding (PUT)
**Endpoint:** `PUT /api/weddings/:id`

**Request Body:**
```json
{
  "wedding_date": "2025-12-31",
  "wedding_time": "11:00:00",
  "venue": "Makati City",
  "payment_status": "partial",
  "guest_count": 55,
  "equipment_rental_cost": 5500.00,
  "food_cost": 16000.00,
  "total_cost": 21500.00
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wedding updated successfully"
}
```

---

### DELETE Wedding (DELETE)
**Endpoint:** `DELETE /api/weddings/:id`

**Example:**
```
DELETE /api/weddings/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wedding deleted successfully"
}
```

---

## 2. GUEST CRUD

### CREATE Guest (POST)
**Endpoint:** `POST /api/guests`

**Request Body (with dietary restrictions):**
```json
{
  "guest_name": "John Doe",
  "wedding_id": 1,
  "rsvp_status": "confirmed",
  "table_id": null,
  "restriction_ids": [2, 3]
}
```

**Request Body (without restrictions - will auto-assign "None"):**
```json
{
  "guest_name": "Jane Smith",
  "wedding_id": 1,
  "rsvp_status": "pending",
  "table_id": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest created successfully",
  "data": {
    "guest_id": 1,
    "guest_name": "John Doe",
    "wedding_id": 1,
    "rsvp_status": "confirmed",
    "table_id": null,
    "restriction_ids": [2, 3]
  }
}
```

**Save the `guest_id` from response!**

---

### READ Guest (GET)
**Endpoint:** `GET /api/guests/:id`

**Example:**
```
GET /api/guests/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "guest_id": 1,
    "guest_name": "John Doe",
    "wedding_id": 1,
    "rsvp_status": "confirmed",
    "table_id": 1,
    "dietaryRestrictions": [
      {
        "restriction_id": 2,
        "restriction_name": "Vegetarian",
        "restriction_type": "Dietary",
        "severity_level": "Moderate"
      },
      {
        "restriction_id": 3,
        "restriction_name": "Vegan",
        "restriction_type": "Dietary",
        "severity_level": "Moderate"
      }
    ]
  }
}
```

---

### UPDATE Guest (PUT)
**Endpoint:** `PUT /api/guests/:id`

**Request Body (update restrictions):**
```json
{
  "guest_name": "John Doe Updated",
  "rsvp_status": "confirmed",
  "table_id": 1,
  "restriction_ids": [2]
}
```

**Request Body (remove all restrictions - set to empty array):**
```json
{
  "guest_name": "John Doe",
  "rsvp_status": "confirmed",
  "table_id": 1,
  "restriction_ids": []
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest updated successfully"
}
```

---

### DELETE Guest (DELETE)
**Endpoint:** `DELETE /api/guests/:id`

**Example:**
```
DELETE /api/guests/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest deleted successfully"
}
```

---

## 3. GUEST_RESTRICTIONS (Junction Table)

### CREATE Guest Restrictions
**Note:** Guest restrictions are created automatically when creating/updating a guest with `restriction_ids` array.

**When creating a guest:**
```json
POST /api/guests
{
  "guest_name": "Alice Johnson",
  "wedding_id": 1,
  "restriction_ids": [2, 4, 5]
}
```

**When updating a guest:**
```json
PUT /api/guests/1
{
  "restriction_ids": [2, 4, 5]
}
```

**To verify restrictions were created:**
```
GET /api/guests/1
```
Check the `dietaryRestrictions` array in the response.

---

### READ Guest Restrictions
**Endpoint:** `GET /api/guests/:id`

The restrictions are included in the guest response under `dietaryRestrictions`.

---

### UPDATE Guest Restrictions
**Endpoint:** `PUT /api/guests/:id`

Update by providing new `restriction_ids` array:
```json
{
  "restriction_ids": [3, 6]
}
```

This will:
1. Delete all existing restrictions for the guest
2. Insert new restrictions

---

### DELETE Guest Restrictions
**To remove all restrictions:**
```json
PUT /api/guests/:id
{
  "restriction_ids": []
}
```

**To remove specific restrictions, update with remaining ones:**
```json
PUT /api/guests/:id
{
  "restriction_ids": [2]
}
```
(Removes all except restriction_id 2)

---

## 4. SEATING_TABLE CRUD

### CREATE Couple Table (POST)
**Endpoint:** `POST /api/tables/seating/:wedding_id/couple`

**Request Body:**
```json
{
  "capacity": 2
}
```

**Example:**
```
POST /api/tables/seating/1/couple
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Couple table created",
  "data": {
    "table_id": 1,
    "wedding_id": 1,
    "table_number": "T-001",
    "table_category": "couple",
    "capacity": 2
  }
}
```

**Save the `table_id` from response!**

---

### CREATE Guest Table (POST)
**Endpoint:** `POST /api/tables/seating/:wedding_id/guest`

**Request Body:**
```json
{
  "capacity": 8,
  "table_category": "Family"
}
```

**Valid table_category values:** `"VIP"`, `"Family"`, `"Friends"`, `"Others"`, or omit for default

**Example:**
```
POST /api/tables/seating/1/guest
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Table created",
  "data": {
    "table_id": 2,
    "wedding_id": 1,
    "table_number": "T-002",
    "table_category": "Family",
    "capacity": 8
  }
}
```

---

### READ Table (GET)
**Endpoint:** `GET /api/tables/seating/:wedding_id`

**Example:**
```
GET /api/tables/seating/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "table_id": 1,
      "table_number": "T-001",
      "table_category": "couple",
      "capacity": 2,
      "wedding_id": 1,
      "guests": []
    },
    {
      "table_id": 2,
      "table_number": "T-002",
      "table_category": "Family",
      "capacity": 8,
      "wedding_id": 1,
      "guests": [...]
    }
  ]
}
```

---

### UPDATE Table (PUT)
**Endpoint:** `PUT /api/tables/seating/:table_id`

**Request Body:**
```json
{
  "table_number": "T-001-UPDATED",
  "table_category": "VIP",
  "capacity": 10
}
```

**Example:**
```
PUT /api/tables/seating/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Table updated successfully"
}
```

---

### DELETE Table (DELETE)
**Endpoint:** `DELETE /api/tables/seating/:table_id`

**Example:**
```
DELETE /api/tables/seating/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Table deleted successfully"
}
```

---

## 5. TABLE_PACKAGE (Assignment) CRUD

### CREATE Table-Package Assignment (POST)
**Endpoint:** `POST /api/packages/assign`

**Request Body:**
```json
{
  "table_id": 1,
  "package_id": 1
}
```

**Example:**
```
POST /api/packages/assign
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Package assigned to table successfully",
  "data": {
    "assignment_id": 1,
    "table_id": 1,
    "package_id": 1
  }
}
```

**Note:** You can assign multiple packages to the same table.

---

### READ Table-Package Assignments (GET)
**Endpoint:** `GET /api/packages/assignments/:wedding_id`

**Example:**
```
GET /api/packages/assignments/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "tableId": 1,
      "tableNumber": "T-001",
      "tableCategory": "couple",
      "packageId": 1,
      "packageName": "Premium Package",
      "packageType": "premium",
      "selling_price": 5000.00
    }
  ]
}
```

---

### DELETE Table-Package Assignment (DELETE)
**Endpoint:** `DELETE /api/packages/assign/:assignment_id`

**Example:**
```
DELETE /api/packages/assign/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Package assignment removed successfully"
}
```

**Note:** There's typically no UPDATE for table-package assignments. To change, delete and create a new one.

---

## Complete Test Flow Example

### Step 1: Create Wedding
```bash
POST /api/weddings
{
  "couple_id": 1,
  "wedding_date": "2025-12-31",
  "wedding_time": "11:00:00",
  "venue": "Makati",
  "payment_status": "pending"
}
# Save wedding_id = 1
```

### Step 2: Create Tables
```bash
# Create couple table
POST /api/tables/seating/1/couple
{
  "capacity": 2
}
# Save table_id = 1

# Create guest table
POST /api/tables/seating/1/guest
{
  "capacity": 8,
  "table_category": "Family"
}
# Save table_id = 2
```

### Step 3: Create Guests
```bash
# Guest with restrictions
POST /api/guests
{
  "guest_name": "John Doe",
  "wedding_id": 1,
  "rsvp_status": "confirmed",
  "table_id": 2,
  "restriction_ids": [2, 3]
}
# Save guest_id = 1

# Guest without restrictions
POST /api/guests
{
  "guest_name": "Jane Smith",
  "wedding_id": 1,
  "rsvp_status": "pending",
  "table_id": 2
}
# Save guest_id = 2
```

### Step 4: Assign Package to Table
```bash
# First, create or get a package_id (assume package_id = 1)
POST /api/packages/assign
{
  "table_id": 1,
  "package_id": 1
}
```

### Step 5: Verify Everything
```bash
# Get wedding with all details
GET /api/weddings/1

# Get all tables for wedding
GET /api/tables/seating/1

# Get all guests for wedding
GET /api/guests?wedding_id=1

# Get table-package assignments
GET /api/packages/assignments/1
```

---

## Testing Tips

1. **Test CREATE first** - Create resources in order: Wedding → Tables → Guests → Assignments
2. **Test READ after CREATE** - Verify data was saved correctly
3. **Test UPDATE** - Modify existing records
4. **Test DELETE last** - Clean up test data
5. **Test edge cases:**
   - Create guest without restrictions (should auto-assign "None")
   - Create couple table and verify it shows 2 guests even without guest records
   - Assign multiple packages to same table
   - Update guest restrictions (should replace, not append)

---

## Common Dietary Restriction IDs (Check your database)
- 1: None
- 2: Vegetarian
- 3: Vegan
- 4: Gluten-Free
- 5: Dairy-Free
- 6: Nut Allergy
- 7: Halal
- 8: Kosher
- etc.

**To get all restrictions:**
```
GET /api/dietary-restrictions
```

