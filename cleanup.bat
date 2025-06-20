@echo off
REM cleanup.bat - Script to clean up SmartTask project

echo 🧹 SmartTask Project Cleanup
echo ============================
echo.

REM Clean build artifacts
echo 📦 Cleaning build artifacts...
if exist "backend\target" (
    rmdir /s /q "backend\target"
    echo ✅ Removed backend\target
)

if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo ✅ Removed frontend\node_modules
)

if exist "frontend\build" (
    rmdir /s /q "frontend\build"
    echo ✅ Removed frontend\build
)

REM Clean temporary files
echo.
echo 🗑️ Cleaning temporary files...
del /s /q "*.log" >nul 2>&1
if %errorlevel%==0 echo ✅ Removed log files

REM Clean Docker artifacts
echo.
echo 🐳 Cleaning Docker artifacts...
docker system prune -f >nul 2>&1
if %errorlevel%==0 echo ✅ Docker system pruned

echo.
echo ✨ Cleanup completed!
echo.
echo To rebuild the project:
echo 1. cd backend ^&^& mvnw clean install
echo 2. cd frontend ^&^& pnpm install  
echo 3. Use start.bat or docker-compose up to run the application
pause
