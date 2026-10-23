@echo off
echo ===================================================
echo   Building & Installing MOOLA Android App (Debug)
echo ===================================================
cd /d "%~dp0android-app"
call gradlew.bat installDebug
if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   App installed successfully!
    echo   Launching app on device/emulator...
    echo ===================================================
    adb shell am start -n com.moola.app/.ui.splash.SplashActivity
) else (
    echo.
    echo [NOTE] If no emulator or device was found, open
    echo        d:\Moola-App\android-app in Android Studio
    echo        and click the green Run (Play) button.
)
pause
