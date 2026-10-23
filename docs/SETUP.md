# MOOLA — Developer Setup & Run Guide

This guide details how to set up, configure, build, and run the **MOOLA** application on your local machine.

---

## Prerequisites

1. **Java Development Kit (JDK 17 or JDK 21/25)**
   - Verify with: `java -version`
   - If using Android Studio, the bundled JBR (`C:\Program Files\Android\Android Studio\jbr`) works out of the box.
2. **Android SDK**
   - Installed via Android Studio (`platforms/android-34`, `build-tools/34.0.0` or higher).
3. **Maven (Optional / Bundled)**
   - For backend compilation (`mvn`).

---

## 1. Running the Spring Boot Backend

The backend listens on **Port 5000** and connects to MongoDB Atlas.

### Step 1: Open Terminal in `backend/`
```powershell
cd d:\Moola-App\backend
```

### Step 2: Set JAVA_HOME & Start Application
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
mvn spring-boot:run
```

### Automatic Data Seeding
On first startup, the backend automatically seeds:
- **Administrator**: `+91 90000 00000` (Password: `admin123`)
- **Artisan Makers**: `+91 90000 00001` (Ramesh Bhat, Kodagu Raw Honey), `+91 90000 00002` (Smt. Shailaja, Malnad Crisps)
- **Verified Buyers**: `+91 90000 00003` (Arjun Sharma), `+91 90000 00004` (Priya Rao)
- **8 Categories**: Chips & Snacks, Raw Forest Honey, Traditional Sweets, Pickles, Spices, etc.
- **Sample Verified Products**: Sun-Dried Jackfruit Crisps, Raw Coorg Multiflora Honey, Byadgi Chilli Powder, etc.

---

## 2. Building & Running the Native Android App

### Option A: Via Android Studio (Recommended)
1. Launch **Android Studio**.
2. Select **Open** and choose `d:\Moola-App\android-app`.
3. Let Gradle sync automatically (Gradle 9.2.0 wrapper is pre-configured).
4. Select a virtual device (e.g. `Medium_Phone_API_37.0` or any API 26+ device).
5. Click **Run 'app'** (`Shift + F10`).

### Option B: Via Command Line
```powershell
cd d:\Moola-App\android-app
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\hegde\AppData\Local\Android\Sdk"

# Compile Debug Sources
.\gradlew.bat compileDebugSources

# Assemble Debug APK
.\gradlew.bat assembleDebug

# Install on connected Device or running Emulator
.\gradlew.bat installDebug
```
The output APK is generated at:  
`android-app/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Running the Standalone Website

The web frontend is completely static and browser-compatible.

### Option A: Local Python Web Server (Port 8080)
```powershell
python -m http.server 8080 --directory d:\Moola-App\website
```
Open your browser to:  
`http://localhost:8080/index.html`

### Option B: Direct File Opening
Double-click `website/index.html` to open it in Chrome, Edge, or Firefox.

---

## 4. Network Configuration Notes

- **Android Virtual Device (Emulator)**: The Android app uses `http://10.0.2.2:5000/` to communicate with the host machine's Spring Boot server. This requires zero configuration.
- **Physical Android Device**: When testing over local Wi-Fi, update `ApiClient.java` with your workstation's local LAN IP (e.g., `http://192.168.1.50:5000/`).
- **MongoDB Atlas**: The database connection string is configured in `backend/src/main/resources/application.properties`. If connecting from a new network, add your public IP address to the MongoDB Atlas Network Access whitelist.
