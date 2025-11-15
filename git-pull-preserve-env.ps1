# ============================================================================
# Git Pull with .env Preservation Script
# ============================================================================
# This script ensures your local backend/.env file is always preserved
# when pulling changes from the repository.
# ============================================================================

param(
    [string]$Branch = "update-nov-15"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Git Pull with .env Preservation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

$envPath = "backend\.env"

# Step 1: Check if .env file exists
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  Warning: $envPath does not exist" -ForegroundColor Yellow
    Write-Host "   Proceeding with normal git pull..." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Found $envPath" -ForegroundColor Green
    
    # Step 2: Check if .env is tracked (it shouldn't be)
    $tracked = git ls-files $envPath 2>$null
    if ($tracked) {
        Write-Host "⚠️  Warning: $envPath is currently tracked by git!" -ForegroundColor Yellow
        Write-Host "   Removing from git tracking..." -ForegroundColor Yellow
        git rm --cached $envPath 2>$null
        git commit -m "Stop tracking backend/.env" 2>$null
        Write-Host "✅ Removed $envPath from git tracking" -ForegroundColor Green
        Write-Host ""
    }
    
    # Step 3: Stash the .env file
    Write-Host "📦 Stashing local .env file..." -ForegroundColor Cyan
    $stashResult = git stash push -m "local env - auto stash before pull" $envPath 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        # Check if stash failed because there were no changes
        if ($stashResult -match "No local changes to save") {
            Write-Host "ℹ️  No changes to stash (file unchanged)" -ForegroundColor Gray
            $hasStash = $false
        } else {
            Write-Host "❌ Error stashing .env file:" -ForegroundColor Red
            Write-Host $stashResult -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Stashed local .env file" -ForegroundColor Green
        $hasStash = $true
    }
    Write-Host ""
}

# Step 4: Pull the latest changes
Write-Host "⬇️  Pulling latest changes from branch: $Branch" -ForegroundColor Cyan
$pullResult = git pull origin $Branch 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error pulling changes:" -ForegroundColor Red
    Write-Host $pullResult -ForegroundColor Red
    
    # Restore .env if we stashed it
    if ($hasStash) {
        Write-Host ""
        Write-Host "🔄 Restoring .env file from stash..." -ForegroundColor Yellow
        git stash pop 2>$null
    }
    exit 1
}

Write-Host "✅ Successfully pulled latest changes" -ForegroundColor Green
Write-Host ""

# Step 5: Restore the .env file from stash
if ($hasStash) {
    Write-Host "🔄 Restoring local .env file from stash..." -ForegroundColor Cyan
    $popResult = git stash pop 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Warning: Could not automatically restore .env from stash" -ForegroundColor Yellow
        Write-Host "   You may need to manually restore it with: git stash pop" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Stash details:" -ForegroundColor Yellow
        git stash list | Select-String "local env" | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "✅ Restored local .env file" -ForegroundColor Green
    }
    Write-Host ""
}

# Step 6: Verify .env is still ignored
Write-Host "🔍 Verifying .env is in .gitignore..." -ForegroundColor Cyan
$ignored = git check-ignore $envPath 2>$null
if ($ignored) {
    Write-Host "✅ $envPath is properly ignored by git" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: $envPath is NOT in .gitignore!" -ForegroundColor Yellow
    Write-Host "   Please add it to .gitignore" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✨ Done! Your local .env file has been preserved." -ForegroundColor Green
Write-Host ""

