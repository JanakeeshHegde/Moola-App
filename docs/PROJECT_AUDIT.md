# MOOLA — Codebase Audit & Refactoring Report

**Document Version**: 1.0.0  
**Audit Date**: October 22, 2026  
**Auditor**: Senior Software Architect, Security Engineer & Codebase Auditor  
**Workspace**: `MOOLA` (React Native Expo + Node.js + MongoDB Atlas + Shared Monorepo)  
**Brand Tagline**: *From the Source. To Your Home.*  

---

## 1. Executive Summary

This comprehensive audit was conducted to review the architectural health, code quality, security posture, database models, and workflow integrity of the **MOOLA** organic food and homemade products marketplace. MOOLA connects farmers, homemade product makers, and organic producers across India directly with consumers, specializing in traditional snacks (jackfruit chips, banana chips), raw forest honey, native spices, authentic pickles, and homemade specialty food items. **MOOLA is strictly not a vegetable marketplace.**

The audit examined every layer of the monorepo across `packages/shared`, `apps/server`, and `apps/mobile`, cataloging completed features, identifying architectural bottlenecks and bugs, eliminating obsolete code, and executing refactoring to establish maintainability and clear boundaries.

---

## 2. Baseline Status & Verification

Before modifying any source files, the repository was audited and a baseline was established:

- **Monorepo Structure**: npm workspaces managing `apps/mobile`, `apps/server`, and `packages/shared`.
- **Git State**: No outer `.git` directory in root; `.gitignore` properly configured with comprehensive rules protecting environment files (`.env*`), build outputs (`dist/`, `.expo/`), dependencies (`node_modules/`), and OS artifacts.
- **Initial Test Suite**: 35 unit/integration tests in `apps/server/src/tests/` passing across `workflow.test.ts`, `notifications.test.ts`, and `health.test.ts`.
- **Initial Type Checks**: Clean TypeScript compilation across `@moola/shared`, `@moola/server`, and `@moola/mobile`.

---

## 3. Discovered Issues & Technical Debt

During the audit, the following specific defects, inconsistencies, and maintainability issues were uncovered and analyzed:

### 3.1 Backend Issues & Bugs
1. **Admin Analytics Aggregation Bug**:
   - In `apps/server/src/routes/admin.ts`, the total platform revenue aggregation pipeline was executing:
     ```ts
     { $match: { paymentStatus: 'paid' } },
     { $group: { _id: null, total: { $sum: '$totalAmount' } } }
     ```
   - **Root Cause**: In `Order.ts`, the order monetary field is `total`, not `totalAmount`. Additionally, the canonical payment status enum in `@moola/shared` is uppercase `'PAID'`. The aggregation pipeline returned `0` or `null` for platform revenue.
   - **Resolution**: Refactored to `{ $match: { paymentStatus: { $in: ['PAID', 'paid'] } } }` and `$sum: '$total'`.

2. **Inconsistent In-App & Push Notification Dispatching**:
   - Several backend routes were directly invoking Mongoose's `Notification.create(...)` instead of the centralized `NotificationService.send(...)` or its lifecycle helper methods:
     - `routes/payments.ts` (buyer payment confirmation notification)
     - `routes/seller.ts` (seller KYC approval/rejection notification)
     - `routes/admin.ts` (KYC review and product delisting notifications)
     - `routes/orders.ts` (consignment dispatch and status transition notifications)
     - `routes/customRequests.ts` (custom offer received and accepted notifications)
     - `routes/campaigns.ts` (pre-booking reservation received notification)
   - **Impact**: When `Notification.create(...)` was called directly, notifications were persisted to MongoDB Atlas, but the push provider abstraction was bypassed completely, preventing Expo/FCM push notifications from being dispatched to user devices.
   - **Resolution**: Replaced all direct calls with `NotificationService.send(...)` and structured lifecycle helpers.

