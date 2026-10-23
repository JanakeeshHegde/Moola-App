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
28: ├── docs/                # Architectural, setup, API, and cleanup guides
29: │   ├── ARCHITECTURE.md
30: │   ├── SETUP.md
31: │   ├── TERMINAL_SETUP.md    # Terminal-first development & testing guide
32: │   ├── PROJECT_STRUCTURE.md
33: │   ├── API.md
34: │   └── CLEANUP_REPORT.md
35: ├── moola logo.png       # Master brand identity logo asset
36: └── .gitignore
37: ```
38: 
39: ---
40: 
41: ## 2. Brand Identity & Design Tokens
42: 
43: Calibrated against the authentic **MOOLA** brand logo:
44: 
45: | Token | Hex | Role | Contrast on `#FFF9EF` |
46: |---|---|---|---|
47: | **Primary Dark Brown** | `#54230F` | Headers, primary buttons, major titles | **14.2:1** (AAA) |
48: | **Deep Chocolate** | `#351609` | Dark accents, app bar cards, footer base | **17.8:1** (AAA) |
49: | **Warm Cream Background** | `#FFF9EF` | Primary canvas & screen background | Base Canvas |
50: | **Cream Surface** | `#FDF6EB` | Product cards, dialog surfaces, neutral cards | Soft Canvas |
51: | **Honey Amber** | `#D99124` | Accents, ratings, selected highlights | Graphic Accent |
52: | **Soft Golden Accent** | `#E9B65B` | Delicate borders, tag outlines | Component Border |
53: | **Terracotta Accent** | `#A94F2B` | Heritage recipe highlights, artisanal badges | **5.1:1** (AA) |
54: | **Primary Text** | `#2B1B14` | High-contrast body text & titles | **15.1:1** (AAA) |
55: | **Secondary Text** | `#78675B` | Maker location, subtitles, units | **4.9:1** (AA) |
56: | **Subtle Border** | `#E9DED1` | Card outlines, dividers, input borders | Subtle Border |
57: | **Success Olive** | `#2E6930` | Order confirmation, active stock indicators | **5.5:1** (AA) |
58: | **Error Crimson** | `#BA2D1D` | Deletion warnings, cancellations | **5.2:1** (AA) |
59: 
60: ---
61: 
62: ## 3. Terminal-First Development Workflow
63: 
64: Run the platform directly from standard Windows terminals using three dedicated tabs:
65: 
66: ### Terminal 1: Spring Boot Backend (Port 5000)
67: ```powershell
68: cd d:\Moola-App\backend
69: .\gradlew.bat bootRun
70: ```
71: *(Or with Maven: `mvn spring-boot:run`)*.
72: - Health check: `curl http://localhost:5000/api/health`
73: - Auto-seeds Admin, 2 Makers, 2 Buyers, 8 Categories, and sample products.
74: 
75: ### Terminal 2: Website Storefront (Port 8080)
76: ```powershell
77: cd d:\Moola-App\website
78: npm install
79: npm run dev
80: ```
81: - Live storefront at `http://localhost:8080/`.
82: - Production bundle: `npm run build`.
83: 
84: ### Terminal 3: Native Android App (Gradle & ADB)
85: ```powershell
86: cd d:\Moola-App\android-app
87: .\gradlew.bat assembleDebug
88: adb install -r app\build\outputs\apk\debug\app-debug.apk
89: adb shell am start -n com.moola.app/.ui.splash.SplashActivity
90: ```
91: *(Or open `d:\Moola-App\android-app` in Android Studio and press `Shift + F10`)*.
92: 
93: ---
94: 
95: See [docs/TERMINAL_SETUP.md](file:///d:/Moola-App/docs/TERMINAL_SETUP.md) and [docs/SETUP.md](file:///d:/Moola-App/docs/SETUP.md) for full commands, tests, and demo credentials.

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
