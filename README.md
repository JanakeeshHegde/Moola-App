# 🌾 Moola App — Direct-to-Consumer (D2C) Agri-Commerce & Local Artisan Platform

[![Android SDK](https://img.shields.io/badge/Android-SDK%2034-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Gradle](https://img.shields.io/badge/Gradle-8.x-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)
[![Maven](https://img.shields.io/badge/Maven-3.x-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)

**Moola App** is an end-to-end Direct-to-Consumer (D2C) and Business-to-Consumer (B2C) Agri-Commerce and Local Artisan Marketplace ecosystem. It directly bridges local organic farmers, agricultural producers, and regional artisans with end consumers. By eliminating traditional middlemen, Moola ensures fair pricing for producers, transparent sourcing for buyers, and high quality fresh/artisanal produce.

---

## 📋 Table of Contents
- [🌟 Key Features](#-key-features)
  - [🌾 Buyer Experience](#-buyer-experience)
  - [🧑‍🌾 Seller & Producer Portal](#-seller--producer-portal)
  - [🛡️ Admin & Governance Portal](#️-admin--governance-portal)
- [🏗️ System Architecture](#️-system-architecture)
  - [📐 Architecture Diagram](#-architecture-diagram)
  - [🧩 Data & Interaction Model](#-data--interaction-model)
  - [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [⚡ Prerequisites](#-prerequisites)
- [⚙️ Backend Setup & Execution Guide](#️-backend-setup--execution-guide)
  - [📦 Run using Maven (`mvnw`)](#-run-using-maven-mvnw)
  - [🐘 Run using Gradle (`gradlew`)](#-run-using-gradle-gradlew)
  - [📜 Batch Script Execution (`run-backend.bat`)](#-batch-script-execution-run-backendbat)
  - [⚙️ Server Configuration & Properties](#️-server-configuration--properties)
- [📱 Android Frontend Setup & Execution Guide](#-android-frontend-setup--execution-guide)
  - [🛠️ Build & Install via Gradle CLI](#️-build--install-via-gradle-cli)
  - [🚀 Launch & Debug via ADB](#-launch--debug-via-adb)
  - [🌐 Network & API Base URL Configuration](#-network--api-base-url-configuration)
- [🔑 Pre-configured Test Accounts](#-pre-configured-test-accounts)
- [🛰️ REST API Reference Table](#️-rest-api-reference-table)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🔧 Troubleshooting & Common Issues](#-troubleshooting--common-issues)
- [📄 License](#-license)

---

## 🌟 Key Features

### 🌾 Buyer Experience
* **Discovery & Shopping**: Browse organic vegetables, fruits, grains, pulses, dairy, honey, and local handicrafts.
* **Smart Search & Advanced Filtering**: Search items by keyword, category, price range, organic tag (`isOrganic`), and sort orders (price, rating, freshness).
* **Dedicated Seller Shopfronts**: View seller profiles, ratings, badges (e.g., Organic Certified, Artisan Producer), location, and social follow functionality.
* **Direct Order Placement**: Place direct order requests with customizable quantities, delivery notes, and instant confirmation tracking.
* **Reverse Marketplace (Buyer Sourcing Board)**: Buyers can post custom sourcing requests (e.g., *100 kg bulk organic onions for event*), receive competitive bids/offers from sellers, review offers, and accept the best bid.
* **Seasonal & Festival Pre-Booking**: Participate in harvest campaigns (e.g., *Ratnagiri Alphonso Mango Harvest Special*) with early-bird rates and guaranteed slot reservations.
* **Direct In-App Chat & WhatsApp Sourcing**: Real-time buyer-to-seller text messaging with unread badges, plus optional instant WhatsApp inquiry redirection.
* **Order Tracking Stepper & Payment Verification**: Step-by-step fulfillment tracking (Placed $\rightarrow$ Confirmed $\rightarrow$ Packed $\rightarrow$ Shipped $\rightarrow$ Delivered) with UPI UTR payment verification submission and order reviews.
* **Notification Centre**: Persistent notification history for order updates, chat messages, and promotional alerts.

### 🧑‍🌾 Seller & Producer Portal
* **Product Catalog Management**: Add, update, toggle availability, set organic tags, and manage stock quantities.
* **Order Management & Fulfillment Stepper**: Receive order requests, accept/decline orders, update fulfillment steps (`Packed`, `Shipped`), enter shipment tracking details, and verify payments.
* **Buyer Sourcing Board Bidding**: View buyer custom sourcing requests and submit custom bids/price offers directly.
* **Seller Analytics Dashboard**: Track total revenue, order counts, pending fulfillments, product ratings, and follower metrics.
* **Seller Profile & KYC Application**: Apply for verified seller status with business detail submissions.

### 🛡️ Admin & Governance Portal
* **Platform Analytics**: Comprehensive metrics on user registrations, total active sellers, platform GMV (Gross Merchandise Value), and active orders.
* **Seller KYC Verification**: Review and approve/reject seller verification applications.
* **User Governance**: Activate, suspend, or reactivate buyer/seller accounts.
* **Product Moderation**: Flag or deactivate non-compliant products.
* **Dispute Resolution & Complaints**: Oversee grievance tickets submitted by users and update resolution statuses.
* **Account Deletion Compliance**: Manage and process self-service data deletion requests in compliance with privacy regulations.

---

## 🏗️ System Architecture

### 📐 Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 ANDROID MOBILE CLIENT                             |
|                                                                                   |
|  +--------------------+   +--------------------+   +---------------------------+  |
|  |   UI Layer (XML)   |   | ViewBinding / MVVM |   | SessionManager / Storage  |  |
|  |  Activities/Frags  | <->  LiveData / Logic  | <->    (SharedPreferences)    |  |
|  +--------------------+   +--------------------+   +---------------------------+  |
|                                     |                                             |
|                                     v                                             |
|                      +------------------------------+                             |
|                      |  ApiClient (Retrofit 2/OkHttp)|                             |
|                      +------------------------------+                             |
+-------------------------------------|---------------------------------------------+
                                      | HTTP / REST (JSON API)
                                      | Port 5000 / Bearer Auth Token
                                      v
+-----------------------------------------------------------------------------------+
|                              SPRING BOOT BACKEND SERVER                           |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           REST Controllers Layer                            |  |
|  |  AuthController | ProductController | OrderController | CustomRequest...      |  |
|  +-----------------------------------------------------------------------------+  |
|                                     |                                             |
|                                     v                                             |
|  +-----------------------------------------------------------------------------+  |
|  |                             Service Layer                                   |  |
|  |                 DataStoreService (In-Memory Concurrent Store)               |  |
|  +-----------------------------------------------------------------------------+  |
|                                     |                                             |
|                                     v                                             |
|  +-----------------------------------------------------------------------------+  |
|  |                      Domain Models / DTO Collections                        |  |
|  |     User | Product | Order | CustomRequest | Conversation | Complaint ...     |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 🧩 Data & Interaction Model
1. **Client Request**: Android client sends an HTTP request using Retrofit 2 with JSON request payload and `Authorization: Bearer <token>` header.
2. **Backend Authentication**: The Spring Boot REST controller delegates authorization resolution to `DataStoreService.resolveUserFromToken()`.
3. **Execution & State Mutation**: The controller invokes business methods on `DataStoreService`, modifying thread-safe concurrent collections (`ConcurrentHashMap`, `CopyOnWriteArrayList`).
4. **Structured Response**: Response data is encapsulated inside a unified `ApiResponse<T>` envelope containing success status, message, and payload data.

### 🛠️ Tech Stack

#### Frontend (Android App)
* **Language**: Java 17
* **Android Target SDK**: 34 (Android 14), Min SDK: 26 (Android 8.0)
* **UI & Layouts**: Material Design 3, XML Layouts, ConstraintLayout, RecyclerView, SwipeRefreshLayout
* **Architecture**: Layered MVVM / ViewBinding, LiveData, Modular Packages (`ui`, `data`, `util`)
* **Networking**: Retrofit 2.11.0, Gson Converter 2.11.0, OkHttp 4.12.0 (Logging Interceptor)
* **Image Loading**: Glide 4.16.0
* **Build Tool**: Gradle 8.4.1 (Android Gradle Plugin `8.4.1`)

#### Backend (Spring Boot Server)
* **Framework**: Spring Boot 3.2.5
* **Language**: Java 17
* **Build Systems**: Dual support for Apache Maven 3.x (`pom.xml` + `mvnw`) & Gradle 8.x (`build.gradle` + `gradlew`)
* **Persistence**: In-Memory Thread-Safe Data Store (`DataStoreService`) with pre-seeded test datasets
* **Embedded Server**: Embedded Apache Tomcat listening on port `5000`

---

## 📂 Project Directory Structure

```
Moola-App/
├── README.md                          # Comprehensive Documentation
├── backend/                           # Spring Boot Backend Project
│   ├── build.gradle                   # Backend Gradle Build Configuration
│   ├── pom.xml                        # Backend Maven Build Configuration
│   ├── gradlew / gradlew.bat          # Gradle Wrapper Executables
│   ├── mvnw / mvnw.cmd                # Maven Wrapper Executables
│   ├── run-backend.bat                # One-click Windows Execution Script
│   └── src/
│       └── main/
│           ├── java/com/moola/backend/
│           │   ├── MoolaBackendApplication.java # Spring Boot Entrypoint
│           │   ├── controller/        # REST API Controllers (Auth, Product, Order, etc.)
│           │   ├── dto/               # Data Transfer Objects & API Response Models
│           │   ├── model/             # Core Domain Models (User, Order, CustomRequest, etc.)
│           │   └── service/           # DataStoreService (In-memory storage & business logic)
│           └── resources/
│               └── application.properties # Spring Configuration (server.port=5000)
│
└── android-app/                       # Android Mobile Client Project
    ├── build.gradle                   # Root Gradle Configuration
    ├── settings.gradle                # Project Settings & Module Inclusions
    ├── gradlew / gradlew.bat          # Android Gradle Wrapper Executables
    └── app/
        ├── build.gradle               # App Module Build Script (Dependencies & SDK)
        ├── proguard-rules.pro         # Obfuscation & Shrinking Rules
        └── src/
            ├── main/
            │   ├── AndroidManifest.xml # App Manifest, Permissions, Activities
            │   ├── java/com/moola/app/
            │   │   ├── data/
            │   │   │   ├── api/       # ApiClient & MoolaApiService (Retrofit Interfaces)
            │   │   │   ├── model/     # Client Data Models
            │   │   │   └── storage/   # SessionManager (Preferences & Auth Tokens)
            │   │   ├── ui/            # UI Activities, Fragments, Adapters
            │   │   │   ├── account/   # Account & Profile Management
            │   │   │   ├── admin/     # Admin Dashboard & KYC Review
            │   │   │   ├── auth/      # Login, Registration, Splash
            │   │   │   ├── chat/      # Buyer-Seller Direct Chat & Conversations
            │   │   │   ├── complaint/ # Customer Complaints & Support
            │   │   │   ├── home/      # Home Screen, Search, Categories, Products
            │   │   │   ├── notification/# Persistent Notification Centre
            │   │   │   ├── order/     # Order History, Stepper, Payment Verification
            │   │   │   ├── product/   # Product Details & Purchasing
            │   │   │   ├── request/   # Reverse Marketplace (Custom Sourcing Requests)
            │   │   │   ├── search/    # Global Search & Seller Directory
            │   │   │   ├── seasonal/  # Pre-Booking & Harvest Campaigns
            │   │   │   └── seller/    # Seller Dashboard & Shopfront Management
            │   │   └── util/          # Utility Classes (Currency Formatters)
            │   └── res/               # Android Resources (Layouts, Drawables, Values)
            └── test/                  # Unit Test Suites
```

---

## ⚡ Prerequisites

Before building and running Moola App, ensure your development machine meets the following environment requirements:

| Tool | Recommended Version | Download / Installation Link |
| :--- | :--- | :--- |
| **JDK (Java Development Kit)** | Java 17 LTS | [Eclipse Temurin OpenJDK 17](https://adoptium.net/) |
| **Android Studio** | Jellyfish (2023.3.1) or Newer | [Android Studio Official Site](https://developer.android.com/studio) |
| **Android SDK** | SDK Platform API 34 | Installed via Android Studio SDK Manager |
| **Gradle** | 8.x (Bundled via `gradlew`) | Auto-downloaded by wrapper |
| **Maven** | 3.x (Bundled via `mvnw`) | Auto-downloaded by wrapper |
| **ADB (Android Debug Bridge)** | Latest (Bundled with SDK Platform Tools) | Installed with Android SDK |

---

## ⚙️ Backend Setup & Execution Guide

The backend server is built with Spring Boot 3.2.5 and listens on **Port 5000**. It includes pre-seeded initial mock data so it starts immediately without requiring external database setup.

### 📦 Run using Maven (`mvnw`)

Open a terminal or command prompt in the root of the project:

#### On Windows:
```cmd
cd backend
mvnw.cmd spring-boot:run
```

#### On Linux / macOS:
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

#### Packaging and Running Executable JAR:
```bash
# Package the compiled backend into a JAR
mvnw.cmd clean package      # Windows
./mvnw clean package        # Linux/macOS

# Run the packaged executable JAR
java -jar target/moola-backend-1.0.0.jar
```
* **Explanation**: Compiles Java source files, runs tests, packages the Spring Boot application into an executable fat JAR in `backend/target/`, and launches the embedded Tomcat server on port 5000.

---

### 🐘 Run using Gradle (`gradlew`)

If you prefer using Gradle for backend execution:

#### On Windows:
```cmd
cd backend
gradlew.bat bootRun
```

#### On Linux / macOS:
```bash
cd backend
chmod +x gradlew
./gradlew bootRun
```

#### Packaging and Running via Gradle:
```bash
gradlew.bat build            # Windows
./gradlew build              # Linux/macOS

# Run compiled build JAR
java -jar build/libs/moola-backend-1.0.0.jar
```
* **Explanation**: Uses the Spring Boot Gradle plugin to assemble and run the application.

---

### 📜 Batch Script Execution (`run-backend.bat`)

For Windows users, a convenient batch execution script is included in the `backend/` directory:

```cmd
C:\Users\...\Moola-App\backend\run-backend.bat
```
* **Explanation**: Double-clicking or executing this script opens a command prompt, sets the working directory, and executes `mvnw.cmd spring-boot:run` automatically.

---

### ⚙️ Server Configuration & Properties

The backend configuration is located at `backend/src/main/resources/application.properties`:

```properties
# Server Port Configuration
server.port=5000

# Application Name
spring.application.name=moola-backend

# Logging Configuration
logging.level.org.springframework.web=INFO
```

* **Health Verification**: Once started, verify backend availability by opening your browser or running `curl`:
  ```bash
  curl http://localhost:5000/api/v1/categories
  ```

---

## 📱 Android Frontend Setup & Execution Guide

### 🛠️ Build & Install via Gradle CLI

Navigate to the `android-app` directory in your terminal:

```bash
cd android-app
```

#### 1. Clean Project Build Cache:
```bash
# Windows
gradlew.bat clean

# Linux/macOS
./gradlew clean
```
* **Explanation**: Deletes previous build artifacts in `app/build/` to guarantee a clean build state.

#### 2. Compile Debug APK:
```bash
# Windows
gradlew.bat assembleDebug

# Linux/macOS
./gradlew assembleDebug
```
* **Explanation**: Compiles the Android project, processes XML layouts and ViewBinding classes, and outputs the debug APK file to `android-app/app/build/outputs/apk/debug/app-debug.apk`.

#### 3. Compile Release APK:
```bash
# Windows
gradlew.bat assembleRelease

# Linux/macOS
./gradlew assembleRelease
```
* **Explanation**: Builds an optimized production-ready release APK.

#### 4. Install & Run Directly to Connected Device / Emulator:
```bash
# Windows
gradlew.bat installDebug

# Linux/macOS
./gradlew installDebug
```
* **Explanation**: Assembles the debug APK and automatically deploys/installs it onto the active connected Android Virtual Device (AVD) or physical device connected via USB debugging.

---

### 🚀 Launch & Debug via ADB

You can manage, deploy, and inspect the application using `adb` (Android Debug Bridge):

#### 1. List Connected Devices / Emulators:
```bash
adb devices
```
* **Output Example**:
  ```
  List of devices attached
  emulator-5554    device
  ```

#### 2. Manual APK Installation:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```
* **Explanation**: Pushes and installs the compiled APK binary directly to the target device.

#### 3. Launch Moola App Splash Screen:
```bash
adb shell am start -n com.moola.app/.ui.auth.SplashActivity
```
* **Explanation**: Forces the Android Activity Manager (`am`) to start the `SplashActivity` entrypoint on the connected device.

#### 4. Reverse Port Forwarding for Physical Device Testing:
If testing on a physical Android device connected via USB:
```bash
adb reverse tcp:5000 tcp:5000
```
* **Explanation**: Routes all network calls made to `http://localhost:5000` on the physical phone directly to port `5000` on your host development machine.

---

### 🌐 Network & API Base URL Configuration

The Android client automatically detects whether it is running inside an Android Emulator or on a Physical Device:

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Android Emulator (Default)** | `http://10.0.2.2:5000` or `http://localhost:5000` | `10.0.2.2` is the special loopback alias to host machine's `localhost` |
| **Physical Android Device (USB)** | `http://localhost:5000` | Requires running `adb reverse tcp:5000 tcp:5000` |
| **Physical Device (Wi-Fi)** | `http://<your-computer-ip>:5000` | Example: `http://192.168.1.100:5000` |

* **Dynamic URL Override**: Users can change or override the API server endpoint dynamically directly inside the app preferences via `SessionManager.setServerUrl(...)` or through `ApiClient.setCustomBaseUrl(context, newUrl)`.

---

## 🔑 Pre-configured Test Accounts

The backend starts with pre-seeded data for instant testing across all three user roles:

| Role | Name | Email | Password | Auth Token / ID |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer** | Anita Buyer | `anita@buyer.com` | `buyer@123` | `user_buyer_03` |
| **Seller** | Ramesh Seller | `ramesh@seller.com` | `seller@123` | `user_seller_01` |
| **Admin** | Admin User | `admin@moola.com` | `admin@moola123` | `user_admin_01` |

---

## 🛰️ REST API Reference Table

| Category | HTTP Method | Endpoint Path | Description | Access Role |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & get auth token | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new Buyer or Seller account | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| **Products** | `GET` | `/api/v1/products` | Search/filter products by keyword, category, organic, price | Public |
| **Products** | `GET` | `/api/v1/products/{id}` | Get product details by ID | Public |
| **Products** | `POST` | `/api/v1/products` | Create new product catalog item | Seller |
| **Orders** | `POST` | `/api/v1/orders/request` | Place direct purchase request | Buyer |
| **Orders** | `GET` | `/api/v1/orders/my` | Retrieve buyer's order history | Buyer |
| **Orders** | `GET` | `/api/v1/orders/seller` | Retrieve incoming seller orders | Seller |
| **Orders** | `POST` | `/api/v1/orders/{id}/confirm` | Accept buyer order | Seller |
| **Orders** | `POST` | `/api/v1/orders/{id}/fulfillment-step` | Update step (`Packed`, `Shipped`, etc.) | Seller |
| **Orders** | `POST` | `/api/v1/orders/{id}/utr` | Submit payment UTR transaction reference | Buyer |
| **Custom Sourcing**| `POST` | `/api/v1/custom-requests` | Post bulk custom requirement | Buyer |
| **Custom Sourcing**| `GET` | `/api/v1/custom-requests/board` | View global buyer sourcing board | Seller |
| **Custom Sourcing**| `POST` | `/api/v1/custom-requests/{id}/offers` | Submit competitive bid offer | Seller |
| **Campaigns** | `GET` | `/api/v1/campaigns` | List seasonal harvest pre-booking campaigns | Public |
| **Campaigns** | `POST` | `/api/v1/campaigns/{id}/pre-book` | Reserve pre-booking slots | Buyer |
| **Chat** | `GET` | `/api/v1/conversations` | List active chat conversations | Authenticated |
| **Chat** | `POST` | `/api/v1/conversations/{id}/messages` | Send direct in-app message | Authenticated |
| **Seller Shop** | `GET` | `/api/v1/sellers/{id}/shop` | Fetch seller showcase & ratings | Public |
| **Seller Shop** | `POST` | `/api/v1/sellers/{id}/follow` | Follow seller for updates | Buyer |
| **Admin** | `GET` | `/api/v1/admin/analytics` | View system GMV & activity analytics | Admin |
| **Admin** | `PUT` | `/api/v1/admin/sellers/{id}/kyc` | Approve/Reject seller KYC application | Admin |
| **Governance** | `POST` | `/api/v1/complaints` | Submit customer support complaint ticket | Authenticated |
| **Governance** | `POST` | `/api/v1/account-deletion/request` | Request self-service account deletion | Authenticated |

---

## 🧪 Testing & Quality Assurance

### 1. Run Android Unit Tests:
```bash
cd android-app

# Windows
gradlew.bat test

# Linux/macOS
./gradlew test
```
* **Explanation**: Executes local JVM unit tests located in `android-app/app/src/test/java/`.

### 2. Run Android Instrumentation (UI / Espresso) Tests:
```bash
# Ensure an emulator or physical device is running/connected
cd android-app

# Windows
gradlew.bat connectedAndroidTest

# Linux/macOS
./gradlew connectedAndroidTest
```
* **Explanation**: Executes on-device instrumentation tests inside `android-app/app/src/androidTest/java/`.

---

## 🔧 Troubleshooting & Common Issues

### 1. `java.net.ConnectException: Connection refused` on Android
* **Cause**: Android client cannot reach Spring Boot server at port 5000.
* **Fix**:
  - If using Android Emulator, verify `DEFAULT_EMULATOR_URL` is set to `http://10.0.2.2:5000`.
  - If using a physical Android device via USB, run `adb reverse tcp:5000 tcp:5000`.
  - Ensure backend is running (`mvnw spring-boot:run`) and port 5000 is open in firewall.

### 2. `Execution failed for task ':app:compileDebugJavaWithJavac'`
* **Cause**: JDK version mismatch.
* **Fix**: Ensure `JAVA_HOME` points to Java 17. Verify in terminal: `java -version`.

### 3. `Port 5000 is already in use`
* **Cause**: Another backend instance or process is using port 5000.
* **Fix (Windows)**:
  ```cmd
  netstat -ano | findstr :5000
  taskkill /F /PID <PID_NUMBER>
  ```
* **Fix (Linux/macOS)**:
  ```bash
  lsof -i :5000
  kill -9 <PID_NUMBER>
  ```

---

## 📄 License

This project is released under the **MIT License**.

```
Copyright (c) 2025 Moola App Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom it is furnished to do so.
```
