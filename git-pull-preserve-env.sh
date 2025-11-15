#!/bin/bash
# ============================================================================
# Git Pull with .env Preservation Script (Bash version)
# ============================================================================
# This script ensures your local backend/.env file is always preserved
# when pulling changes from the repository.
# ============================================================================

BRANCH="${1:-update-nov-15}"
ENV_PATH="backend/.env"

echo "🔄 Git Pull with .env Preservation"
echo "====================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository!"
    exit 1
fi

# Step 1: Check if .env file exists
if [ ! -f "$ENV_PATH" ]; then
    echo "⚠️  Warning: $ENV_PATH does not exist"
    echo "   Proceeding with normal git pull..."
    echo ""
    HAS_ENV=false
else
    echo "✅ Found $ENV_PATH"
    HAS_ENV=true
    
    # Step 2: Check if .env is tracked (it shouldn't be)
    if git ls-files --error-unmatch "$ENV_PATH" >/dev/null 2>&1; then
        echo "⚠️  Warning: $ENV_PATH is currently tracked by git!"
        echo "   Removing from git tracking..."
        git rm --cached "$ENV_PATH" 2>/dev/null
        git commit -m "Stop tracking backend/.env" 2>/dev/null
        echo "✅ Removed $ENV_PATH from git tracking"
        echo ""
    fi
    
    # Step 3: Stash the .env file
    echo "📦 Stashing local .env file..."
    if git stash push -m "local env - auto stash before pull" "$ENV_PATH" 2>/dev/null; then
        echo "✅ Stashed local .env file"
        HAS_STASH=true
    else
        # Check if stash failed because there were no changes
        if git diff --quiet "$ENV_PATH" 2>/dev/null && git diff --cached --quiet "$ENV_PATH" 2>/dev/null; then
            echo "ℹ️  No changes to stash (file unchanged)"
            HAS_STASH=false
        else
            echo "❌ Error stashing .env file"
            exit 1
        fi
    fi
    echo ""
fi

# Step 4: Pull the latest changes
echo "⬇️  Pulling latest changes from branch: $BRANCH"
if ! git pull origin "$BRANCH"; then
    echo "❌ Error pulling changes"
    
    # Restore .env if we stashed it
    if [ "$HAS_STASH" = true ]; then
        echo ""
        echo "🔄 Restoring .env file from stash..."
        git stash pop 2>/dev/null
    fi
    exit 1
fi

echo "✅ Successfully pulled latest changes"
echo ""

# Step 5: Restore the .env file from stash
if [ "$HAS_STASH" = true ]; then
    echo "🔄 Restoring local .env file from stash..."
    if ! git stash pop 2>/dev/null; then
        echo "⚠️  Warning: Could not automatically restore .env from stash"
        echo "   You may need to manually restore it with: git stash pop"
        echo ""
        echo "   Stash details:"
        git stash list | grep "local env" || true
    else
        echo "✅ Restored local .env file"
    fi
    echo ""
fi

# Step 6: Verify .env is still ignored
echo "🔍 Verifying .env is in .gitignore..."
if git check-ignore "$ENV_PATH" >/dev/null 2>&1; then
    echo "✅ $ENV_PATH is properly ignored by git"
else
    echo "⚠️  Warning: $ENV_PATH is NOT in .gitignore!"
    echo "   Please add it to .gitignore"
fi
echo ""

echo "✨ Done! Your local .env file has been preserved."
echo ""

