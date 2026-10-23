# MOOLA — Android Device & Wireless Debugging Setup Guide

This guide details how to configure, pair, deploy, and debug the **MOOLA** Android application on both an **Android Emulator** and a **Physical Android Device (POCO M4 Pro)** paired over Wi-Fi.

---

## 1. Prerequisites & ADB Path on Windows 11

On this workstation, the Android SDK is located at:
`C:\Users\<username>\AppData\Local\Android\Sdk`

The Android Debug Bridge (`adb.exe`) is located at:
`C:\Users\<username>\AppData\Local\Android\Sdk\platform-tools\adb.exe`

### Permanent Windows PATH Setup (Recommended)
To run `adb` from any PowerShell or Terminal window without typing the full path:
1. Press `Win + X` and select **Terminal (Admin)** or open PowerShell.
2. Run this command once to permanently append `platform-tools` to your user PATH:
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
   ```
3. Restart your terminal, then verify:
   ```powershell
   adb version
   ```

*(Alternatively, you can always execute ADB directly using PowerShell's call operator)*:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

---

## 2. Option A: Physical Phone Setup (POCO M4 Pro / MIUI / HyperOS)

Xiaomi / POCO devices run MIUI or Xiaomi HyperOS, which have specific security settings that must be enabled for wireless debugging and ADB installations.

### Step 1: Enable Developer Options on POCO M4 Pro
1. On your POCO M4 Pro, open **Settings** ➔ **About Phone**.
2. Tap **OS Version** (or **MIUI Version**) **7 times rapidly** until you see the toast:  
   *"You are now a developer!"*
3. Go back to **Settings** ➔ **Additional Settings** ➔ **Developer Options**.

### Step 2: Configure MIUI / HyperOS Specific Settings
Inside **Developer Options**, toggle the following settings:
- ✅ **USB Debugging**: `ON`
- ✅ **Install via USB**: `ON` *(CRITICAL for MIUI: if left OFF, ADB commands will fail with `INSTALL_FAILED_USER_RESTRICTED`)*.
- ✅ **USB Debugging (Security settings)**: `ON` *(allows simulating inputs and testing permissions)*.
- ✅ **Wireless Debugging**: `ON` *(Confirm the prompt when connected to your home/office Wi-Fi)*.

> [!IMPORTANT]
> Both your Windows 11 laptop and your POCO M4 Pro **must be connected to the exact same Wi-Fi network**.

---

### Step 3: Wireless Debugging Connection via Terminal

Android 11+ uses dynamic ports for wireless debugging.

1. On your POCO M4 Pro, go to **Settings ➔ Additional Settings ➔ Developer Options ➔ Wireless Debugging**.
2. Look at the section **"IP address & Port"** (e.g., `192.168.1.105:39481`).
   *(Note: This is the **connection port**, not the pairing port)*.
3. In your Windows PowerShell terminal, connect using that exact IP and port:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" connect 192.168.1.105:39481
   ```
4. Verify the device is connected:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   ```
   **Expected Output**:
   ```text
   List of devices attached
   192.168.1.105:39481    device
   ```

### Step 4: First-Time Pairing (If Not Already Paired)
If Android Studio or ADB asks for pairing:
1. Tap **"Pair device with pairing code"** under Wireless Debugging on the phone.
2. Note the 6-digit Wi-Fi pairing code and the **Pairing Port** (e.g. `192.168.1.105:42135`).
3. Run:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" pair 192.168.1.105:42135
   ```
4. Enter the 6-digit code when prompted. Once paired, connect using the connection port from Step 3.

---

## 3. Option B: Android Studio Emulator Setup

If you prefer using a virtual device instead of a physical phone:
1. Open **Android Studio**.
2. Open the **Device Manager** tool window (right sidebar or **Tools ➔ Device Manager**).
3. If no device exists, click **Create Device** ➔ Choose **Pixel 8** ➔ Download/select **API 34 (UpsideDownCake)** ➔ Click **Finish**.
4. Click the green **Play (▶)** button next to the virtual device to launch the emulator.
5. In your terminal, verify:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
   ```
   **Expected Output**:
   ```text
   List of devices attached
   emulator-5554    device
   ```

---

## 4. Building, Installing, and Launching the App

### Step 1: Build the Debug APK
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug
```
Output APK is created at:
`D:\Moola-App\android-app\app\build\outputs\apk\debug\app-debug.apk`