3. **Monolithic Route Handlers (Lack of Controller Separation)**:
   - Route files (`orders.ts`, `shipments.ts`, `payments.ts`, `enquiries.ts`, `notifications.ts`, `products.ts`, `auth.ts`, `admin.ts`) contained route declarations, Zod schema validation, database queries, state machine validation, notification dispatching, and response serialization inside a single file. For instance, `orders.ts` was 751 lines long.
   - **Resolution**: Extracted dedicated controllers into `apps/server/src/controllers/` (`OrderController`, `ShipmentController`, `PaymentController`, `EnquiryController`, `NotificationController`, `ProductController`, `AuthController`, `AdminController`), keeping route files concise, declarative, and easily readable.

4. **Outdated Firebase Admin Residue**:
   - Earlier prototype plans envisioned Firebase Authentication and Firebase Realtime Database. The previous cleanup removed Firebase Admin dependencies and environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`), retaining only Expo Push Notifications for push delivery with optional Android FCM V1 / iOS APNs credentials managed via EAS credentials.

### 3.2 Mobile Application Issues
1. **Hardcoded API URLs in UI Screens**:
   - In `apps/mobile/src/screens/buyer/ProductDetailScreen.tsx`, an ad-hoc `fetch('http://localhost:5000/api/v1/enquiries', ...)` was hardcoded directly inside the WhatsApp enquiry button handler.
   - **Impact**: On an Android emulator or physical device, `http://localhost:5000` failed because `localhost` refers to the mobile device itself (Android emulator uses `10.0.2.2:5000`).
   - **Resolution**: Introduced `apps/mobile/src/config/api.ts` with dynamic platform host detection and `apps/mobile/src/services/api.ts` providing typed, centralized methods.

2. **Absence of Unified API Client Layer**:
   - Mobile components lacked a centralized HTTP client for orders, shipments, enquiries, notifications, and products. Screens either operated solely on local state / `mockData.ts` or made uncoordinated network calls.
   - **Resolution**: Created `apps/mobile/src/services/api.ts` with domain-scoped services (`apiService.enquiries`, `apiService.orders`, `apiService.shipments`, `apiService.payments`, `apiService.notifications`, `apiService.health`).

3. **Mobile Notification Synchronization**:
   - `apps/mobile/src/services/notificationService.ts` only operated on in-memory mock data, never attempting to sync with MongoDB Atlas when authenticated.
   - **Resolution**: Connected `MobileNotificationService` to `apiService.notifications` with seamless fallback to `MOCK_NOTIFICATIONS` when offline or unauthenticated.

---

## 4. Feature Matrix: Implemented vs. Incomplete vs. Excluded

| Feature / Domain | Implemented & Verified | Incomplete / Future Scope | Excluded by Design |
| :--- | :--- | :--- | :--- |
| **Catalog & Products** | Manual seller product creation (`AddProductScreen`), multi-image support, organic certification badge, bilingual text (English/Kannada), price, stock, category filters. | Automated image compression on upload. | AI Voice product listing & AI voice search (explicitly excluded). Fresh vegetables (not a vegetable app). |
| **Search & Discovery** | Full-text compound index in MongoDB Atlas (`name.en`, `name.kn`, `tags`, `description.en`), text search input in mobile `HomeScreen`. | Semantic vector search / Elasticsearch. | Voice-activated search (explicitly removed). |
| **WhatsApp Enquiries** | `wa.me/<number>?text=<encoded_text>` generation, prefilled product/quantity template, auditable MongoDB record (`WhatsAppEnquiry`), click-to-chat launch. | Automated WhatsApp Business Cloud API webhook syncing. | False delivery claims (WhatsApp links launch externally; delivery is not claimed). |
| **Order Management** | Cart checkout, direct product order requests, immutable snapshots (`OrderItemSnapshot`), state transition validation (`validateStateTransition`), seller confirm/decline. | Automated cancellation refunds. | Razorpay/Stripe auto-charge (deferred to preserve direct buyer-seller trust). |
| **Payment Verification** | Direct UPI payment instructions, WhatsApp payment link, buyer UTR submission (`PAYMENT_VERIFICATION_PENDING`), seller independent verification (`PAID`). | Payment gateway webhook auto-capture. | Premature automated gateway lock-in; fake success screens. |
| **Consignment Tracking** | Manual consignment registration (`Shipment`), trusted tracking URLs for India Post, DTDC, Blue Dart, Professional Couriers, ST Courier, seller milestone updates. | Automated Shiprocket / Delhivery webhook polling. | Fake real-time GPS tracking. |
| **In-App Notifications** | MongoDB Atlas storage with unread count, read/unread status, mark-all-read, delete, 90-day TTL index, mobile Notification Center screen with filter tabs. | In-app notification sound customization. | Firebase Database / Firestore push store. |
| **Push Notifications** | Abstracted `IPushNotificationProvider`, `ExpoPushNotificationProvider` (`https://exp.host/--/api/v2/push/send`), `MockPushNotificationProvider`, non-blocking resilience. | Production APNs certificate upload in EAS. | Hardcoded FCM keys in source code; blocking server on push error. |
| **User & KYC** | JWT auth (access + refresh), bcrypt hashing (12 rounds), role authorization (`buyer`, `seller`, `admin`), seller KYC document submission and admin verification. | Aadhaar OCR / Digilocker automated verification. | Firebase Authentication. |

