@echo off
echo ===================================================
echo   Starting MOOLA Website on http://localhost:8080
echo ===================================================
start http://localhost:8080/index.html
python -m http.server 8080 --directory "%~dp0website"
pause
