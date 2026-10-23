# MOOLA — Developer Setup & Run Guide

Welcome to **MOOLA**! This guide walks you through setting up and running each part of the project using standard terminal commands:
1. **The Backend** (Spring Boot server & database API)
2. **The Website** (Web storefront development server)
3. **The Android App** (Native Android application via Gradle & ADB)

For comprehensive CLI instructions, see [docs/TERMINAL_SETUP.md](file:///d:/Moola-App/docs/TERMINAL_SETUP.md).

---

## ☕ 1. Running the Spring Boot Backend

The backend is located in [backend/](file:///d:/Moola-App/backend). It provides REST APIs for authentication, product catalogs, order requests, and MongoDB database storage.

### Step 1: Open PowerShell in `backend/`
```powershell
cd d:\Moola-App\backend
```

### Step 2: Start the Server
Run using the Gradle wrapper:
```powershell
.\gradlew.bat bootRun
```
*(Or with Maven if installed: `mvn spring-boot:run`)*.

### Step 3: Verify It Is Running
Once started, verify the health-check endpoint:
```powershell
curl http://localhost:5000/api/health
```
Response:
```json
{"status":"UP","app":"MOOLA Backend","version":"1.0.0"}
```

To stop the server: Press `Ctrl + C`.

---

## 🌐 2. Running the Website

The website is located in [website/](file:///d:/Moola-App/website). It uses HTML5, CSS3, ES6 JavaScript, and Vite.

### Step 1: Open PowerShell in `website/`
```powershell
cd d:\Moola-App\website
```

### Step 2: Install Dependencies (First-Time Only)
```powershell
npm install
```

### Step 3: Start Development Server
```powershell
npm run dev
```

Visit **[http://localhost:8080/](http://localhost:8080/)** in your browser.

To compile a production build:
```powershell
npm run build
```

To stop the dev server: Press `Ctrl + C`.

---

## 📱 3. Building & Running the Native Android App

The Android app is located in [android-app/](file:///d:/Moola-App/android-app). It is written in pure **Java and XML** targeting Android SDK 34 with minSdk 26.

### Option A: Via Terminal (Gradle & ADB)
```powershell
cd d:\Moola-App\android-app

# 1. Compile debug sources
.\gradlew.bat compileDebugSources

# 2. Build debug APK
.\gradlew.bat assembleDebug

# 3. Check connected device or emulator
adb devices

# 4. Install onto device/emulator
adb install -r app\build\outputs\apk\debug\app-debug.apk

# 5. Launch the app
adb shell am start -n com.moola.app/.ui.splash.SplashActivity
```
Output APK path: [android-app/app/build/outputs/apk/debug/app-debug.apk](file:///d:/Moola-App/android-app/app/build/outputs/apk/debug/app-debug.apk)

### Option B: Using Android Studio GUI
1. Open **Android Studio**.
2. Click **File** ➔ **Open...** ➔ select `d:\Moola-App\android-app`.
3. Wait for Gradle sync to complete.
4. Select your virtual device or connected phone.
5. Click **Run 'app'** (`Shift + F10`).

---

## 🔑 4. Demo Login Accounts (Pre-Seeded)

When the backend starts, [DataSeedService.java](file:///d:/Moola-App/backend/src/main/java/com/moola/backend/service/DataSeedService.java) automatically initializes sample food items and these test accounts:

| Role | Phone Number | Password | What You Can Test |
|---|---|---|---|
| **Admin** | `+91 90000 00000` | `admin123` | View sales metrics, review seller KYC, approve products, resolve complaint tickets. |
| **Maker (Seller)** | `+91 90000 00001` | `admin123` | Seller Dashboard: list new homemade snacks/honey, set prices, check orders. |
| **Maker 2** | `+91 90000 00002` | `admin123` | Smt. Shailaja (Malnad Homemade Crisps). |
| **Buyer** | `+91 90000 00003` | `admin123` | Browse catalog, place orders, chat with makers on WhatsApp, file complaints. |

---

## 🔌 5. Local Networking Overview

- **Android Emulator**: Uses `http://10.0.2.2:5000/api/` (pre-configured in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java)).
- **Physical Android Phone**: Update `BASE_URL` in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L16) to your PC's local Wi-Fi IP (e.g. `http://192.168.1.50:5000/api/`).
- **Website**: Connects directly to `http://localhost:5000/api/`.
- **Database**: Configured in [application.yml](file:///d:/Moola-App/backend/src/main/resources/application.yml) connecting to MongoDB Atlas.
