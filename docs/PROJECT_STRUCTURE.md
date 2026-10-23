# MOOLA — Project Structure Guide

This document explains the organization of the **MOOLA** codebase so any developer or contributor can quickly locate, modify, debug, and test code.

---

## Root Directory Overview

```
MOOLA/
├── android-app/         # Native Android application (Java & XML only)
├── backend/             # Spring Boot 3.3.4 REST API backend (Java 17)
├── website/             # Standalone responsive web marketplace (HTML/CSS/JS)
├── legacy/              # Safely archived previous Node.js & React Native prototypes
├── docs/                # Architectural, setup, API, and project guides
├── moola logo.png       # Master brand identity logo asset
├── .gitignore           # Global git ignore configuration
└── README.md            # Main entry point and project run guide
```

---

## 1. Native Android Application (`android-app/`)

The Android application is built using **Java and XML only**, following Google's recommended Architecture Components (ViewModel, ViewBinding, Repository, Retrofit 2).

```
android-app/
├── app/
│   ├── build.gradle                        # App dependencies, compileSdk 34, ViewBinding
│   ├── proguard-rules.pro                  # ProGuard & R8 release rules
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml         # Declared permissions, activities, launcher
│           ├── java/com/moola/app/
│           │   ├── data/
│           │   │   ├── api/
│           │   │   │   ├── ApiClient.java         # Retrofit client with JWT interceptor
│           │   │   │   └── MoolaApiService.java   # Type-safe REST endpoints interface
│           │   │   ├── model/                     # Data models (Product, Order, User, etc.)
│           │   │   └── storage/
│           │   │       └── SessionManager.java    # SharedPreferences token store
│           │   └── ui/
│           │       ├── account/
│           │       │   ├── AccountDeletionActivity.java  # GDPR / deletion request
│           │       │   └── ProfileFragment.java          # Buyer profile & role portals
│           │       ├── admin/
│           │       │   └── AdminDashboardActivity.java   # Operations & KYC review
│           │       ├── auth/
│           │       │   ├── LoginActivity.java            # Phone login
│           │       │   ├── RegisterActivity.java         # Customer/maker signup
│           │       │   └── SplashActivity.java           # Brand launch screen
│           │       ├── complaint/
│           │       │   ├── ComplaintsActivity.java       # Customer care tickets
│           │       │   └── ComplaintAdapter.java         # Ticket card adapter
│           │       ├── home/
│           │       │   ├── CategoryAdapter.java          # Category carousel adapter
│           │       │   ├── HomeFragment.java             # Editorial home screen
│           │       │   ├── MainActivity.java             # Bottom navigation host
│           │       │   └── ProductAdapter.java           # Homemade product card adapter
│           │       ├── order/
│           │       │   ├── OrderAdapter.java             # Orders list adapter
│           │       │   ├── OrderDetailActivity.java      # Tracking & UPI verification
│           │       │   ├── OrderRequestActivity.java     # Direct order form
│           │       │   └── OrdersFragment.java           # Buyer orders tab
│           │       ├── product/
│           │       │   └── ProductDetailActivity.java    # Food gallery & WhatsApp enquiry
│           │       ├── search/
│           │       │   └── SearchActivity.java           # Debounced search & filters
│           │       └── seller/
│           │           ├── AddEditProductActivity.java   # Product publisher form
│           │           ├── SellerDashboardActivity.java  # Maker metrics & dispatches
│           │           └── SellerProductAdapter.java     # Maker listing adapter
│           └── res/
│               ├── drawable/               # Brand logo, gradients, tag backgrounds
│               ├── layout/                 # 22 responsive XML layouts
│               ├── menu/                   # Bottom navigation menu
│               └── values/
│                   ├── colors.xml          # Brand tokens (#54230F, #351609, #FFF9EF, #D99124)
│                   ├── dimens.xml          # Spacing & typography tokens
│                   ├── strings.xml         # Text resources
│                   └── themes.xml          # Material 3 brand theme & component styles
├── build.gradle                            # Root build configuration
├── gradle.properties                       # AndroidX and JVM options
├── local.properties                        # Android SDK path definition
├── settings.gradle                         # Module inclusion (:app)
└── gradlew.bat                             # Gradle 9.2 wrapper script
```

