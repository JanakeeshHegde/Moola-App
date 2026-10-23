# MOOLA — Terminal-First Development Setup Guide

This guide details how to develop, build, test, and run all components of the **MOOLA** platform directly from standard Windows terminals (PowerShell or Command Prompt) without relying on custom `.bat` startup files or double-clicking.

---

## 1. System Requirements & Prerequisites

Ensure the following tools are available on your development workstation:

| Tool | Minimum Version | Path / Verification Command |
|---|---|---|
| **Java Development Kit (JDK)** | Java 17+ (or bundled JBR) | `java -version` |
| **Node.js & npm** | Node v18+, npm v9+ | `node -v` / `npm -v` |
| **Android SDK** | Android 34 (API 34) | `adb version` (in Android SDK `platform-tools`) |
| **Gradle** | 8.6+ (wrapper included) | Bundled as `.\gradlew.bat` in project directories |

> [!TIP]
> If `java` or `adb` are not yet added to your permanent system PATH, configure them for your current PowerShell terminal session:
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
> $env:PATH = "$env:JAVA_HOME\bin;C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools;$env:PATH"
> ```

---

## 2. Multi-Terminal Development Workflow

During local development, open **three separate terminal tabs**:
1. **Terminal 1**: Spring Boot REST backend
2. **Terminal 2**: Web storefront dev server
3. **Terminal 3**: Android native app build and device deployment

```
+---------------------------+---------------------------+---------------------------+
|        TERMINAL 1         |        TERMINAL 2         |        TERMINAL 3         |
|   Spring Boot Backend     |   Website (Vite / npm)    |   Android App (Gradle)    |
|   Port 5000               |   Port 8080               |   Device / Emulator       |
|   .\gradlew.bat bootRun   |   npm run dev             |   .\gradlew.bat assemble  |
+---------------------------+---------------------------+---------------------------+
```

---

## 3. Terminal 1: Java Spring Boot Backend

The backend is located in [backend/](file:///d:/Moola-App/backend). It uses Spring Boot 3.3.4 with Spring Data MongoDB and Spring Security (stateless JWT).

### Step 1: Navigate to Backend
```powershell
cd d:\Moola-App\backend
```

### Step 2: Start the Backend Server
Run using the official Gradle Wrapper:
```powershell
.\gradlew.bat bootRun
```

*(Alternatively, if standard Maven is installed on your workstation)*:
```powershell
mvn spring-boot:run
```
*(Or if using the Maven wrapper)*:
```powershell
.\mvnw.cmd spring-boot:run
```

### Expected Startup Output
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
Started MoolaBackendApplication in 4.182 seconds (process running for 4.8)
[DataSeedService] Pre-seeding initial database collections...
[DataSeedService] Seeded 8 pantry categories, admin account, and 2 verified makers.
```

### Health Check Verification
In any terminal, verify the server is responding:
```powershell
curl http://localhost:5000/api/health
```
Response:
```json
{"status":"UP","app":"MOOLA Backend","version":"1.0.0"}
```

### Stopping the Server
Press `Ctrl + C` in Terminal 1.

