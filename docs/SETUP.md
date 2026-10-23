# MOOLA — Complete Beginner-Friendly Setup & Run Guide

Welcome to **MOOLA**! This guide walks you through running each part of the project step-by-step:
1. **The Website** (Storefront in your web browser)
2. **The Backend** (Spring Boot server & database API)
3. **The Android App** (Native Android phone application)

---

## ⚡ Super-Fast Method: 1-Click Launchers

For Windows users, 3 double-clickable batch files are ready in the root folder:

| File | What It Does |
|---|---|
| [run-website.bat](file:///d:/Moola-App/run-website.bat) | Starts the local web server and automatically opens `http://localhost:8080/index.html` in your default browser. |
| [run-backend.bat](file:///d:/Moola-App/run-backend.bat) | Starts the Spring Boot backend on port 5000 using the pre-packaged Gradle wrapper (no Maven installation needed!). |
| [run-android.bat](file:///d:/Moola-App/run-android.bat) | Builds the debug APK and installs it onto your running Android emulator or connected phone. |

---

## 🌐 1. Running the Website

The website is located in [website/](file:///d:/Moola-App/website). It does not require any build step or NPM installation.

### Method A: Local Web Server (Recommended)
1. Open Windows PowerShell or Command Prompt.
2. Run this command:
   ```powershell
   python -m http.server 8080 --directory "d:\Moola-App\website"
   ```
3. Open your browser to:  
   👉 **[http://localhost:8080/index.html](http://localhost:8080/index.html)**

### Method B: Double-Click Directly
Simply navigate to `d:\Moola-App\website\` in Windows File Explorer and double-click [index.html](file:///d:/Moola-App/website/index.html). It will open immediately in Chrome, Edge, or Firefox.

### What You Can Explore on the Website:
- **Homepage ([index.html](file:///d:/Moola-App/website/index.html))**: Brand hero banner, category navigation (Chips, Honey, Sweets, Pickles, Spices), live search with debounce, product catalog, and WhatsApp direct ordering modal.
- **Seller Onboarding ([seller.html](file:///d:/Moola-App/website/seller.html))**: Maker registration and KYC verification.
- **Customer Care ([complaints.html](file:///d:/Moola-App/website/complaints.html))**: 48-hour SLA grievance and complaint ticketing.
- **Privacy & GDPR ([account-deletion.html](file:///d:/Moola-App/website/account-deletion.html))**: User account erasure requests.

---

## ☕ 2. Running the Spring Boot Backend

The backend is located in [backend/](file:///d:/Moola-App/backend). It provides REST APIs for authentication, product catalogs, order requests, and MongoDB database storage.

### Step 1: Open PowerShell
Press `Win + X` and select **Terminal** or **PowerShell**, then navigate to the backend folder:
```powershell
cd d:\Moola-App\backend
```

### Step 2: Start the Server
Run the Gradle wrapper:
```powershell
.\gradlew.bat bootRun
```
*(The script automatically uses Android Studio's bundled Java runtime — you do not need to configure `JAVA_HOME` or install Maven manually).*

### Step 3: Verify It Is Running
Once started, you will see a log line similar to:
```text
Started MoolaBackendApplication in 4.2 seconds
```
Open your browser to:
👉 **[http://localhost:5000/api/health](http://localhost:5000/api/health)**  
You should see:
```json
{
  "status": "UP",
  "app": "MOOLA Backend",
  "version": "1.0.0"
}
```

---

## 📱 3. Running the Native Android App

The Android app is located in [android-app/](file:///d:/Moola-App/android-app). It is written in pure **Java and XML** (no Kotlin or Jetpack Compose required).

### Option A: Using Android Studio (Recommended)

1. Open **Android Studio**.
2. Click **File** ➔ **Open...**
3. Browse to and select:
   ```
   d:\Moola-App\android-app
   ```
   Click **OK**.
4. Wait 15–30 seconds for the bottom status bar to display:
   ```text
   Gradle sync finished
   ```
5. In the top toolbar, select your virtual device (e.g. `Medium_Phone_API_37.0` or any API 26+ device). If you don't have one, click **Device Manager** ➔ **Create Device** (e.g. Pixel 8 with API 34).
6. Click the green **Run (Play ▶)** button (or press `Shift + F10`).
7. The app will launch showing the MOOLA splash screen with the authentic brand logo!

---

### Option B: Installing the Pre-Built APK via ADB

The debug APK has already been compiled and verified:
- File path: [android-app/app/build/outputs/apk/debug/app-debug.apk](file:///d:/Moola-App/android-app/app/build/outputs/apk/debug/app-debug.apk)

With an Android phone plugged in via USB (USB debugging enabled) or an emulator open:
```powershell
adb install -r "d:\Moola-App\android-app\app\build\outputs\apk\debug\app-debug.apk"
adb shell am start -n com.moola.app/.ui.splash.SplashActivity
```

---

## 🔑 4. Demo Login Accounts (Pre-Seeded)

When the backend starts, [DataSeedService.java](file:///d:/Moola-App/backend/src/main/java/com/moola/backend/service/DataSeedService.java) automatically populates demo accounts and sample products in the database:

| Role | Phone Number | Password | What You Can Test |
|---|---|---|---|
| **Admin** | `+91 90000 00000` | `admin123` | View sales analytics, review maker KYC applications, approve products, resolve complaint tickets. |
| **Artisan Maker** | `+91 90000 00001` | `admin123` | Access Maker Dashboard, list new homemade food products (photos, prices, stock), manage orders. |
| **Artisan Maker 2** | `+91 90000 00002` | `admin123` | Smt. Shailaja (Malnad Homemade Crisps). |
| **Buyer** | `+91 90000 00003` | `admin123` | Browse catalog, place orders, chat with makers on WhatsApp, submit complaints. |

*(You can also click **Register** on either the app or website to create a brand-new account).*

---

## 🔌 5. How Networking Works (FAQ)

### How does the Android App talk to the Backend?
- **In the Android Emulator**: Android emulators access the computer's `localhost` via the special IP **`http://10.0.2.2:5000/api/`**. This is pre-configured in [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java). No changes are needed!
- **On a Physical Android Phone over Wi-Fi**:
  1. Find your computer's local Wi-Fi IP by running `ipconfig` (e.g. `192.168.1.50`).
  2. Open [ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L16) and change `BASE_URL` to `http://192.168.1.50:5000/api/`.

### What if Port 5000 is already in use?
In PowerShell, find what is using port 5000:
```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
```
Then stop the process using `Stop-Process -Id <OwningProcess>`.

### Where are the database settings?
The database is configured in [application.yml](file:///d:/Moola-App/backend/src/main/resources/application.yml). It connects to MongoDB Atlas by default. If connecting from a new Wi-Fi network, make sure your current IP address is whitelisted in your MongoDB Atlas cluster network security settings.
