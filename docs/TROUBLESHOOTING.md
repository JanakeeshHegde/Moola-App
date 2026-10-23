# MOOLA — Common Errors & Verified Solutions (Troubleshooting)

This document catalogs common issues encountered during local development on Windows 11 with the Spring Boot backend, Vite website, and Android application (including wireless debugging on POCO M4 Pro).

---

## 1. Java & JDK Issues

### Issue: "JAVA_HOME is not set and no 'java' command could be found in your PATH"
- **Diagnostic**:
  ```powershell
  java -version
  ```
- **Root Cause**: Windows environment variables do not include Java in the current terminal session.
- **Verified Fix**:
  Both [android-app/gradlew.bat](file:///d:/Moola-App/android-app/gradlew.bat) and [backend/gradlew.bat](file:///d:/Moola-App/backend/gradlew.bat) have been updated to auto-detect Android Studio's bundled Java runtime (JBR).
  If running manual commands, set it in your PowerShell terminal:
  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
  $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
  ```

---

## 2. Backend & Database Issues

### Issue: "Port 5000 is already in use"
- **Diagnostic**:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess, State
  ```
- **Root Cause**: A previous Spring Boot or Python process is still bound to port 5000.
- **Verified Fix**:
  Terminate the process holding the port:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```

---

### Issue: "MongoSocketOpenException / Connection timed out"
- **Diagnostic**: Look at backend startup logs in Terminal 1.
- **Root Cause**: MongoDB Atlas network firewall is blocking your current public IP address.
- **Verified Fix**:
  1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com).
  2. Go to **Security** ➔ **Network Access**.
  3. Click **Add IP Address** ➔ Select **Add Current IP Address** (or `0.0.0.0/0` for development).
  4. Wait 1–2 minutes for the rule to apply, then restart the backend:
     ```powershell
     cd D:\Moola-App\backend
     .\gradlew.bat bootRun
     ```

---

## 3. Website & Vite Issues

### Issue: "Port 8080 is in use, using 8081 instead"
- **Diagnostic**: Terminal 2 displays `Port 8080 is in use, trying another one...`
- **Root Cause**: Another service (or an active tab) is occupying port 8080.
- **Verified Fix**:
  Either use the new URL shown in the terminal (e.g. `http://localhost:8081/`), or terminate the process on 8080:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force
  ```

---

### Issue: "CORS error / Access-Control-Allow-Origin"
- **Diagnostic**: Browser Developer Console (`F12`) displays:
  `Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS policy`
- **Root Cause**: Backend Security configuration did not authorize the calling origin.
- **Verified Fix**:
  [SecurityConfig.java](file:///d:/Moola-App/backend/src/main/java/com/moola/backend/config/SecurityConfig.java) has been pre-configured with a permissive CORS filter that permits all requests originating from `http://localhost:*`, `http://127.0.0.1:*`, and LAN IP addresses. Ensure you restart the backend if changes were made.

---

## 4. Android SDK & ADB Issues

### Issue: "The term 'adb' is not recognized"
- **Diagnostic**:
  ```powershell
  adb devices
  ```
- **Root Cause**: Android SDK `platform-tools` is not in your current PowerShell `$env:PATH`.
- **Verified Fix**:
  Use the full path with PowerShell's call operator `&`:
  ```powershell
  & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
  ```
  Or add it permanently to your Windows User PATH:
  ```powershell
  [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
  ```

---

## 5. Wireless Debugging on POCO M4 Pro (MIUI / HyperOS)

### Issue: "failed to connect to 192.168.1.X:PORT"
- **Diagnostic**:
  ```powershell
  adb connect 192.168.1.105:39481
  ```
  Returns `cannot connect to 192.168.1.105:39481: No connection could be made because the target machine actively refused it.`
- **Root Cause**: In Android 11+ (MIUI / HyperOS), the **connection port changes dynamically** whenever the phone reconnects to Wi-Fi or when the screen locks.
- **Verified Fix**:
  1. Unlock your POCO M4 Pro.
  2. Open **Settings ➔ Additional Settings ➔ Developer Options ➔ Wireless Debugging**.
  3. Look at the new port number displayed under **"IP address & Port"** (e.g., `192.168.1.105:41235`).
  4. Connect using that updated port:
     ```powershell
     & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" connect 192.168.1.105:41235
     ```

---

### Issue: "device unauthorized"
- **Diagnostic**:
  `adb devices` shows:
  ```text
  192.168.1.105:41235    unauthorized
  ```
- **Root Cause**: The phone has not yet accepted your computer's RSA debugging key.
- **Verified Fix**:
  Unlock the POCO M4 Pro. A prompt will appear: *"Allow Wireless debugging on this network?"*. Check **"Always allow on this network"** and tap **Allow**.

---

### Issue: "INSTALL_FAILED_USER_RESTRICTED"
- **Diagnostic**:
  `adb install` fails with `INSTALL_FAILED_USER_RESTRICTED`.
- **Root Cause**: MIUI / Xiaomi HyperOS security restriction blocks automated APK installs over USB/Wireless debugging by default.
- **Verified Fix**:
  1. On your POCO M4 Pro, open **Settings ➔ Additional Settings ➔ Developer Options**.
  2. Scroll down to the debugging section.
  3. Turn **ON** the toggle: **"Install via USB"**.
  4. Turn **ON** the toggle: **"USB debugging (Security settings)"**.
  5. Re-run:
     ```powershell
     & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
     ```

---

## 6. Physical Phone Network Connectivity to Backend

### Issue: "App on POCO M4 Pro cannot connect / Network error on login"
- **Root Cause 1: Using `10.0.2.2` on a physical device**:
  `10.0.2.2` only works inside the Android Studio emulator. A physical phone has no idea what `10.0.2.2` is.
- **Root Cause 2: Windows Defender Firewall blocking port 5000**:
  Windows Defender blocks incoming connections from other devices on your Wi-Fi network by default.
- **Root Cause 3: Phone and laptop on different Wi-Fi bands/networks**:
  (e.g., laptop on 5GHz, phone on Guest Wi-Fi).

### Step-by-Step Diagnostic & Fix:
1. **Find Laptop LAN IP**:
   ```powershell
   ipconfig
   ```
   Note the **IPv4 Address** (e.g. `192.168.1.45`).
2. **Open Port 5000 on Windows Firewall**:
   Run in **PowerShell (Run as Administrator)**:
   ```powershell
   New-NetFirewallRule -DisplayName "MOOLA Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```
3. **Verify from Phone Browser**:
   Open Google Chrome on your POCO M4 Pro and type:
   `http://192.168.1.45:5000/api/health`
   If it returns `{"status":"UP"}`, network communication is working!
4. **Update Android Base URL**:
   In [android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L20):
   ```java
   public static final String DEFAULT_BASE_URL = "http://192.168.1.45:5000/";
   ```
   Recompile and install:
   ```powershell
   cd D:\Moola-App\android-app
   .\gradlew.bat assembleDebug
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 7. Android Cleartext Traffic Permitted Error

### Issue: "Cleartext HTTP traffic to ... not permitted"
- **Root Cause**: Android 9+ (API 28+) disables cleartext unencrypted HTTP traffic by default for security.
- **Verified Fix**:
  The project includes [android-app/app/src/main/res/xml/network_security_config.xml](file:///d:/Moola-App/android-app/app/src/main/res/xml/network_security_config.xml) with cleartext explicitly enabled for local development domains (`localhost`, `10.0.2.2`, LAN subnets), and it is referenced in [AndroidManifest.xml](file:///d:/Moola-App/android-app/app/src/main/AndroidManifest.xml) via:
  ```xml
  android:networkSecurityConfig="@xml/network_security_config"
  ```
