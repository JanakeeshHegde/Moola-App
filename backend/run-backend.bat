@echo off
cd /d "%~dp0"
echo ===================================================
echo  Starting Moola Spring Boot Backend on Port 5000...
echo ===================================================
call mvnw.cmd spring-boot:run
