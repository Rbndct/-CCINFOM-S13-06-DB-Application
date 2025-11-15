# Wedding Management System

A comprehensive wedding management application built with React, Express, and MySQL.

## Project Overview

This project consists of:
- **Frontend**: React + TypeScript + Vite (runs on port 8081)
- **Backend**: Express.js + MySQL (runs on port 3001)

## Prerequisites

- Node.js (v18 or higher) and npm
- MySQL Database
- Git

## Quick Start

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Database Setup

1. Make sure MySQL is running
2. Update database credentials in `backend/.env` (see `ENV_SETUP.md` for details)
3. Run the database setup script:

```sh
cd backend
mysql -u root -p < setup_database.sql
```

Or import it using your MySQL client:
```sh
mysql -u root -p wedding_management_db < backend/setup_database.sql
```

### 3. Install Dependencies and Start Development Servers

**Option A: Start Both Backend and Frontend Together (Recommended)**

This will install dependencies for both backend and frontend, then start both servers simultaneously:

```sh
npm run dev:all
```

This command will:
- Install backend dependencies (`cd backend && npm i`)
- Install frontend dependencies (`npm i`)
- Start the backend server (auto-detects free port if 3001 is in use)
- Start the frontend server (auto-detects free port if 8080 is in use)
- Display colored output for both servers (BACKEND in blue, FRONTEND in green)
- Frontend automatically detects backend port (handles auto-assigned ports)

**Option B: Start Backend and Frontend Separately**

If you prefer to run them separately, use these commands in different terminals:

```sh
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Option C: Start Only Frontend (if backend is already running)**

```sh
npm run dev
```

**Option D: Start Only Backend (if frontend is already running)**

```sh
cd backend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:8081 (or auto-assigned port if 8081 is in use - check terminal output)
- **Backend API**: http://localhost:3001 (or auto-assigned port if 3001 is in use - check terminal output)
- **Health Check**: http://localhost:3001/health (or use the auto-assigned port)
- **Port Info**: http://localhost:3001/port (returns current backend port)

**Note:** If ports are auto-assigned, check the terminal output for the actual ports. The frontend will automatically detect and connect to the backend port.

## Available Scripts

### Root Directory Scripts

- `npm run dev` - Start frontend development server only
- `npm run dev:backend` - Install backend dependencies and start backend server
- `npm run dev:frontend` - Install frontend dependencies and start frontend server
- `npm run dev:all` - **Start both backend and frontend together** (installs dependencies automatically)
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint

### Backend Scripts (in `backend/` directory)

- `npm run dev` - Start backend server with nodemon (auto-reload)
- `npm start` - Start backend server (production mode)

## Project Structure

```
.
├── backend/           # Express.js backend
│   ├── routes/        # API routes
│   ├── migrations/    # Database migrations
│   ├── server.js      # Backend server entry point
│   └── setup_database.sql  # Database schema
├── src/               # React frontend
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   └── api.js         # API client configuration
└── package.json       # Root package.json with dev scripts
```

## Environment Setup

See `ENV_SETUP.md` for detailed environment variable configuration.

## Development Workflow

1. **Start Development**: Run `npm run dev:all` from the root directory
2. **Backend runs on**: http://localhost:3001 (or auto-assigned port if 3001 is in use)
3. **Frontend runs on**: http://localhost:8081 (or auto-assigned port if 8081 is in use)
4. Both servers support hot-reloading for automatic updates
5. Frontend automatically detects backend port (even if auto-assigned)
6. Use `Ctrl+C` to stop both servers

### Auto Port Detection

**Backend:**
- If `PORT` is not set in `backend/.env`, backend uses port `0` (auto-assigns a free port)
- If the specified port is in use, backend automatically finds a free port
- Backend saves the actual port to `backend/port.txt` and returns it in `/port` and `/test` endpoints

**Frontend:**
- If port 8081 is in use, Vite automatically uses the next available port
- Frontend detects backend port by trying common ports (3001, 3000, 3002, etc.)
- Frontend stores the detected port in localStorage for faster future connections

## Troubleshooting

### Port Already in Use

If you get a port already in use error:
- Backend: Change port in `backend/server.js` or set `PORT` in `backend/.env`
- Frontend: Change port in `vite.config.ts` or use `npm run dev -- --port <port>`

### Database Connection Issues

1. Verify MySQL is running
2. Check database credentials in `backend/.env`
3. Ensure database exists: `mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wedding_management_db;"`

### Dependencies Issues

If you encounter dependency issues:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- For backend: `cd backend && rm -rf node_modules package-lock.json && npm install`

### Concurrently Not Found

If you get an error about concurrently not being found, it should already be installed. If not:

```sh
# Install concurrently
npm install concurrently --save-dev

# Verify installation
ls node_modules/.bin/concurrently
```

**Note:** The script uses `concurrently` from `node_modules/.bin/`. npm scripts automatically use the local version if it's installed. If it's not found, make sure you've run `npm install` in the root directory.

## Technologies Used

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **TanStack Query** - Data fetching

### Backend
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **Node.js** - Runtime environment
- **Nodemon** - Development auto-reload
- **CORS** - Cross-origin resource sharing

## Features

- Couple Management
- Wedding Planning
- Guest Management with RSVP tracking
- Dietary Restrictions Management
- Table Seating Arrangements
- Menu Items and Packages
- Inventory Management
- Reports and Analytics

## Additional Documentation

- `ENV_SETUP.md` - Environment variable configuration
- `PROJECT_SETUP.md` - Detailed project setup instructions
- `backend/README.md` - Backend-specific documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
