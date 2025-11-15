# Codebase Reorganization Plan

## Current Issues Identified

### Backend Issues:
1. **Port files in root**: `:3001`, `:3002`, `:5067`, `:5068` should be in logs/temp
2. **Inconsistent naming**: Routes mix camelCase (`dietaryRestrictions.js`) and snake_case (`menu_items.js`)
3. **SQL files in root**: Should be organized in `scripts/` or `database/` folder
4. **Test files in root**: `test_db_connection.js` should be in `scripts/` or `tests/`
5. **Port file**: `port.txt` should be in `config/` or `logs/`

### Frontend Issues:
1. **TypeScript inconsistency**: `api.js` and `Navigation.jsx` should be `.ts`/`.tsx`
2. **Unused files**: `Index.tsx` appears to be placeholder, `App.css` might be unused
3. **Duplicate files**: `use-toast.ts` exists in both `hooks/` and `components/ui/`
4. **File extensions**: `restrictionUtils.tsx` should be `.ts` if no JSX

### Missing Structure:
1. No `types/` folder for TypeScript interfaces
2. No `constants/` folder for app constants
3. No `services/` folder for API layer organization
4. No `tests/` folder structure
5. No proper `config/` folder

## Proposed Structure

```
backend/
├── config/
│   ├── database.js (moved from db.js)
│   └── server.js (config only)
├── controllers/ (optional - for future MVC pattern)
├── middleware/
├── models/ (optional - for future ORM)
├── routes/
│   ├── couples.js
│   ├── dietary-restrictions.js (renamed)
│   ├── guests.js
│   ├── health.js
│   ├── menu-items.js (renamed)
│   ├── packages.js
│   ├── tables.js
│   └── weddings.js
├── scripts/
│   ├── test-db-connection.js (renamed)
│   └── insert-naruto-menu-items.sql (moved)
├── database/
│   ├── migrations/
│   └── setup-database.sql (moved)
├── logs/ (for port.txt and runtime files)
├── server.js (main entry point)
└── package.json

src/
├── api/
│   └── index.ts (renamed from api.js)
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   ├── navigation/
│   │   └── Navigation.tsx (renamed from .jsx)
│   └── ui/ (unchanged)
├── constants/
│   └── index.ts
├── context/
│   └── CurrencyContext.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts (keep only this one)
├── lib/
│   └── utils.ts
├── pages/ (unchanged)
├── services/ (optional - for business logic)
├── types/
│   └── index.ts
├── utils/
│   ├── currency.ts
│   └── restriction-utils.ts (renamed, .ts if no JSX)
├── App.tsx
├── main.tsx
└── index.css
```

## Changes to Make

1. **Backend:**
   - Create `config/`, `scripts/`, `database/`, `logs/` folders
   - Move and rename files accordingly
   - Standardize route naming to kebab-case
   - Clean up port files

2. **Frontend:**
   - Convert `api.js` → `api/index.ts`
   - Convert `Navigation.jsx` → `components/navigation/Navigation.tsx`
   - Remove duplicate `use-toast.ts` from `components/ui/`
   - Remove unused `Index.tsx` and `App.css`
   - Rename `restrictionUtils.tsx` → `restriction-utils.ts` (if no JSX)
   - Create `types/` and `constants/` folders

3. **Update imports:**
   - Update all import paths after reorganization
   - Update route imports in backend
   - Update component imports in frontend

4. **Update .gitignore:**
   - Ensure new folder structure is properly ignored

