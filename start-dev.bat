@echo off
echo ==========================================
echo   Starting PlaceMe Development Servers
echo ==========================================
echo.

REM Start MongoDB (if installed as service, skip this)
echo [INFO] Make sure MongoDB is running...
echo.

REM Start all services
echo Starting all services...
echo - Backend API: http://localhost:5000
echo - Frontend: http://localhost:5173
echo - AI Service: http://localhost:5001
echo.

npm run dev
