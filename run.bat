@echo off
title College Library Management System
echo ========================================================
echo   Starting College Library Management System Server
echo ========================================================

REM Try py launcher first (checks all registered Python installs)
where py >nul 2>&1
if %errorlevel%==0 (
    py app.py
    pause
    exit /b
)

REM Try standard python command
where python >nul 2>&1
if %errorlevel%==0 (
    python app.py
    pause
    exit /b
)

REM Fallback: known local Python 3.14 install path
if exist "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" (
    "%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe" app.py
    pause
    exit /b
)

REM Fallback: older local python user directory
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    "%LOCALAPPDATA%\Python\bin\python.exe" app.py
    pause
    exit /b
)

echo Python not found! Please ensure Python 3 is installed.
pause