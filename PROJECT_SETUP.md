# Wedding System Management - Complete Setup Guide

## 🎯 Project Overview

This is a **fullstack wedding management system** with:
- **Frontend**: React + Vite + Tailwind CSS (runs in Lovable preview)
- **Backend**: Node.js + Express + MySQL (runs locally on your machine)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- npm or yarn package manager

---

## 📦 Backend Setup

### 1. Navigate to Backend Folder
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `mysql2` - MySQL database driver
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables
- `nodemon` - Auto-reload during development

### 3. Setup MySQL Database

Open MySQL client and run:
```sql
CREATE DATABASE wedding_management;

USE wedding_management;

CREATE TABLE weddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  couple_names VARCHAR(255) NOT NULL,
  wedding_date DATE NOT NULL,
  venue VARCHAR(255),
  budget DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  wedding_id INT,
  rsvp_status VARCHAR(50) DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);
```

### 4. Configure Environment Variables

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wedding_management
```

### 5. Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
🚀 Wedding System Management API running on port 3001
📍 http://localhost:3001
✅ Database connected successfully
```

---

## 🎨 Frontend Setup

The frontend is already running in Lovable! Just make sure your backend is running on port 3001.

To run frontend locally (optional):
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:8080`

---

## 🧪 Testing the API

### Using curl:

Test connection:
```bash
curl http://localhost:3001/test
```

Get all guests:
```bash
curl http://localhost:3001/guests
```

Create a guest:
```bash
curl -X POST http://localhost:3001/guests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0123",
    "rsvp_status": "pending",
    "plus_one": true
  }'
```

---

## 📁 Project Structure

```
wedding-system-management/
├── backend/                 # Express API
│   ├── server.js           # Entry point
│   ├── db.js               # MySQL connection
│   ├── routes/
│   │   ├── guests.js       # Guest endpoints
│   │   └── weddings.js     # Wedding endpoints
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── README.md
│
├── src/                    # React Frontend
│   ├── api.js              # Axios configuration
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   └── Guests.jsx      # Guest management
│   └── components/
│       └── Navigation.jsx  # Nav bar
│
└── PROJECT_SETUP.md        # This file
```

---

## 🔌 API Endpoints

### Test Endpoints
- `GET /test` - Verify API is running
- `GET /health` - Health check

### Weddings
- `GET /weddings` - Get all weddings
- `GET /weddings/:id` - Get single wedding
- `POST /weddings` - Create wedding
- `PUT /weddings/:id` - Update wedding
- `DELETE /weddings/:id` - Delete wedding

### Guests
- `GET /guests` - Get all guests
- `GET /guests/:id` - Get single guest
- `POST /guests` - Create guest
- `PUT /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

---

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running: `mysql -u root -p`
- Verify .env credentials are correct
- Check port 3001 isn't already in use

### Frontend can't connect
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify API URL in `src/api.js` is correct

### Database errors
- Ensure tables are created using SQL commands above
- Check MySQL user has proper permissions
- Verify database name matches .env

---

## 🎉 You're All Set!

1. Backend running on `http://localhost:3001`
2. Frontend showing in Lovable preview
3. Database connected and ready

Start managing weddings! 💍
