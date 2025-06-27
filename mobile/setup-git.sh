#!/bin/bash

# SmartTask Mobile - Git Setup Script
# This script sets up the development environment and Git workflow

echo "🚀 Setting up SmartTask Mobile development environment..."

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the mobile directory"
  exit 1
fi

# Check if Git is initialized
if [ ! -d ".git" ]; then
  echo "📁 Initializing Git repository..."
  git init
fi

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
  echo "🔧 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ Please update .env file with your local configuration"
else
  echo "⚠️  .env file already exists, skipping..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up Git hooks with Husky
echo "🪝 Setting up Git hooks..."
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
npx husky add .husky/commit-msg "echo 'Commit message validation (add your validation here)'"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "📍 Current branch: $CURRENT_BRANCH"

# Suggest branch naming convention
echo ""
echo "📋 Recommended branch naming:"
echo "  • mobile/feature/your-feature-name"
echo "  • mobile/bugfix/issue-description"
echo "  • mobile/release/version-number"
echo "  • mobile/hotfix/critical-fix"
echo ""

# Check if remote is set
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "🔗 No remote repository configured."
  echo "   Add your remote with: git remote add origin <repository-url>"
else
  REMOTE_URL=$(git remote get-url origin)
  echo "🔗 Remote repository: $REMOTE_URL"
fi

echo ""
echo "✅ Setup complete! Ready for development."
echo ""
echo "🚀 Next steps:"
echo "  1. Update .env file with your backend URL"
echo "  2. Start the backend server"
echo "  3. Run 'npm start' to start Expo development server"
echo "  4. Create a feature branch: git checkout -b mobile/feature/your-feature"
echo ""
echo "📖 For more information, check the README.md file"
