@echo off
echo Starting SmartTask Application...
echo.
echo This will build and start all services (MongoDB, Backend, Frontend)
echo Press Ctrl+C to stop the application
echo.
pause

docker-compose up --build