### Environment Configuration & Secrets
Configuration is defined in [backend/src/main/resources/application.yml](file:///d:/Moola-App/backend/src/main/resources/application.yml). To override credentials securely without committing them to git:
```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@cluster.mongodb.net/moola?retryWrites=true&w=majority"
$env:JWT_SECRET = "your-secure-256-bit-secret-key-here-minimum-32-characters"
$env:SERVER_PORT = "5000"
.\gradlew.bat bootRun
```

---

## 4. Terminal 2: Website Storefront

The web storefront is located in [website/](file:///d:/Moola-App/website). It uses HTML5, CSS3, ES6 JavaScript, and Vite for development and bundling.

### Step 1: Navigate to Website
```powershell
cd d:\Moola-App\website
```

### Step 2: First-Time Dependency Installation
```powershell
npm install
```

### Step 3: Start the Development Server
```powershell
npm run dev
```
Expected output:
```text
  VITE v5.4.8  ready in 218 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Visit **[http://localhost:8080/](http://localhost:8080/)** in your browser.

### Step 4: Production Build & Preview
To compile the production bundle:
```powershell
npm run build
```
Output is generated in `website/dist/`.

To preview the production build locally:
```powershell
npm run preview
```

### Stopping the Dev Server
Press `Ctrl + C` in Terminal 2.

---

## 5. Terminal 3: Native Android Application

The Android app is located in [android-app/](file:///d:/Moola-App/android-app). It is built with **Java and XML** targeting Android SDK 34 with minSdk 26.

### Step 1: Navigate to Android App
```powershell
cd d:\Moola-App\android-app
```

### Step 2: Compile Debug Sources
```powershell
.\gradlew.bat compileDebugSources
```
Expected output:
```text
BUILD SUCCESSFUL in 8s
17 actionable tasks: 2 executed, 15 up-to-date
```

### Step 3: Build Debug APK
```powershell
.\gradlew.bat assembleDebug
```
Output APK path:  
`android-app\app\build\outputs\apk\debug\app-debug.apk`

### Step 4: Verify Device or Emulator Connection
Check connected devices via Android Debug Bridge (`adb`):
```powershell
adb devices
```
Expected output:
```text
List of devices attached
emulator-5554   device
```

### Step 5: Install APK onto Device / Emulator
```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```
Expected output:
```text
Performing Streamed Install
Success
```

### Step 6: Launch App on Device from Terminal
```powershell
adb shell am start -n com.moola.app/.ui.splash.SplashActivity
```
Expected output:
```text
Starting: Intent { cmp=com.moola.app/.ui.splash.SplashActivity }
```

---

## 6. Running in Android Studio (GUI Alternative)

If you prefer using the Android Studio IDE for UI development:
1. Launch **Android Studio**.
2. Select **Open** and choose the directory: `d:\Moola-App\android-app`.
3. Wait for Gradle sync to complete.
4. Select your running emulator or connected device in the top device selector.
5. Press `Shift + F10` (or click the green **Run ▶** button).

---

## 7. Quality Assurance & Testing Commands

Execute these commands directly from your terminal to validate changes before pushing code:

### Backend Quality Checks
```powershell
cd d:\Moola-App\backend

# Run unit and integration tests
.\gradlew.bat test

# Run full project build (compilation + tests + packaging)
.\gradlew.bat build
```

### Android Quality Checks
```powershell
cd d:\Moola-App\android-app

# Run local JVM unit tests
.\gradlew.bat testDebugUnitTest

# Run lint checks
.\gradlew.bat lintDebug

# Clean and rebuild entire APK
.\gradlew.bat clean assembleDebug
```

### Website Quality Checks
```powershell
cd d:\Moola-App\website

# Validate production bundling
npm run build
```

---

## 8. Network Configuration in Local Development

| Client | Backend URL | Why / Notes |
|---|---|---|
| **Website (Browser)** | `http://localhost:5000/api/` | Runs on the same host machine; connects directly to localhost. |
| **Android Emulator** | `http://10.0.2.2:5000/api/` | Android emulators map `10.0.2.2` to the host machine's `127.0.0.1`. Pre-configured in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java). |
| **Physical Android Phone** | `http://<YOUR-LAN-IP>:5000/api/` | Physical devices cannot resolve `localhost` or `10.0.2.2`. Find your PC's IP using `ipconfig` (e.g. `192.168.1.45`) and update `BASE_URL` in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L16). |

---

## 9. Pre-Seeded Test Credentials

The backend automatically creates these demo accounts on startup:

| Role | Phone | Password | Access / Capabilities |
|---|---|---|---|
| **Administrator** | `+91 90000 00000` | `admin123` | Analytics dashboard, maker KYC approvals, complaint ticket resolution. |
| **Artisan Maker 1** | `+91 90000 00001` | `admin123` | Ramesh Bhat (Kodagu Raw Honey) — Product management & inventory. |
| **Artisan Maker 2** | `+91 90000 00002` | `admin123` | Smt. Shailaja (Malnad Homemade Crisps) — Product catalog. |
| **Verified Buyer** | `+91 90000 00003` | `admin123` | Arjun Sharma — Order placement, WhatsApp chat, complaints. |

---

## 10. Troubleshooting FAQ

### Q: "Port 5000 is already in use"
Find the process ID and terminate it:
```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id <OwningProcessId>
```

### Q: "JAVA_HOME is not set"
Set the environment variable in your PowerShell terminal:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

### Q: "adb command not found"
Add Android SDK platform-tools to your session PATH:
```powershell
$env:PATH = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools;$env:PATH"
```

### Q: "MongoDB connection timeout"
Log in to MongoDB Atlas and verify that your current public IP address is added to **Network Access ➔ IP Access List**.
