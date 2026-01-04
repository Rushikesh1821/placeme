@echo off
echo ==========================================
echo   PlaceMe - AI Placement Portal Setup
echo ==========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)
echo [OK] Python found

REM Check MongoDB
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH. Make sure MongoDB is running.
)

echo.
echo Installing dependencies...
echo.

REM Install root dependencies
echo [1/4] Installing root dependencies...
call npm install

REM Install server dependencies
echo [2/4] Installing server dependencies...
cd server
call npm install
cd ..

REM Install client dependencies
echo [3/4] Installing client dependencies...
cd client
call npm install
cd ..

REM Install Python dependencies
echo [4/4] Installing AI service dependencies...
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Copy .env.example files to .env in each folder
echo 2. Configure your environment variables
echo 3. Start MongoDB
echo 4. Run: npm run dev
echo.
pause
