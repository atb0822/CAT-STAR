@echo off
echo ================================================
echo  CAT-STAR 2000 v1.3.30
echo  Cable Access Television
echo  Scheduled Television Announcements ^& Reports
echo ================================================
echo.
echo  Copyright (C) 2026 Aaron Boone
echo  All Rights Reserved
echo.
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Clear npm cache to prevent issues
echo Clearing npm cache...
call npm cache clean --force 2>nul
echo.

REM Always check and install/update dependencies
echo Checking dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo.
echo Dependencies installed/updated successfully!
echo.

REM Start the server
echo ================================================
echo CAT-STAR 2000 v1.3.30 Server Starting...
echo Cable Access Television
echo Scheduled Television Announcements ^& Reports
echo ================================================
echo.
echo Access URLs:
echo   Menu:                  http://localhost:3000/menu
echo   Admin Panel:           http://localhost:3000/admin
echo   Current Live Display:  http://localhost:3000/
echo   Events Only:           http://localhost:3000/events-display
echo   Weather Display:       http://localhost:3000/weather
echo   Announcements Only:    http://localhost:3000/announcements-display
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

node server.js

REM Keep window open on error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server stopped with an error!
    pause
)