### Where to add new Android features:
- **New Screen**: Create XML layout in `app/src/main/res/layout/`, create Java Activity/Fragment in appropriate `ui/` subpackage, and declare in `AndroidManifest.xml`.
- **New API Endpoint**: Add method signature to `data/api/MoolaApiService.java`.
- **New Color / Style**: Add to `res/values/colors.xml` and `res/values/themes.xml`. Never hardcode colors in layout XML files.

---

## 2. Spring Boot REST Backend (`backend/`)

The backend is built with **Spring Boot 3.3.4** and **Java 17**, powered by **Spring Data MongoDB** and **Spring Security**.

```
backend/
├── pom.xml                                 # Maven dependencies (Spring Boot, MongoDB, JJWT)
└── src/
    └── main/
        ├── java/com/moola/backend/
        │   ├── MoolaBackendApplication.java # Spring Boot main application class
        │   ├── config/
        │   │   ├── GlobalExceptionHandler.java   # Centralized REST error handling
        │   │   ├── JwtAuthenticationFilter.java  # Bearer token validation filter
        │   │   ├── JwtTokenProvider.java         # Token generation & parsing
        │   │   └── SecurityConfig.java           # CORS & Role-Based Access Control
        │   ├── controller/                       # 10 REST Controller classes
        │   │   ├── AuthController.java           # Login, registration, me
        │   │   ├── ProductController.java        # Catalog, search, filters, maker CRUD
        │   │   ├── CategoryController.java       # Category listings
        │   │   ├── OrderController.java          # Order requests, dispatch, payment UTR
        │   │   ├── SellerController.java         # Maker profile & applications
        │   │   ├── AdminController.java          # Analytics, KYC approvals, user moderation
        │   │   ├── ComplaintController.java      # Customer care tickets & 48h SLA
        │   │   ├── AccountDeletionController.java# GDPR deletion queue
        │   │   ├── EnquiryController.java        # WhatsApp chat enquiry logs
        │   │   └── HealthController.java         # System health endpoint
        │   ├── dto/                              # Request & Response DTOs
        │   ├── model/                            # Persisted MongoDB Document entities
        │   ├── repository/                       # Spring Data Mongo repositories
        │   └── service/                          # Business logic services & data seeders
        └── resources/
            └── application.properties            # Port 5000, Atlas URI, JWT configuration
```

### Where to add new Backend features:
- **New Endpoint**: Add controller method in `controller/`, delegate to `service/`, and return typed `ApiResponse<T>`.
- **New Entity / Collection**: Create `@Document` class in `model/` and corresponding interface in `repository/`.
- **New Request Payload**: Create validated DTO record or class in `dto/`.

---

## 3. Standalone Website (`website/`)

A browser-compatible responsive frontend built with **HTML5, Vanilla CSS, and modern JavaScript**, connected to the Spring Boot REST API.

```
website/
├── assets/
│   └── logo_moola.png          # High-resolution brand logo
├── css/
│   └── styles.css              # Brand design tokens, layout grids, components
├── js/
│   ├── api.js                  # Fetch API client with JWT storage
│   └── app.js                  # Dynamic product rendering, debounced search, modal logic
├── index.html                  # Main marketplace homepage
├── complaints.html             # Customer care ticket filing
├── seller.html                 # Maker onboarding application
└── account-deletion.html       # Account deletion & privacy request
```

---

## 4. Historical Archive (`legacy/`)

Preserves the earlier Node.js/Express server and React Native Expo prototype for historical reference, completely isolated from active development paths.
