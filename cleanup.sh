#!/bin/bash
# cleanup.sh - Script to clean up SmartTask project

echo "🧹 SmartTask Project Cleanup"
echo "============================"
echo ""

# Clean build artifacts
echo "📦 Cleaning build artifacts..."
if [ -d "backend/target" ]; then
    rm -rf backend/target
    echo "✅ Removed backend/target"
fi

if [ -d "frontend/node_modules" ]; then
    rm -rf frontend/node_modules
    echo "✅ Removed frontend/node_modules"
fi

if [ -d "frontend/build" ]; then
    rm -rf frontend/build
    echo "✅ Removed frontend/build"
fi

# Clean temporary files
echo ""
echo "🗑️  Cleaning temporary files..."
find . -name "*.log" -type f -delete 2>/dev/null && echo "✅ Removed log files"
find . -name ".DS_Store" -type f -delete 2>/dev/null && echo "✅ Removed .DS_Store files"
find . -name "Thumbs.db" -type f -delete 2>/dev/null && echo "✅ Removed Thumbs.db files"

# Clean Docker artifacts
echo ""
echo "🐳 Cleaning Docker artifacts..."
docker system prune -f 2>/dev/null && echo "✅ Docker system pruned"

echo ""
echo "✨ Cleanup completed!"
echo ""
echo "To rebuild the project:"
echo "1. cd backend && ./mvnw clean install"
echo "2. cd frontend && pnpm install"
echo "3. Use start.bat or docker-compose up to run the application"
