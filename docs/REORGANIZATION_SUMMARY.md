# Codebase Reorganization Summary

## Overview
This document summarizes the reorganization of the codebase to follow industry-standard practices for maintainability, scalability, and team collaboration.

## Changes Made

### Backend Reorganization

#### 1. Folder Structure Created
- **`backend/config/`** - Configuration files
  - `database.js` (moved from `db.js`)
- **`backend/scripts/`** - Utility and test scripts
  - `test-db-connection.js` (moved and renamed from `test_db_connection.js`)
  - `insert-naruto-menu-items.sql` (moved from root)
- **`backend/database/`** - Database-related files
  - `setup_database.sql` (moved from root)
  - `migrations/` (kept in place)
- **`backend/logs/`** - Runtime and log files
  - `port.txt` (moved from root, auto-created by server)

#### 2. Route File Naming Standardized
- `dietaryRestrictions.js` → `dietary-restrictions.js` (kebab-case)
- `menu_items.js` → `menu-items.js` (kebab-case)
- All routes now use consistent kebab-case naming

#### 3. Files Cleaned Up
- Removed port files (`:3001`, `:3002`, etc.) from root
- Updated all route imports to use `../config/database`
- Updated `server.js` to save port file to `logs/` directory

### Frontend Reorganization

#### 1. Folder Structure Created
- **`src/api/`** - API client and services
  - `index.ts` (renamed from `api.js`)
- **`src/components/layout/`** - Layout components
  - `DashboardLayout.tsx` (moved from `components/`)
- **`src/components/navigation/`** - Navigation components
  - `Navigation.tsx` (moved and renamed from `Navigation.jsx`)
- **`src/types/`** - TypeScript type definitions
  - `index.ts` (new file with all type definitions)
- **`src/constants/`** - Application constants
  - `index.ts` (new file with all constants)

#### 2. Files Removed
- `src/components/ui/use-toast.ts` (duplicate, kept in `hooks/`)
- `src/pages/Index.tsx` (unused placeholder)
- `src/App.css` (unused)

#### 3. TypeScript Consistency
- `api.js` → `api/index.ts`
- `Navigation.jsx` → `Navigation.tsx`
- All imports updated to use new paths

### Import Path Updates

All import statements have been updated to reflect the new structure:
- `@/components/DashboardLayout` → `@/components/layout/DashboardLayout`
- `@/components/Navigation` → `@/components/navigation/Navigation`
- `@/api` → `@/api` (unchanged, now points to `api/index.ts`)

## New Folder Structure

```
backend/
├── config/
│   └── database.js
├── scripts/
│   ├── test-db-connection.js
│   └── insert-naruto-menu-items.sql
├── database/
│   ├── migrations/
│   │   ├── add_preference_id_to_wedding.sql
│   │   ├── add_preference_restrictions_junction.sql
│   │   ├── create_couple_preference_restrictions_junction.sql
│   │   └── create_guest_restrictions_junction.sql
│   └── setup_database.sql
├── logs/
│   └── port.txt (auto-generated)
├── routes/
│   ├── couples.js
│   ├── dietary-restrictions.js
│   ├── guests.js
│   ├── health.js
│   ├── menu-items.js
│   ├── packages.js
│   ├── tables.js
│   └── weddings.js
├── server.js
└── package.json

src/
├── api/
│   └── index.ts
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   ├── navigation/
│   │   └── Navigation.tsx
│   └── ui/ (unchanged - shadcn components)
├── constants/
│   └── index.ts
├── context/
│   └── CurrencyContext.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── pages/ (unchanged)
├── types/
│   └── index.ts
├── utils/
│   ├── currency.ts
│   └── restrictionUtils.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Benefits

1. **Better Organization**: Clear separation of concerns with dedicated folders for config, scripts, database, and logs
2. **Consistency**: Standardized naming conventions (kebab-case for routes, TypeScript for frontend)
3. **Maintainability**: Easier to locate files and understand project structure
4. **Scalability**: Structure supports future growth (types, constants, services folders ready)
5. **Team Collaboration**: Industry-standard structure familiar to most developers
6. **Type Safety**: Centralized type definitions in `types/` folder
7. **Constants Management**: Centralized constants for easy updates

## Migration Notes

- All imports have been automatically updated
- No functional code was removed
- Backend routes maintain the same API endpoints
- Frontend components maintain the same functionality
- Port file location changed but server handles it automatically

## Verification Checklist

- [x] Backend folder structure created
- [x] Frontend folder structure created
- [x] All route files renamed and updated
- [x] All imports updated
- [x] Duplicate files removed
- [x] Unused files removed
- [x] TypeScript files converted
- [x] .gitignore updated
- [x] No linter errors

## Next Steps (Optional Improvements)

1. Consider adding a `services/` folder for business logic
2. Add a `tests/` folder structure
3. Consider splitting large components (e.g., `WeddingDetail.tsx`)
4. Add barrel exports (`index.ts`) for cleaner imports
5. Consider adding a `middleware/` folder in backend for shared middleware

## How to Verify

1. Run `npm run dev:all` - should start without errors
2. Check that all pages load correctly
3. Verify API endpoints are accessible
4. Check that port file is created in `backend/logs/`
5. Test CRUD operations on Menu Items and Packages
