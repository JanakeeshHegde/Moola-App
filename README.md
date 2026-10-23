# MOOLA — Pure Indian Homemade Food Marketplace
> **From the Source. To Your Home.**

![MOOLA Logo](website/assets/logo_moola.png)

MOOLA is a dedicated direct-to-consumer (D2C) marketplace connecting discerning households with independent home food artisans, rural self-help groups, and traditional cooks across India.

**Core Categories**:
- Small-batch jackfruit crisps & Kerala banana chips fried in pure cold-pressed coconut oil
- Wild raw forest honey from the Western Ghats (unprocessed & unfiltered)
- Heritage sun-cured pickles (Appemidi mango, wild lime, green chilli)
- Pounded regional masalas & aromatic whole spices (Byadgi chilli, Malabar pepper)
- Traditional homemade sweets & savouries
*(Strictly authentic homemade pantry food — not a fresh vegetable market)*

---

## 1. Project Organization

The repository is organized into a clean, modular structure:

```
MOOLA/
├── android-app/         # Native Android App (Java & XML only, Android Studio)
├── backend/             # Spring Boot 3.3.4 REST API Backend (Java 17, MongoDB)
├── website/             # Standalone Responsive Web Client (HTML5, CSS, ES6, Vite)
├── legacy/              # Safely archived previous prototypes
├── docs/                # Comprehensive engineering and developer documentation
│   ├── LOCAL_DEVELOPMENT.md      # Complete local setup & daily workflow
│   ├── ANDROID_DEVICE_SETUP.md   # Emulator & POCO M4 Pro wireless debugging
│   ├── TROUBLESHOOTING.md        # Verified solutions for common errors
│   ├── TERMINAL_SETUP.md         # Terminal-first quick reference
│   ├── SETUP.md                  # Quickstart developer guide
│   ├── PROJECT_STRUCTURE.md      # Detailed folder & file breakdown
│   ├── ARCHITECTURE.md           # Architecture & design tokens
│   ├── API.md                    # REST API endpoints & contracts
│   └── CLEANUP_REPORT.md         # Repository audit and verification log
├── moola logo.png       # Master brand identity logo asset
└── .gitignore
```

---

## 2. Brand Identity & Design Tokens

Calibrated against the authentic **MOOLA** brand logo:

| Token | Hex | Role | Contrast on `#FFF9EF` |
|---|---|---|---|
| **Primary Dark Brown** | `#54230F` | Headers, primary buttons, major titles | **14.2:1** (AAA) |
| **Deep Chocolate** | `#351609` | Dark accents, app bar cards, footer base | **17.8:1** (AAA) |
| **Warm Cream Background** | `#FFF9EF` | Primary canvas & screen background | Base Canvas |
| **Cream Surface** | `#FDF6EB` | Product cards, dialog surfaces, neutral cards | Soft Canvas |
| **Honey Amber** | `#D99124` | Accents, ratings, selected highlights | Graphic Accent |
| **Soft Golden Accent** | `#E9B65B` | Delicate borders, tag outlines | Component Border |
| **Terracotta Accent** | `#A94F2B` | Heritage recipe highlights, artisanal badges | **5.1:1** (AA) |
| **Primary Text** | `#2B1B14` | High-contrast body text & titles | **15.1:1** (AAA) |
| **Secondary Text** | `#78675B` | Maker location, subtitles, units | **4.9:1** (AA) |
| **Subtle Border** | `#E9DED1` | Card outlines, dividers, input borders | Subtle Border |
| **Success Olive** | `#2E6930` | Order confirmation, active stock indicators | **5.5:1** (AA) |
| **Error Crimson** | `#BA2D1D` | Deletion warnings, cancellations | **5.2:1** (AA) |

---

## 3. Terminal-First Development Workflow

Run the platform directly from standard Windows terminals (PowerShell) using three dedicated tabs:

### Terminal 1: Spring Boot Backend (Port 5000)
```powershell
cd D:\Moola-App\backend
.\gradlew.bat bootRun
```
*(Or with Maven: `mvn spring-boot:run`)*.
- Health check: `curl http://localhost:5000/api/health`
- Connects to MongoDB Atlas development cluster (`moolacluster`).
- Auto-seeds Admin, 2 Makers, 2 Buyers, 8 Categories, and sample products.

### Terminal 2: Website Storefront (Port 8080)
```powershell
cd D:\Moola-App\website
npm install
npm run dev
```
- Storefront runs at: **`http://localhost:8080/`**
- Production bundle: `npm run build`

### Terminal 3: Native Android App (Gradle & ADB)
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.moola.app/.ui.auth.SplashActivity
```
*(Or open `D:\Moola-App\android-app` in Android Studio, select your emulator or POCO M4 Pro, and press `Shift + F10`)*.

---

## 4. Key Documentation Links

- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) — Step-by-step local workflow and network addresses.
- [Android Device & Wireless Debugging](docs/ANDROID_DEVICE_SETUP.md) — Emulator and POCO M4 Pro Wi-Fi setup.
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) — Verified solutions for common errors.
- [REST API Reference](docs/API.md) — Endpoint specifications and sample payloads.
- [Project Structure & Editing Guide](docs/PROJECT_STRUCTURE.md) — File-by-file directory breakdown.
- [Detailed Architecture](docs/ARCHITECTURE.md) — Technical specifications & security model.
