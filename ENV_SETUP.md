# Environment Variables Setup Guide

## Overview
This project uses environment variables to manage sensitive configuration like database credentials. **Never commit `.env` files to version control.**

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   # Or for backend:
   cp backend/.env.example backend/.env
   ```

2. **Edit `.env` with your actual values:**
   ```env
   PORT=5067
   DB_HOST=localhost
   DB_USER=your_actual_username
   DB_PASSWORD=your_actual_password
   DB_NAME=wedding_management_db
   ```

3. **Restart your server** to load the new environment variables.

## Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL server hostname | `localhost` | Yes |
| `DB_USER` | MySQL username | `root` | Yes |
| `DB_NAME` | Database name | `wedding_management` | Yes |
| `DB_PASSWORD` | MySQL password | (empty) | No |
| `PORT` | Server port | `3001` or auto-assign | No |
| `VITE_API_PORT` | Frontend API port (Vite) | `3001` | No |

## Team Collaboration

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Share `.env.example`** - This template is safe to commit
3. **Each developer** creates their own `.env` with local credentials
4. **Production** - Use secure environment variable management (e.g., AWS Secrets Manager, Azure Key Vault)

## Validation

The backend automatically validates required environment variables on startup and will:
- Warn if required variables are missing
- Use default values when appropriate
- Log configuration (without passwords) for debugging

## Troubleshooting

- **"Missing environment variables" warning**: Create a `.env` file with required variables
- **Database connection fails**: Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`
- **Port conflicts**: Change `PORT` in `.env` to an available port