---

## 5. Architectural Improvements Made

```mermaid
graph TD
    subgraph Client ["Client Layer (apps/mobile)"]
        UI[React Native Screens & Components]
        APIClient[apps/mobile/src/services/api.ts]
        APIConfig[apps/mobile/src/config/api.ts]
        UI --> APIClient
        APIClient --> APIConfig
    end

    subgraph Server ["Server Layer (apps/server)"]
        Routes[Express Routes (apps/server/src/routes/*)]
        Controllers[Controllers (apps/server/src/controllers/*)]
        NotifService[NotificationService (Central Dispatcher)]
        PushProvider[IPushNotificationProvider Interface]
        ExpoPush[ExpoPushNotificationProvider]
        MockPush[MockPushNotificationProvider]

        Routes --> Controllers
        Controllers --> NotifService
        NotifService --> PushProvider
        PushProvider --> ExpoPush
        PushProvider --> MockPush
    end

    subgraph Data ["Database Layer (MongoDB Atlas)"]
        Models[Mongoose Models (apps/server/src/models/*)]
        Controllers --> Models
        NotifService --> Models
    end

    APIClient -->|REST API over HTTPS| Routes
```

### Key Decisions:
1. **Controller Layer Introduction**: Extracted 8 dedicated controller modules in `apps/server/src/controllers/`, separating route definitions from business logic and database interactions while keeping all existing API routes 100% backward-compatible.
2. **Push Provider Decoupling**: Defined `IPushNotificationProvider` interface. Push notification failures never interrupt transaction flows.
3. **Resilient Mobile API Client**: Configured platform-aware host resolution (`10.0.2.2` for Android emulator, `localhost` for iOS/web) with non-blocking error handling and mock fallbacks for offline testing.
4. **Data Integrity Guarantee**: Fixed the admin analytics aggregation pipeline to accurately query the `total` field and support both uppercase `'PAID'` and legacy `'paid'` statuses.

---

## 6. Remaining Technical Debt & Recommendations

1. **Image Storage Upload Pipeline**: Currently, images are referenced via URLs (e.g., Unsplash or pre-uploaded Cloudinary links). A direct mobile-to-Cloudinary upload utility using signed presigned URLs will eliminate manual URL entry for sellers.
2. **Automated Logistic Webhooks (Future Phase)**: When shipping volume grows, integrate Shiprocket/Delhivery tracking webhooks via the existing `ShipmentProvider` abstraction without altering the core order model.
3. **Database Migration Scripting**: While Mongoose handles schema creation dynamically, adding automated migration scripts (`migrate-mongo`) will assist with production schema evolutions.
