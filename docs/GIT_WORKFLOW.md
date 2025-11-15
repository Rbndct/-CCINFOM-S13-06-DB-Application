# Git Workflow: Preserving Local .env File

This document describes the workflow to ensure your local `backend/.env` file is always preserved when pulling changes from the repository.

## Quick Start

### Windows (PowerShell)
```powershell
.\git-pull-preserve-env.ps1
```

Or specify a different branch:
```powershell
.\git-pull-preserve-env.ps1 -Branch main
```

### Linux/Mac (Bash)
```bash
chmod +x git-pull-preserve-env.sh
./git-pull-preserve-env.sh
```

Or specify a different branch:
```bash
./git-pull-preserve-env.sh main
```

## Manual Workflow

If you prefer to do it manually, follow these steps:

### 1. Before Pulling

Stash your local .env file:
```bash
git stash push -m "local env" backend/.env
```

### 2. Pull the Latest Changes

```bash
git pull origin update-nov-15
```

### 3. After Pulling

Restore your local .env file:
```bash
git stash pop
```

## Important Rules

### ✅ Your local `backend/.env` should:
- Always stay unchanged
- Never be overwritten
- Never be committed to git

### ✅ The `.env` file is already:
- Listed in `.gitignore` (line 26)
- Not tracked by git

### ⚠️ If `.env` becomes tracked:

If for some reason `backend/.env` gets tracked by git, remove it with:

```bash
git rm --cached backend/.env
git commit -m "Stop tracking backend/.env"
```

## Troubleshooting

### Problem: Stash conflicts after pull

If you get conflicts when restoring the .env file:
1. Check what's in the stash: `git stash show -p`
2. Manually restore your .env file if needed
3. Clear the stash: `git stash drop`

### Problem: .env file is tracked

If the .env file is being tracked:
1. Remove it from tracking: `git rm --cached backend/.env`
2. Commit the change: `git commit -m "Stop tracking backend/.env"`
3. Verify it's ignored: `git check-ignore backend/.env`

### Problem: Script doesn't work

Make sure:
- You're in the repository root directory
- The script has execute permissions (Linux/Mac): `chmod +x git-pull-preserve-env.sh`
- PowerShell execution policy allows scripts (Windows): `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Automation

You can also set up a git alias for convenience:

```bash
git config alias.pull-safe '!f() { git stash push -m "local env" backend/.env && git pull "$@" && git stash pop; }; f'
```

Then use it like:
```bash
git pull-safe origin update-nov-15
```

