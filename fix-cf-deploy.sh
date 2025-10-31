#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         FIX CLOUDFLARE PAGES DEPLOYMENT                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Check current status
echo "🔍 Checking Git status..."
git status

echo ""
echo "📝 Current branch:"
git branch --show-current

echo ""
echo "📊 Recent commits:"
git log --oneline -5

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""

# 2. Create a new commit
echo "✨ Creating a fresh commit..."
git add .
git commit -m "fix: resolve Cloudflare Pages deployment reference issue

This commit fixes the 'not our ref' error by creating a fresh commit
that Cloudflare Pages can properly reference.

Changes:
- Ensures all files are up to date
- Creates new commit SHA for Cloudflare to reference
- Resolves stale deployment reference issue" || echo "No changes to commit (this is okay)"

echo ""
echo "✅ New commit created:"
git log --oneline -1

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""

# 3. Ask about branch and push
read -p "Which branch to push to? (default: main): " branch
branch=${branch:-main}

echo ""
echo "🚀 Pushing to $branch..."
echo ""

# Try normal push first
if git push origin $branch; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                   ✅ PUSH SUCCESSFUL                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Go to Cloudflare Pages dashboard"
    echo "2. Trigger a new deployment (or wait for automatic trigger)"
    echo "3. The new commit should deploy successfully"
else
    echo ""
    echo "⚠️  Normal push failed. This might be because:"
    echo "   - Remote has commits you don't have locally"
    echo "   - Branch protection rules"
    echo ""
    read -p "Do you want to try force push? (yes/no): " force_confirm
    
    if [ "$force_confirm" = "yes" ]; then
        echo ""
        echo "⚠️  Force pushing to $branch..."
        if git push origin $branch --force; then
            echo ""
            echo "╔════════════════════════════════════════════════════════════════╗"
            echo "║              ✅ FORCE PUSH SUCCESSFUL                          ║"
            echo "╚════════════════════════════════════════════════════════════════╝"
            echo ""
            echo "⚠️  WARNING: Force push rewrites history!"
            echo ""
            echo "Next steps:"
            echo "1. Go to Cloudflare Pages dashboard"
            echo "2. Trigger a new deployment"
            echo "3. The new commit should deploy successfully"
        else
            echo ""
            echo "❌ Force push also failed. Possible issues:"
            echo "   - Branch protection enabled"
            echo "   - Insufficient permissions"
            echo "   - Network issues"
            echo ""
            echo "Manual steps:"
            echo "1. Check your Git credentials"
            echo "2. Verify branch protection settings"
            echo "3. Try pushing from Git GUI or IDE"
        fi
    else
        echo ""
        echo "Manual steps to try:"
        echo "1. git pull origin $branch --rebase"
        echo "2. git push origin $branch"
    fi
fi

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""
