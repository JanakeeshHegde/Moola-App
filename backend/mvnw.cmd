@echo off
setlocal enableextensions enabledelayedexpansion

set "DIRNAME=%~dp0"
if "%DIRNAME%"=="" set "DIRNAME=."

where mvn >nul 2>nul
if %ERRORLEVEL%==0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

set "TEMP_MAVEN=%TEMP%\maven\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%TEMP_MAVEN%" (
    "%TEMP_MAVEN%" %*
    exit /b %ERRORLEVEL%
)

echo Downloading portable Apache Maven...
powershell -Command "$mavenUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip'; $zipPath = '$env:TEMP\apache-maven.zip'; $destPath = '$env:TEMP\maven'; if (-not (Test-Path '$destPath\apache-maven-3.9.9\bin\mvn.cmd')) { Invoke-WebRequest -Uri $mavenUrl -OutFile $zipPath; Expand-Archive -Path $zipPath -DestinationPath $destPath -Force }"

if exist "%TEMP_MAVEN%" (
    "%TEMP_MAVEN%" %*
    exit /b %ERRORLEVEL%
)

echo Failed to locate or download Maven. Please install Maven or add it to PATH.
exit /b 1
