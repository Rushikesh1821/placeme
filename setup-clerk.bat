@echo off
REM Clerk Setup Script for PlaceMe (Windows)
REM This script helps you set up Clerk authentication

echo 🚀 PlaceMe - Clerk Authentication Setup
echo ======================================
echo.

REM Check if .env file exists
if not exist "client\.env" (
    echo ❌ Error: client\.env file not found!
    echo Please copy client\.env.example to client\.env first:
    echo copy client\.env.example client\.env
    pause
    exit /b 1
)

REM Check current Clerk key
findstr "VITE_CLERK_PUBLISHABLE_KEY" client\.env > temp_key.txt
set /p CURRENT_KEY=<temp_key.txt
set CURRENT_KEY=%CURRENT_KEY:*==%

if "%CURRENT_KEY%"=="pk_test_YOUR_ACTUAL_CLERK_KEY_HERE" (
    echo ⚠️  Clerk key is not configured!
    echo.
    echo Please follow these steps:
    echo 1. Go to https://clerk.com
    echo 2. Create an account and application
    echo 3. Get your publishable key from the dashboard
    echo 4. Update client\.env with your key
    echo.
    echo For detailed instructions, see: CLERK_SETUP.md
    echo.
    echo Current key: %CURRENT_KEY%
    del temp_key.txt
    pause
    exit /b 1
) else (
    echo ✅ Clerk key is configured!
    echo Current key: %CURRENT_KEY:~0,20%...
    echo.
)

del temp_key.txt

REM Check if development server is running
curl -s http://localhost:3006 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Development server is running on http://localhost:3006
    echo.
    echo 🎉 Setup complete! You can now:
    echo 1. Open http://localhost:3006 in your browser
    echo 2. Test sign-up and sign-in functionality
    echo 3. Configure user roles in Clerk dashboard
) else (
    echo ⚠️  Development server is not running
    echo Start it with: npm run dev:client
)

echo.
echo 📚 For help, check CLERK_SETUP.md
pause
