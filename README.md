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

The repository is modularly structured:

```
MOOLA/
├── android-app/         # Native Android App (Java & XML only, Android Studio)
├── backend/             # Spring Boot 3.3.4 REST API Backend (Java 17, MongoDB)
├── website/             # Standalone Responsive Web Client (HTML5, CSS, ES6)
├── legacy/              # Safely archived previous prototypes
├── docs/                # Architectural, setup, API, and cleanup guides
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API.md
│   └── CLEANUP_REPORT.md
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

## 3. Quick Start & Execution

### ⚡ 1-Click Windows Launchers (Easiest)
- **Website**: Double-click [run-website.bat](file:///d:/Moola-App/run-website.bat) ➔ Opens browser at `http://localhost:8080/index.html`.
- **Backend**: Double-click [run-backend.bat](file:///d:/Moola-App/run-backend.bat) ➔ Launches Spring Boot backend on port 5000.
- **Android**: Double-click [run-android.bat](file:///d:/Moola-App/run-android.bat) ➔ Builds and installs APK on your device/emulator.

### A. Spring Boot Backend (Port 5000)
```powershell
cd d:\Moola-App\backend
.\gradlew.bat bootRun
```
- Listens on `http://localhost:5000`.
- Connects to MongoDB Atlas cluster (`moolacluster`).
- Automatically seeds Admin, 2 Makers, 2 Buyers, 8 Pantry Categories, and sample products.

### B. Native Android App (Java & XML Only)
Open `d:\Moola-App\android-app` in **Android Studio** and click **Run (▶)**.  
Or compile and install via command line:
```powershell
cd d:\Moola-App\android-app
.\gradlew.bat installDebug
```
Output APK: `android-app/app/build/outputs/apk/debug/app-debug.apk` (8.89 MB).

### C. Standalone Web Client (Port 8080)
```powershell
python -m http.server 8080 --directory d:\Moola-App\website
```
Open in browser: `http://localhost:8080/index.html` (or simply double-click `website/index.html`).

---

See [docs/SETUP.md](file:///d:/Moola-App/docs/SETUP.md) for full step-by-step instructions and demo credentials.

---

## 4. Workflows & Features

1. **Buyer Journey**:
   - Browse small-batch homemade pantry categories.
   - Search with debounced live querying and price sorting.
   - View authentic product attributes, regional names, and pure ingredients.
   - Submit direct order requests to makers with delivery addresses.
   - Click-to-chat WhatsApp inquiry with automated message generation.
   - Consignment tracking links for India Post Speed Post.
   - Maker direct UPI details & UTR reference submission.
2. **Artisan Maker Experience**:
   - Maker kitchen dashboard with real order & product counts.
   - Direct listing management (price, unit, stock availability, organic declaration).
   - Order confirmation and consignment AWB tracking dispatch recording.
   - Payment verification.
3. **Admin Operations**:
   - Marketplace analytics (total buyers, makers, products, pending KYC).
   - Maker KYC verification (Approve / Reject).
   - Account deletion queue processing with anonymization.
4. **Customer Care & Compliance**:
   - Dedicated support helplines: **Line 1: +91 80886 53820** | **Line 2: +91 63620 95126**.
   - Grievance ticket filing with 48-hour response SLA target.
   - GDPR-compliant account deletion and data erasure requests.

---

## 5. Technical Documentation Links

- [Project Structure & Editing Guide](docs/PROJECT_STRUCTURE.md)
- [Setup & Run Instructions](docs/SETUP.md)
- [REST API Contract Reference](docs/API.md)
- [Codebase Cleanup Report](docs/CLEANUP_REPORT.md)
- [Detailed Architecture & Design Tokens](docs/ARCHITECTURE.md)
