# MOOLA — Complete Windows 11 Developer & Setup Guide

**Workstation Location**: `D:\Moola-App`  
**Target Environment**: Windows 11, PowerShell, Android Studio, Android SDK, and POCO M4 Pro (Wi-Fi debugging).  
**Philosophy**: Terminal-first, zero custom `.bat` launchers, explicit copy-pasteable commands with verified paths.  
**Architecture & API Reference**: See [README.md](README.md) for full system architecture, feature status, and API contracts.

---

## Quick Navigation

- [1. Prerequisites & Version Verification](#1-prerequisites--version-verification)
- [2. First-Time Project Setup](#2-first-time-project-setup)
- [3. Environment & Secrets Configuration](#3-environment--secrets-configuration)
- [4. MongoDB Setup & Troubleshooting](#4-mongodb-setup--troubleshooting)
- [5. Run the Spring Boot Backend (Terminal 1)](#5-run-the-spring-boot-backend-terminal-1)
- [6. Backend Health & API Verification](#6-backend-health--api-verification)
- [7. Run the Website (Terminal 2)](#7-run-the-website-terminal-2)
- [8. Run the Android App (Terminal 3 / Android Studio)](#8-run-the-android-app-terminal-3--android-studio)
- [9. API URL Configuration for Android](#9-api-url-configuration-for-android)
- [10. Connect & Check Physical Phone (POCO M4 Pro) with ADB](#10-connect--check-physical-phone-poco-m4-pro-with-adb)
- [11. Build, Install, and Launch Android APK](#11-build-install-and-launch-android-apk)
- [12. Run All Components Together (3-Terminal Workflow)](#12-run-all-components-together-3-terminal-workflow)
- [13. Stop, Restart, and Kill Stuck Servers](#13-stop-restart-and-kill-stuck-servers)
- [14. Troubleshooting Cookbook](#14-troubleshooting-cookbook)
- [15. Logs and Diagnostics](#15-logs-and-diagnostics)
- [16. Git Safety and Clean Working Tree](#16-git-safety-and-clean-working-tree)
- [17. Quick Command Reference](#17-quick-command-reference)

---

## 1. Prerequisites & Version Verification

Open **Windows PowerShell** (`Win + X` ➔ **Terminal** or **PowerShell**) and run these version checks:

```powershell
# 1. Check Git version
git --version
# Expected: git version 2.x.x

# 2. Check Node.js & npm version
node -v
npm -v
# Expected: Node v18+ (tested with v24.15.0), npm v9+ (tested with 11.12.1)

# 3. Check Java version
java -version
# Expected: Java 17 to 25 (tested with OpenJDK 25.0.3 JBR)

# 4. Check Android Debug Bridge (ADB)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" version
# Expected: Android Debug Bridge version 1.0.41+
```

> [!TIP]
> **Convenience Path Setup for PowerShell**:  
> To run `adb` and `java` directly without typing their full paths every time, run this command once to permanently append them to your user PATH:
> ```powershell
> [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools;C:\Program Files\Android\Android Studio\jbr\bin", "User")
> ```
> Restart PowerShell after running this.

---

## 2. First-Time Project Setup

### Step 2.1: Navigate to Project Directory
```powershell
cd D:\Moola-App
```

### Step 2.2: Verify Directory Structure
```powershell
Get-ChildItem
```
**Expected Output**:
```text
Directory: D:\Moola-App

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          23-10-2026  18:00                  android-app
d----          23-10-2026  18:00                  backend
d----          23-10-2026  18:00                  docs
d----          23-10-2026  18:00                  legacy
d----          23-10-2026  18:00                  website
-a---          23-10-2026  18:00           1658412 moola logo.png
-a---          23-10-2026  18:00             29183 organic_marketplace_blueprint (1).pdf
-a---          23-10-2026  18:00              5400 README.md
-a---          23-10-2026  18:00              8000 SETUP_GUIDE.md
```

### Step 2.3: Check Git Working Tree
```powershell
git status
```
*Expected*: `On branch master`, working tree clean.

### Step 2.4: Open Windows Firewall for Port 5000 (Required for Phone Testing)
Run this once in **PowerShell as Administrator** so your POCO M4 Pro can reach port 5000 over local Wi-Fi:
```powershell
New-NetFirewallRule -DisplayName "MOOLA Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Step 2.5: Install Website Dependencies
```powershell
cd D:\Moola-App\website
npm install
```

### Step 2.6: Test Android Source Compilation
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat compileDebugSources
```
*Expected*: `BUILD SUCCESSFUL`.

---

## 3. Environment & Secrets Configuration

The repository includes template files so you can configure environment variables safely without leaking secrets:

### Backend Configuration Template
- File location: [backend/.env.example](backend/.env.example)
- Primary configuration: [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties)

```properties
# Server Port (Default: 5000)
SERVER_PORT=5000

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/moola?retryWrites=true&w=majority

# JWT Secret Key (Minimum 32 characters / 256 bits)
JWT_SECRET=your-secure-random-256-bit-hex-secret-key-at-least-32-chars
```

To create a local configuration file:
```powershell
cd D:\Moola-App\backend
copy .env.example .env
```
> [!CAUTION]
> Never commit `.env` files containing real passwords or database credentials to Git! Both `backend/.env` and `website/.env` are ignored in `.gitignore`.

---

## 4. MongoDB Setup & Troubleshooting

The backend connects to MongoDB Atlas (`moolacluster`).

### Whitelisting Your Current Public IP Address
If you see the error:  
`javax.net.ssl.SSLException: (internal_error) Received fatal alert: internal_error`

This indicates that **your current public IP is not whitelisted in MongoDB Atlas**. MongoDB Atlas deliberately aborts the TLS handshake when an IP is not on its whitelist.

1. Find your public IP address in PowerShell:
   ```powershell
   (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip
   ```
   *(Example: `61.3.76.137`)*.
2. Open your browser and log in to [cloud.mongodb.com](https://cloud.mongodb.com).
3. Under **Security** in the left sidebar, click **Network Access**.
4. Click **+ Add IP Address**.
5. Choose:
   - **Option A (Recommended for Local Dev)**: Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - **Option B**: Click **Add Current IP Address** (it will auto-detect your IP).
6. Click **Confirm**. Wait 30–60 seconds for status to change to **Active** (green).

---

## 5. Run the Spring Boot Backend (Terminal 1)

The backend provides all REST APIs, authentication, and database access for the Android app and website.

### Terminal Location
Open a dedicated PowerShell window and navigate to:
```powershell
cd D:\Moola-App\backend
```

### Startup Command
Run using the official Gradle Wrapper:
```powershell
.\gradlew.bat bootRun
```
*(Note: If Maven is installed on your computer, `mvn spring-boot:run` is also fully supported)*.

### What Successful Startup Looks Like
```text
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.3.4)

...
Tomcat started on port 5000 (http) with context path '/'
Started MoolaBackendApplication in 4.2 seconds (process running for 5.1)
[DataSeedService] Pre-seeding initial database collections...
[DataSeedService] Seeded 8 pantry categories, admin account, and 2 verified makers.
```

### Pre-Seeded Demo Accounts
On startup, [DataSeedService.java](backend/src/main/java/com/moola/backend/service/DataSeedService.java) automatically seeds:
- **Admin**: `+91 90000 00000` / Password: `admin123`
- **Maker 1 (Ramesh Bhat)**: `+91 90000 00001` / Password: `admin123`
- **Maker 2 (Smt. Shailaja)**: `+91 90000 00002` / Password: `admin123`
- **Buyer (Arjun Sharma)**: `+91 90000 00003` / Password: `admin123`

### How to Stop the Backend
Press `Ctrl + C` in Terminal 1. When prompted `Terminate batch job (Y/N)?`, type `Y` and press `Enter`.

---

## 6. Backend Health & API Verification

In another PowerShell window, verify that the backend is responding:

```powershell
Invoke-RestMethod http://localhost:5000/api/v1/health
```

### Expected Output
```text
success message data
------- ------- ----
   True         @{status=healthy; service=MOOLA Spring Boot API; version=1.0.0; timestamp=...}
```

### Diagnosing Common HTTP Status Codes
| Status Code | Meaning | What to Check |
|---|---|---|
| **Unable to connect** | Server is not running | Verify Terminal 1 is open and shows `Tomcat started on port 5000`. |
| **HTTP 401 Unauthorized** | Missing or invalid JWT | Pass `Authorization: Bearer <token>` header for protected endpoints. |
| **HTTP 403 Forbidden** | Role permission denied | User role (`buyer`) cannot access seller or admin endpoints. |
| **HTTP 404 Not Found** | Incorrect endpoint URL | Verify endpoint path matches [README.md Section 7](README.md#7-backend-api-reference). |
| **HTTP 500 Internal Error** | Database connection failed | Whitelist your public IP in MongoDB Atlas. |

### Testing User Login from Terminal
```powershell
$body = @{ phone = "9000000003"; password = "buyer@123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 7. Run the Website (Terminal 2)

The website storefront is located in [website/](website/). It is powered by Vite.

### Terminal Location
Open a second dedicated PowerShell window:
```powershell
cd D:\Moola-App\website
```

### Start Development Server
```powershell
npm run dev
```

### What Successful Startup Looks Like
```text
  VITE v5.4.8  ready in 218 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Open in Browser
Visit: 👉 **[http://localhost:8080/](http://localhost:8080/)**

### Production Build & Preview Commands
To test the production compilation:
```powershell
# Compile production bundle into website/dist/
npm run build

# Preview production build locally
npm run preview
```

### How to Stop the Website
Press `Ctrl + C` in Terminal 2.

---

## 8. Run the Android App (Terminal 3 / Android Studio)

The Android app is located in [android-app/](android-app/) (Pure Java + XML).

### Option A: Using Android Studio (GUI Workflow)
1. Open **Android Studio**.
2. Click **File ➔ Open...** and select:  
   `D:\Moola-App\android-app`
3. Wait for the bottom status bar to display: `Gradle sync finished`.
4. In the top toolbar device selector, select your running emulator or your connected **POCO M4 Pro**.
5. Click the green **Run (▶)** button (or press `Shift + F10`).

---

### Option B: Terminal Build via Gradle Wrapper
```powershell
cd D:\Moola-App\android-app

# 1. Compile debug Java sources
.\gradlew.bat compileDebugSources

# 2. Build debug APK
.\gradlew.bat assembleDebug
```
**Verified APK Output Path**:  
`D:\Moola-App\android-app\app\build\outputs\apk\debug\app-debug.apk` (Size: **8.89 MB**).

---

## 9. API URL Configuration for Android

### Understanding Client Network Addresses
- **Laptop Browser**: Reaches backend on `http://localhost:5000`.
- **Android Studio Emulator**: Must use `http://10.0.2.2:5000/`. (The emulator routes `10.0.2.2` to the host computer's `127.0.0.1`).
- **Physical Phone (POCO M4 Pro)**: **Must use your laptop's Wi-Fi LAN IP** (e.g. `http://192.168.1.40:5000/`). A physical phone cannot use `localhost` or `10.0.2.2`.

### Step 9.1: Find Your Laptop's LAN IPv4 Address
In PowerShell:
```powershell
ipconfig
```
Look for **Wireless LAN adapter Wi-Fi** ➔ **IPv4 Address** (e.g., `192.168.1.40`).

### Step 9.2: Test Connectivity from Phone Browser
1. Make sure your phone and laptop are on the **exact same Wi-Fi network**.
2. Open Chrome on your POCO M4 Pro.
3. In the address bar, type:
   ```text
   http://192.168.1.40:5000/api/v1/health
   ```
   *(Replace with your actual laptop IP)*.
4. If it returns `{"status":"healthy"}`, your phone can communicate with the backend!

### Step 9.3: Update Android App Base URL
In [android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java](android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L20):
```java
// For Android Emulator:
public static final String DEFAULT_BASE_URL = "http://10.0.2.2:5000/";

// For POCO M4 Pro (Physical Phone over Wi-Fi):
// public static final String DEFAULT_BASE_URL = "http://192.168.1.40:5000/";
```

> [!NOTE]
> The app includes [network_security_config.xml](android-app/app/src/main/res/xml/network_security_config.xml) which explicitly permits cleartext HTTP traffic for local development subnets (`192.168.*`, `10.0.2.2`, `localhost`).

---

## 10. Connect & Check Physical Phone (POCO M4 Pro) with ADB

### Step 10.1: MIUI / HyperOS Developer Options on POCO M4 Pro
On your POCO M4 Pro:
1. Open **Settings ➔ About Phone**.
2. Tap **OS Version** (or **MIUI Version**) **7 times rapidly** until you see *"You are now a developer!"*.
3. Go to **Settings ➔ Additional Settings ➔ Developer Options**.
4. Enable these three critical settings:
   - ✅ **USB Debugging**: `ON`
   - ✅ **Install via USB**: `ON` *(Crucial: if OFF, installs fail with `INSTALL_FAILED_USER_RESTRICTED`)*.
   - ✅ **Wireless Debugging**: `ON` *(Confirm the Wi-Fi network prompt)*.

---

### Step 10.2: Reconnect via Wireless Debugging
1. On the phone, tap **Wireless Debugging**.
2. Look at **"IP address & Port"** (e.g., `192.168.1.105:39481`).
   *(Note: The connection port changes whenever Wi-Fi reconnects or the phone locks)*.
3. In PowerShell on your laptop, connect:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" connect 192.168.1.105:39481
   ```
4. Verify connected devices:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   ```
   **Expected Output**:
   ```text
   List of devices attached
   192.168.1.105:39481    device
   ```

### Troubleshooting Device States
- If status is `unauthorized`: Unlock the POCO M4 Pro and tap **Always allow on this network**.
- If status is `offline`: Run `adb kill-server`, then `adb start-server`, then reconnect.

---

## 11. Build, Install, and Launch Android APK

### Step 11.1: Build the APK
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug
```

### Step 11.2: Install on Connected Phone or Emulator
```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb install -r "D:\Moola-App\android-app\app\build\outputs\apk\debug\app-debug.apk"
```
*Expected Output*:
```text
Performing Streamed Install
Success
```

### Step 11.3: Launch App on Device
```powershell
& $adb shell am start -n com.moola.app/.ui.auth.SplashActivity
```

### Step 11.4: Stream Real-Time Application Logs
```powershell
& $adb logcat -s "MOOLA:*" "OkHttp:*" "AndroidRuntime:*"
```

---

## 12. Run All Components Together (3-Terminal Workflow)

During daily development, keep **three terminal windows open in this order**:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
|            TERMINAL 1             |            TERMINAL 2             |            TERMINAL 3             |
|        Spring Boot Backend        |        Website (Vite / npm)       |        Android App (Gradle/ADB)   |
|        cd D:\Moola-App\backend    |        cd D:\Moola-App\website    |        cd D:\Moola-App\android-app|
|        .\gradlew.bat bootRun      |        npm run dev                |        .\gradlew.bat assemble     |
|        [KEEP OPEN]                |        [KEEP OPEN]                |        [RUN AS NEEDED]            |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

1. **Start Terminal 1 First**: Ensure backend shows `Tomcat started on port 5000`.
2. **Start Terminal 2 Second**: Storefront opens on `http://localhost:8080`.
3. **Launch Terminal 3 Third**: Deploy updated APK to emulator or POCO M4 Pro.

---

## 13. Stop, Restart, and Kill Stuck Servers

### A. Stop Foreground Server Normally
Press `Ctrl + C` in the terminal running the process.

---

### B. Find Process Listening on Port 5000
If you see `Port 5000 is already in use` or need to verify whether the backend is still running:
```powershell
Get-NetTCPConnection -State Listen -LocalPort 5000 -ErrorAction SilentlyContinue |
Select-Object LocalAddress, LocalPort, OwningProcess
```
*If no output is returned, port 5000 is completely free.*

---

### C. Identify the Owning Process
Using the numeric process ID (`OwningProcess`) returned above (for example, `12928`):
```powershell
Get-Process -Id 12928
```
*(Replace `12928` with your actual numeric PID)*.

---

### D. Stop Only the Verified Stuck Process
Once you have confirmed that the process belongs to the stuck Spring Boot server:
```powershell
Stop-Process -Id 12928 -Force
```
*(Replace `12928` with your actual numeric PID)*.

> [!WARNING]
> Never blindly terminate all `java.exe` processes. Android Studio itself runs on Java; killing all Java processes will crash your IDE!

---

### E. Safe Restart Sequence
1. Verify the port is free:  
   `Get-NetTCPConnection -State Listen -LocalPort 5000 -ErrorAction SilentlyContinue`
2. Start backend again:  
   `cd D:\Moola-App\backend && .\gradlew.bat bootRun`
3. Test health:  
   `Invoke-RestMethod http://localhost:5000/api/v1/health`

---

## 14. Troubleshooting Cookbook

| Symptom | Likely Cause | Diagnostic Check | Verified Solution |
|---|---|---|---|
| `mvn : The term 'mvn' is not recognized` | Maven is not installed in PATH | `mvn -v` | Use the official Gradle Wrapper: `.\gradlew.bat bootRun`. |
| `java : The term 'java' is not recognized` | Java not in session PATH | `java -version` | Set session PATH:<br>`$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`<br>`$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"` |
| `fatal alert: internal_error` (MongoDB) | Laptop public IP not whitelisted in Atlas | `(Invoke-RestMethod https://api.ipify.org?format=json).ip` | Log in to [cloud.mongodb.com](https://cloud.mongodb.com) ➔ Network Access ➔ Add your current public IP address. |
| `Port 5000 is already in use` | Old background process still running | `Get-NetTCPConnection -State Listen -LocalPort 5000` | Find the PID and run `Stop-Process -Id <PID> -Force`. |
| `Port 8080 is in use, using 8081` | Another tab or process is using 8080 | Check terminal output | Visit `http://localhost:8081/` or run `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force`. |
| Phone shows "Unable to reach server" | Phone cannot reach laptop IP on port 5000 | Open `http://<laptop-ip>:5000/api/v1/health` in Chrome on POCO M4 Pro | 1. Ensure phone & laptop are on same Wi-Fi.<br>2. Run Windows Firewall rule command (Section 2.4).<br>3. Verify `ApiClient.java` uses laptop LAN IP, not `10.0.2.2`. |
| `INSTALL_FAILED_USER_RESTRICTED` | MIUI blocked automated install | `adb install` fails | On POCO M4 Pro, open Developer Options and turn **ON** "Install via USB". |
| `device unauthorized` | Phone hasn't accepted RSA key | `adb devices` shows `unauthorized` | Unlock phone, check "Always allow on this network", and tap **Allow**. |
| `failed to connect to 192.168.x.x:port` | Dynamic Wi-Fi debug port changed | `adb connect` refused | Check the updated port number on the phone's Wireless Debugging screen. |
| `Cleartext HTTP traffic not permitted` | Android 9+ security policy | Logcat shows `IOException` | Project includes `network_security_config.xml` linked in `AndroidManifest.xml`. |

---

## 15. Logs and Diagnostics

| Component | Log Location / Inspection Method |
|---|---|
| **Spring Boot Backend** | Foreground console output in Terminal 1. |
| **Website (Vite)** | Foreground console in Terminal 2 + Browser DevTools Console (`F12`). |
| **Android Native App** | Android Studio Logcat window or: `adb logcat -s "MOOLA:*" "OkHttp:*"`. |
| **Gradle Build Output** | Terminal build logs in `android-app/build/reports/problems/`. |
| **Network Listeners** | `Get-NetTCPConnection -State Listen -LocalPort 5000`. |

> [!CAUTION]
> Never share screenshots containing database credentials, JWT access tokens, or populated `.env` files in public bug trackers or forums.

---

## 16. Git Safety and Clean Working Tree

Check your changes before committing:

```powershell
cd D:\Moola-App

# Check modified and untracked files
git status

# Inspect exact code diffs
git diff

# View commit history
git log -n 5 --oneline
```

---

## 17. Quick Command Reference

| Action | Working Directory | PowerShell Command |
|---|---|---|
| **Navigate to Project** | Any | `cd D:\Moola-App` |
| **Check Toolchain** | `D:\Moola-App` | `java -version; git --version; node -v` |
| **Start Backend** | `D:\Moola-App\backend` | `.\gradlew.bat bootRun` |
| **Test Backend Health** | Any | `Invoke-RestMethod http://localhost:5000/api/v1/health` |
| **Start Website** | `D:\Moola-App\website` | `npm run dev` |
| **Compile Website** | `D:\Moola-App\website` | `npm run build` |
| **Build Android APK** | `D:\Moola-App\android-app` | `.\gradlew.bat assembleDebug` |
| **Check Connected Devices**| Any | `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices` |
| **Install APK on Device**| `D:\Moola-App\android-app` | `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk` |
| **Launch Android App** | Any | `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.moola.app/.ui.auth.SplashActivity` |
| **Stream Android Logs** | Any | `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -s "MOOLA:*"` |
| **Find Port 5000 PID** | Any | `Get-NetTCPConnection -State Listen -LocalPort 5000` |
| **Stop Stuck Process** | Any | `Stop-Process -Id <PID> -Force` |
| **Check Git Changes** | `D:\Moola-App` | `git status` |
