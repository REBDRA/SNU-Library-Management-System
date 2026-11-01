@echo off
title SNU Library Management System
echo ========================================================
echo   Starting SNU Library Management System Server
echo ========================================================

REM Try to find Python
where py >nul 2>&1
if %errorlevel%==0 (
    py app.py
    pause
    exit /b
)

where python >nul 2>&1
if %errorlevel%==0 (
    python app.py
    pause
    exit /b
)

REM Fallback to local python user directory
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    "%LOCALAPPDATA%\Python\bin\python.exe" app.py
    pause
    exit /b
)

echo Python not found! Please ensure Python 3 is installed.
pause