### Step 2: Install onto Device / Emulator
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
```
*Expected Output*:
```text
Performing Streamed Install
Success
```

### Step 3: Launch the Application
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.moola.app/.ui.auth.SplashActivity
```
*Expected Output*:
```text
Starting: Intent { cmp=com.moola.app/.ui.auth.SplashActivity }
```

### Step 4: Stream Real-Time Logs
To monitor network calls, API responses, and errors:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -s "MOOLA:*" "OkHttp:*" "AndroidRuntime:*"
```

### Uninstalling the Debug App
If you need a fresh installation:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" uninstall com.moola.app
```

---

## 5. Connecting the POCO M4 Pro to Your Laptop's Backend

### Why `localhost` and `10.0.2.2` Do NOT Work on a Physical Phone:
- `localhost` on the POCO M4 Pro refers to the phone itself, not your laptop.
- `10.0.2.2` is a special virtual IP that only exists inside the Android Studio emulator.
- A physical phone must communicate over your Wi-Fi router to your laptop's **local IPv4 address** (e.g. `192.168.1.45`).

### Step 1: Find Your Laptop's Wi-Fi IPv4 Address
In Windows PowerShell:
```powershell
ipconfig
```
Look for **Wireless LAN adapter Wi-Fi** ➔ **IPv4 Address** (e.g. `192.168.1.45`).

### Step 2: Verify Phone Connectivity from Phone Browser
1. Ensure the Spring Boot backend is running in Terminal 1 (`.\gradlew.bat bootRun`).
2. Open Google Chrome on your POCO M4 Pro.
3. In the address bar, type:
   ```text
   http://192.168.1.45:5000/api/health
   ```
   *(Replace `192.168.1.45` with your actual laptop IP)*.
4. If it returns `{"status":"UP"}`, your phone can reach the backend!

> [!WARNING]
> If Chrome on the phone shows `ERR_CONNECTION_TIMED_OUT`, Windows Defender Firewall is blocking inbound connections to port 5000.  
> Run this command in **PowerShell (as Administrator)** to open port 5000:
> ```powershell
> New-NetFirewallRule -DisplayName "MOOLA Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
> ```

### Step 3: Configure Base URL in Android App
In [android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java](file:///d:/Moola-App/android-app/app/src/main/java/com/moola/app/data/api/ApiClient.java#L20):
Update `DEFAULT_BASE_URL` with your laptop's Wi-Fi IP:
```java
public static final String DEFAULT_BASE_URL = "http://192.168.1.45:5000/";
```
Recompile and reinstall the APK:
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 6. Common Device Troubleshooting

| Problem | Root Cause | Solution |
|---|---|---|
| `adb: command not found` | `platform-tools` is not in session PATH | Use `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"` or add to PATH permanently as described in Section 1. |
| `device unauthorized` | Phone hasn't accepted computer's RSA key | Unlock the POCO M4 Pro, look for the popup *"Allow USB debugging?"*, check *"Always allow from this computer"*, and tap **OK**. |
| `device offline` | Stale ADB connection | Run `adb kill-server`, then `adb start-server`, then reconnect. |
| `failed to connect to 192.168.x.x:port` | Dynamic port changed after phone screen locked | Look at the phone's **Wireless debugging** screen; use the updated port number shown under "IP address & Port". |
| `INSTALL_FAILED_USER_RESTRICTED` | MIUI blocked app install via USB | On POCO M4 Pro, open Developer Options and enable **Install via USB**. |
| Network calls fail on phone | Phone cannot reach laptop port 5000 | 1. Ensure phone and laptop are on the same Wi-Fi SSID.<br>2. Check Windows Firewall rule for port 5000.<br>3. Verify `ApiClient.java` uses the laptop's LAN IP, not `10.0.2.2`. |
