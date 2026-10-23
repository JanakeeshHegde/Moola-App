# MOOLA — Complete Local Development Guide for Windows 11

This guide provides the official terminal-first instructions for developing, building, testing, and running the **MOOLA** platform on Windows 11.

---

## 1. Environment & Architecture Overview

The MOOLA project consists of three active components:

```
                          ┌─────────────────────────────────────┐
                          │     Spring Boot Backend (Java 17)   │
                          │     Port: 5000                      │
                          │     Database: MongoDB Atlas         │
                          └──────────────────┬──────────────────┘
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     │                       │                       │
                     ▼                       ▼                       ▼
          ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
          │   Website (Vite)    │ │   Android Emulator  │ │ Physical Android    │
          │   Port: 8080        │ │   (Pixel 8 / API34) │ │ (POCO M4 Pro Wi-Fi) │
          │   URL: localhost    │ │   URL: 10.0.2.2     │ │ URL: LAN IPv4       │
          └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

- **Target Backend**: Java 17 + Spring Boot 3.3.4 (managed by Gradle wrapper `.\gradlew.bat`).
- **Target Frontend (Android)**: Native Java + XML (managed by Gradle wrapper `.\gradlew.bat`).
- **Target Frontend (Web)**: HTML5, CSS3, ES6 JavaScript (managed by npm + Vite).
- **Database**: MongoDB Atlas (`moolacluster`).
- **Development Tooling**: PowerShell 7 / Windows Terminal. **Zero custom `.bat` launchers**.

---

## 2. First-Time Machine Setup

### Step 1: Environment Variables Setup (PowerShell)
To ensure `java` and `adb` are accessible in your terminal sessions:
```powershell
# Configure Java from Android Studio JBR
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Configure Android SDK platform-tools (ADB)
$env:PATH = "$env:JAVA_HOME\bin;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:PATH"
```

### Step 2: Website Dependencies
Navigate to the website directory and install dependencies:
```powershell
cd D:\Moola-App\website
npm install
```

### Step 3: Backend Configuration Template
Copy the environment template in the backend:
```powershell
cd D:\Moola-App\backend
copy .env.example .env
```
*(The default configuration connects to the existing MongoDB Atlas development cluster)*.

### Step 4: Verify Android Toolchain
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat compileDebugSources
```

---

## 3. Daily Development Workflow (3-Terminal Architecture)

For daily development, open **three terminal tabs**:

### Terminal 1: Spring Boot Backend
1. Open PowerShell and navigate to `backend/`:
   ```powershell
   cd D:\Moola-App\backend
   ```
2. Start the backend:
   ```powershell
   .\gradlew.bat bootRun
   ```
   *(Or if Maven is installed: `mvn spring-boot:run`)*.
3. **Verify Successful Startup**:
   Look for this log line:
   ```text
   Started MoolaBackendApplication in X.XXX seconds
   Tomcat started on port 5000 (http) with context path '/'
   ```
4. **Health Check**:
   Open another terminal or browser:
   ```powershell
   curl http://localhost:5000/api/health
   ```
   Response: `{"status":"UP","app":"MOOLA Backend","version":"1.0.0"}`
5. **To Stop**: Press `Ctrl + C`.

---

### Terminal 2: Website Storefront
1. Open PowerShell and navigate to `website/`:
   ```powershell
   cd D:\Moola-App\website
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
3. **Verify Successful Startup**:
   ```text
   VITE v5.4.8 ready in 218 ms
   ➜  Local:   http://localhost:8080/
   ```
4. **Open in Browser**:
   Navigate to: 👉 **[http://localhost:8080/](http://localhost:8080/)**
5. **To Stop**: Press `Ctrl + C`.

---

### Terminal 3: Native Android App (Device / Emulator)
1. Open PowerShell and navigate to `android-app/`:
   ```powershell
   cd D:\Moola-App\android-app
   ```
2. **Verify Connected Device or Emulator**:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   ```
   *Expected*: Shows your emulator (e.g. `emulator-5554`) or POCO M4 Pro (e.g. `192.168.1.105:39481`).
3. **Assemble Debug APK**:
   ```powershell
   .\gradlew.bat assembleDebug
   ```
4. **Install onto Device**:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
   ```
5. **Launch Application**:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.moola.app/.ui.auth.SplashActivity
   ```

*(Alternatively, open `D:\Moola-App\android-app` in Android Studio and press `Shift + F10`)*.

---

## 4. Client-to-Backend Network Addresses

| Client | Backend Base URL | Explanation |
|---|---|---|
| **Website (Browser)** | `http://localhost:5000/api/` | Runs directly on the laptop; connects to localhost. |
| **Android Emulator** | `http://10.0.2.2:5000/api/` | The emulator routes `10.0.2.2` to the host machine's `127.0.0.1`. Pre-configured in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java). |
| **POCO M4 Pro (Wi-Fi)** | `http://<YOUR-LAN-IP>:5000/api/` | Physical devices must connect via the laptop's Wi-Fi IP (e.g. `http://192.168.1.45:5000/api/`). |

### Finding Your Laptop's LAN IP:
```powershell
ipconfig
```
Look for **IPv4 Address** under your active Wi-Fi adapter.

### Opening Port 5000 on Windows Firewall for Physical Device:
```powershell
New-NetFirewallRule -DisplayName "MOOLA Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 5. Pre-Seeded Test Credentials

On startup, [DataSeedService.java](file:///d:/Moola-App/backend/src/main/java/com/moola/backend/service/DataSeedService.java) automatically populates demo data:

| Role | Phone | Password | Access / Capabilities |
|---|---|---|---|
| **Administrator** | `+91 90000 00000` | `admin123` | View sales metrics, review seller KYC, approve products, resolve complaint tickets. |
| **Artisan Maker 1** | `+91 90000 00001` | `admin123` | Ramesh Bhat (Kodagu Raw Honey) — Product management & inventory. |
| **Artisan Maker 2** | `+91 90000 00002` | `admin123` | Smt. Shailaja (Malnad Homemade Crisps) — Product catalog. |
| **Verified Buyer** | `+91 90000 00003` | `admin123` | Arjun Sharma — Order placement, WhatsApp chat, complaints. |

---

## 6. Quality Checks & Verification Commands

Run these terminal commands before committing code:

```powershell
# 1. Backend Unit Tests
cd D:\Moola-App\backend
.\gradlew.bat test

# 2. Website Production Build Validation
cd D:\Moola-App\website
npm run build

# 3. Android Local Unit Tests & Compilation
cd D:\Moola-App\android-app
.\gradlew.bat testDebugUnitTest
.\gradlew.bat compileDebugSources
```

For device setup details, see [docs/ANDROID_DEVICE_SETUP.md](file:///d:/Moola-App/docs/ANDROID_DEVICE_SETUP.md).  
For troubleshooting common issues, see [docs/TROUBLESHOOTING.md](file:///d:/Moola-App/docs/TROUBLESHOOTING.md).
