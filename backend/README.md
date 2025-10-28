# Wedding System Management - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
1. Create a MySQL database named `wedding_management`
2. Copy `.env.example` to `.env` and update with your MySQL credentials
3. Run the SQL commands from `.env.example` to create tables

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will run on `http://localhost:3001`

## API Endpoints

### Test Endpoints
- `GET /test` - Test if API is running
- `GET /health` - Health check

### Weddings
- `GET /weddings` - Get all weddings
- `GET /weddings/:id` - Get single wedding
- `POST /weddings` - Create new wedding
- `PUT /weddings/:id` - Update wedding
- `DELETE /weddings/:id` - Delete wedding

### Guests
- `GET /guests` - Get all guests
- `GET /guests/:id` - Get single guest
- `POST /guests` - Create new guest
- `PUT /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

## Database Schema

### Weddings Table
- id (INT, PRIMARY KEY)
- couple_names (VARCHAR)
- wedding_date (DATE)
- venue (VARCHAR)
- budget (DECIMAL)
- status (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Guests Table
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- wedding_id (INT, FOREIGN KEY)
- rsvp_status (VARCHAR)
- plus_one (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
