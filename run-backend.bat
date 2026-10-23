@echo off
echo ===================================================
echo   Starting MOOLA Spring Boot Backend on Port 5000
echo ===================================================
cd /d "%~dp0backend"
call gradlew.bat bootRun
pause
