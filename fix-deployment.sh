#!/bin/bash

# Fix Cloudflare Pages Deployment Script
# This script helps resolve Git commit issues with Cloudflare Pages

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         FIX CLOUDFLARE PAGES DEPLOYMENT                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🔍 Checking Git repository status..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a Git repository. Please run this from your project root."
    exit 1
fi

echo "📊 Current branch:"
git branch --show-current
echo ""

echo "📝 Recent commits:"
git log --oneline -5
echo ""

echo "🔧 Fixing deployment issues..."
echo ""

# Add all changes
echo "1️⃣ Staging all changes..."
git add .

# Create a new commit
echo "2️⃣ Creating fresh commit..."
git commit -m "fix: Complete clinic detail page and resolve deployment issues

- Added complete clinic detail page with all rendering logic
- Fixed missing JSX in clinics/[slug]/page.tsx
- Ensured proper SEO metadata and structured data
- Resolved Git commit reference issues" || echo "   ℹ️  No changes to commit (that's okay)"

# Show the new commit
echo ""
echo "✅ New commit created:"
git log --oneline -1
echo ""

# Push to remote
echo "3️⃣ Pushing to remote repository..."
echo ""
read -p "Push to which branch? (default: main): " branch
branch=${branch:-main}

echo ""
echo "Pushing to $branch..."
git push origin $branch

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                   SUCCESS!                                     ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Successfully pushed to $branch"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your Cloudflare Pages dashboard"
    echo "2. Your deployment should start automatically"
    echo "3. If not, trigger a manual deployment"
    echo "4. Once deployed, test clinic pages: /clinics/[slug]"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common solutions:"
    echo ""
    echo "1. Force push (use carefully):"
    echo "   git push origin $branch --force"
    echo ""
    echo "2. Pull latest changes first:"
    echo "   git pull origin $branch"
    echo "   git push origin $branch"
    echo ""
    echo "3. Check your Git credentials"
    echo ""
fi
