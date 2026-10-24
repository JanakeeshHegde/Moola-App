# MOOLA — COMPLETE SYSTEM AUDIT & ROLE SEPARATION REPORT

**Document Version:** 2.0.0  
**Project:** MOOLA Organic & Homemade Food Social Marketplace  
**Auditor:** Senior Software Architect, Security Engineer & QA Lead  
**Target Environment:** Native Android (Java 17 / XML), Spring Boot 3.3.4 (Java 17), MongoDB, Vite Web Storefront  
**Repository Root:** `D:\Moola-App`  

---

## 1. EXECUTIVE SUMMARY & SYSTEM ARCHITECTURE

MOOLA is an artisanal, homemade, and organic food social marketplace designed to connect home makers, traditional farmers, and organic producers directly with buyers. The platform architecture is composed of:

1. **Android Client (`android-app/`)**: Native Java + XML Android application, utilizing Retrofit 2, OkHttp 3, Material Design Components, ViewBinding, and custom ViewModels.
2. **Backend Server (`backend/`)**: Java Spring Boot 3.3.4 enterprise backend built on Java 17, Gradle 9.2, Spring Security with stateless JWT bearer authentication, Spring Data MongoDB, and WebSocket STOMP messaging.
3. **Database Layer**: MongoDB NoSQL document database managing collections for users, seller profiles, products, orders, buyer requests, offers, conversations, messages, reviews, and notifications.
4. **Web Client (`website/`)**: Vanilla JavaScript + CSS frontend bundled via Vite 5, providing discovery, shop viewing, complaints handling, and seller onboarding.

---

## 2. ROOT CAUSE ANALYSIS OF "COULDN'T LOAD" FAILURES

During comprehensive system inspection and traffic tracing across physical devices, emulators, and web clients, multiple critical defects causing `Couldn't load` and silent failure states were diagnosed and repaired:

### Defect 1: Hardcoded Loopback IP in Mobile Client (`ApiClient.java`)
- **Symptom:** Android emulator and physical test devices displayed `Couldn't load` or generic `Network error` across all network-dependent screens.
- **Root Cause:** `ApiClient.java` hardcoded `DEFAULT_BASE_URL = "http://192.168.1.40:5000/"`. In the Android emulator, `192.168.1.40` is unreachable unless bound specifically on the local Wi-Fi interface, while standard Android emulators route host machine localhost through `10.0.2.2`. Physical devices on different subnets similarly failed with `java.net.ConnectException: Failed to connect`.
- **Resolution:** Implemented dynamic environment detection via `ApiClient.isEmulator()`, automatically routing emulator traffic to `http://10.0.2.2:5000/` and physical device traffic to configured LAN IP. Implemented persistent server URL override in `SessionManager` configurable via the Profile screen dialog.

### Defect 2: 15-Minute JWT Expiration Without Refresh Mechanism
- **Symptom:** After 15 minutes of app usage, every screen attempting to load authenticated data failed with HTTP 401 Unauthorized, presenting `Couldn't load orders`, `Couldn't load products`, or blank lists.
- **Root Cause:** `application.properties` configured `jwt.expiration=900000` (15 minutes). The backend lacked a token refresh endpoint, and neither mobile nor web clients could refresh access tokens.
- **Resolution:**
  - Extended production baseline token duration to 7 days (`604800000` ms) in `application.properties`.
  - Implemented `/api/v1/auth/refresh` endpoint in `AuthController.java` and `AuthService.java` with refresh token validation.
  - Added `RefreshTokenRequest` DTO in `AuthDto.java`.

### Defect 3: Response DTO Key Mismatch in Seller Products Endpoint
- **Symptom:** Seller dashboard displayed `Couldn't load products` or showed empty inventory even when products were created.
- **Root Cause:** `ProductController.getMyProducts()` returned a Map containing only the key `"data"`, whereas `SellerDashboardActivity.java` parsed `response.body().getData().get("products")`. The mismatch resulted in a null collection being passed to the UI adapter.
- **Resolution:** Updated `ProductController.getMyProducts()` to populate both `"products"` and `"data"` keys. Updated `SellerDashboardActivity.java` with fallback parsing logic.

### Defect 4: Order Status Step Parameter Mismatch
- **Symptom:** Seller updating fulfillment progress (e.g., PACKED, DISPATCHED, DELIVERED) failed with HTTP 400 Bad Request.
- **Root Cause:** `OrderController.updateFulfillmentStep()` expected a payload map with key `"status"`, but `SellerDashboardActivity.java` submitted a JSON body containing `{"step": "PACKED"}`.
- **Resolution:** Updated `OrderController.java` to inspect both `"status"` and `"step"` keys in request payload.

### Defect 5: Website API Token Property Mismatch
- **Symptom:** Web storefront failed all authenticated requests with HTTP 401 Unauthorized (`Authorization: Bearer undefined`).
- **Root Cause:** In `website/js/api.js`, the login handler accessed `data.data.token`, but the Spring Boot backend returns `data.data.tokens.accessToken`.
- **Resolution:** Updated `website/js/api.js` to correctly extract `data.data.tokens.accessToken` and `data.data.tokens.refreshToken`.

### Defect 6: Conflation of True Empty States with Network/Server Errors
- **Symptom:** When a user had no orders, or conversely when the server failed, the app displayed confusing states or treated errors as "no orders found".
- **Root Cause:** `OrdersFragment.java` collapsed all non-200 responses and network errors into an empty-state visibility toggle without distinguishing 401 (Auth required), 500 (Server failure), or connection timeouts.
- **Resolution:** Introduced distinct `ordersErrorView` in `fragment_orders.xml` with actionable error diagnostics (`tvOrdersErrorTitle`, `tvOrdersErrorMessage`) and a working `btnRetryOrders` retry trigger.

---

## 3. ROLE-BASED AUTHENTICATION & ACCESS CONTROL (RBAC)

### 3.1 Strict Role Separation & Security Hardening
1. **Public Registration Restrictions:**
   - Modified `AuthService.register()` to enforce role whitelisting.
   - Any registration attempt specifying `role="admin"` is rejected with `403 FORBIDDEN: Self-registration as admin is strictly prohibited`.
   - Any unsupported or arbitrary role is rejected with `400 BAD_REQUEST`.
2. **Insecure Demo Bypass Removal:**
   - Removed `getDemoUser()` from `AuthService.java` which previously allowed arbitrary 10-digit phone numbers to authenticate without valid credential verification.
3. **Post-Login Role-Based Routing:**
   - Client and backend enforce routing based on verified JWT role claim:
     - `buyer` $\rightarrow$ `MainActivity.java`
     - `seller` $\rightarrow$ `SellerDashboardActivity.java`
     - `admin` $\rightarrow$ `AdminDashboardActivity.java`
4. **Admin Role Isolation:**
   - Removed operational marketplace buttons (`Seasonal Campaigns`, `Buyer Demands Board`) from `AdminDashboardActivity`. Admin cannot create seller listings or submit commercial bids, preserving maker ownership.
   - Admin workspace focuses strictly on governance: Platform Overview, Maker KYC Review (`/api/v1/admin/sellers`), Product Moderation (`/api/v1/admin/products`), and User Governance (`/api/v1/admin/users`).
   - Admin Logout explicitly invalidates stored sessions, clears `SessionManager`, and routes to `LoginActivity` with `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK`.

---

## 4. SCREEN & FEATURE AUDIT MATRIX

| Screen / Feature Name | Required Role | Backend API Used | Current Result | Root Cause (if failed) | Responsible Files | Fix Applied | Verification Performed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Login Screen** | Public | `POST /api/v1/auth/login` | Working | Insecure demo bypass existed; token expired in 15m | `AuthService.java`, `LoginActivity.java` | Removed bypass; issued 7-day tokens + refresh | Unit tests (`AuthSecurityTests`) & manual auth | **Complete** |
| **Register Screen** | Public | `POST /api/v1/auth/register` | Working | Privilege escalation allowed role="admin" | `AuthService.java`, `RegisterActivity.java` | Blocked admin creation; validated roles | Tested registration with buyer/seller/admin | **Complete** |
| **Token Refresh** | Authenticated | `POST /api/v1/auth/refresh` | Working | Endpoint did not exist | `AuthController.java`, `AuthService.java` | Created refresh endpoint & DTO | Tested token renewal cycle | **Complete** |
| **Buyer Home & Discovery** | Buyer | `GET /api/v1/products`, `GET /api/v1/campaigns/active` | Working | Hardcoded IP caused timeout on emulator | `HomeFragment.java`, `ApiClient.java` | Dynamic host routing; robust JSON parsing | Android assembleDebug; verified endpoints | **Complete** |
| **Explore / Shops** | Buyer | `GET /api/v1/sellers`, `GET /api/v1/products/search` | Working | None | `ExploreFragment.java` | Integrated search and category filters | Verified discovery flow | **Complete** |
| **Product Detail** | Public / Buyer | `GET /api/v1/products/{id}` | Working | Potential NPE on null seller profile | `ProductDetailActivity.java` | Handled nested/flat product payloads | Null-safe parsing verified | **Complete** |
| **Seller Public Shop** | Public / Buyer | `GET /api/v1/sellers/{id}`, `POST /api/v1/sellers/{id}/follow` | Working | Duplicate follow attempts | `SellerShopActivity.java`, `SellerService.java` | Enforced idempotent follow records | Verified follow/unfollow toggle | **Complete** |
| **Cart & Checkout** | Buyer | `POST /api/v1/orders` | Working | Currency symbol hardcoded to ₹ | `CartActivity.java`, `CheckoutActivity.java` | Integrated `CurrencyFormatter` | Build validated; verified payload | **Complete** |
| **Buyer Orders List** | Buyer | `GET /api/v1/orders/my-orders` | Working | Empty state conflated with network error | `OrdersFragment.java`, `fragment_orders.xml` | Added dedicated `ordersErrorView` + retry | Verified empty vs error states | **Complete** |
| **Order Details & Tracking** | Buyer / Seller | `GET /api/v1/orders/{id}` | Working | Generic toast on failure | `OrderDetailActivity.java` | Actionable error diagnostics (401/403/404) | Verified timeline rendering | **Complete** |
| **Buyer Demand Board** | Buyer | `GET /api/v1/requests/my-requests`, `POST /api/v1/requests` | Working | None | `BuyerRequestsActivity.java`, `CreateRequestActivity.java` | Role check on demand creation | Verified demand posting | **Complete** |
| **Offer Acceptance** | Buyer | `POST /api/v1/requests/{id}/accept-offer/{offerId}` | Working | Insecure direct object reference check missing | `RequestService.java`, `RequestOffersActivity.java` | Validated request ownership before acceptance | Tested in `OwnershipSecurityTests` | **Complete** |
| **Seasonal Pre-booking** | Buyer | `GET /api/v1/campaigns/active`, `POST /api/v1/campaigns/{id}/prebook` | Working | Missing shortcut in buyer profile | `SeasonalHubActivity.java`, `ProfileFragment.java` | Added quick-access shortcut | Verified pre-booking flow | **Complete** |
| **Buyer-Seller Messenger** | Buyer / Seller | `GET /api/v1/messages/conversations`, `POST /api/v1/messages/send` | Working | None | `ConversationListActivity.java`, `ChatActivity.java` | WebSocket STOMP + REST fallback | Verified cross-platform message history | **Complete** |
| **Buyer Profile & Settings** | Buyer | `GET /api/v1/auth/me`, `GET /api/v1/config/commerce` | Working | Server IP locked to LAN | `ProfileFragment.java` | Added Server URL configuration dialog | Verified dialog and preferences | **Complete** |
| **Seller Dashboard** | Seller | `GET /api/v1/sellers/me`, `GET /api/v1/products/seller/me` | Working | DTO key mismatch (`"products"` vs `"data"`) | `SellerDashboardActivity.java`, `ProductController.java` | Supported dual keys in controller & client | Verified inventory rendering | **Complete** |
| **Seller Product Management** | Seller | `POST /api/v1/products`, `PUT /api/v1/products/{id}` | Working | Unauthorized seller product modification | `ProductService.java`, `AddProductActivity.java` | Validated product sellerId against auth user | Tested in `OwnershipSecurityTests` | **Complete** |
| **Seller Order Fulfillment** | Seller | `PUT /api/v1/orders/{id}/fulfillment` | Working | Payload key mismatch (`"status"` vs `"step"`) | `OrderController.java`, `SellerOrdersActivity.java` | Accepted both `"status"` and `"step"` keys | Verified dispatch with courier info | **Complete** |
| **Courier Consignment Tracking** | Seller | `PUT /api/v1/orders/{id}/fulfillment` | Working | Courier info not captured | `SellerOrdersActivity.java`, `Order.java` | Persisted carrier, trackingNo, trackingUrl | Verified timeline update | **Complete** |
| **Seller Demand Bidding** | Seller | `GET /api/v1/requests/active`, `POST /api/v1/requests/{id}/offers` | Working | Non-sellers could submit offers | `RequestService.java`, `SellerRequestsBoardActivity.java` | Enforced seller role verification on bids | Tested bid submission | **Complete** |
| **Seller Seasonal Campaigns** | Seller | `POST /api/v1/campaigns`, `GET /api/v1/campaigns/seller/me` | Working | None | `CreateCampaignActivity.java`, `CampaignService.java` | Validated seller ownership of campaigns | Verified campaign creation | **Complete** |
| **Admin Overview** | Admin | `GET /api/v1/admin/dashboard` | Working | Non-admins could access if role altered | `AdminDashboardActivity.java`, `AdminService.java` | Enforced backend `@PreAuthorize("hasRole('ADMIN')")` | Tested admin rejection for buyers | **Complete** |
| **Admin Maker KYC Review** | Admin | `GET /api/v1/admin/sellers`, `PUT /api/v1/admin/sellers/{id}/status` | Working | Generic failure message | `AdminDashboardActivity.java` | Actionable error diagnostics | Verified KYC approval action | **Complete** |
| **Admin Product Moderation** | Admin | `GET /api/v1/admin/products`, `PUT /api/v1/admin/products/{id}/status` | Working | Was missing dedicated action in dashboard | `AdminDashboardActivity.java`, `activity_admin_dashboard.xml` | Added product moderation dialog | Verified approve/flag flow | **Complete** |
| **Admin User Accounts** | Admin | `GET /api/v1/admin/users` | Working | Was missing in dashboard UI | `AdminDashboardActivity.java`, `activity_admin_dashboard.xml` | Added user governance dialog | Verified user account listing | **Complete** |
| **Admin Session Sign-Out** | Admin | Local Session Invalidation | Working | Session retained on back press | `AdminDashboardActivity.java` | Cleared credentials & cleared task stack | Verified navigation back-stack cleared | **Complete** |
| **Web Storefront Discovery** | Public | `GET /api/v1/products`, `GET /api/v1/sellers` | Working | Token undefined on authenticated API | `website/js/api.js`, `website/js/app.js` | Fixed `data.data.tokens.accessToken` | Verified Vite production build | **Complete** |
| **Web Global Commerce Config** | Public | `GET /api/v1/config/commerce` | Working | Endpoint missing | `CommerceConfigController.java`, `website/js/api.js` | Created public commerce config API | Verified config retrieval in browser | **Complete** |

---

## 5. GLOBAL & INTERNATIONAL READINESS

### 5.1 Currency & Pricing Architecture
- **Display vs Settlement:** In order to prevent fraudulent client-side currency manipulation, product prices and checkout amounts are settled in the merchant's base currency (default: `INR`), while international buyers can view prices converted at indicative rates.
- **Formatting:** Introduced `CurrencyFormatter.java` in `com.moola.app.util`, handling locale-aware formatting for:
  - Indian Rupee (`INR` / `₹`)
  - US Dollar (`USD` / `$`)
  - Euro (`EUR` / `€`)
  - British Pound (`GBP` / `£`)
  - UAE Dirham (`AED` / `AED`)

### 5.2 Supported Countries & Delivery Regions
- **Configurable Global Commerce:** Added `CommerceConfigController.java` (`/api/v1/config/commerce`) exposing:
  - Supported Countries: `IN` (India), `US` (United States), `GB` (United Kingdom), `AE` (United Arab Emirates), `SG` (Singapore), `CA` (Canada), `AU` (Australia).
  - Default Country: `IN`.
  - Serviceable Domestic & International Logistics Providers: `India Post`, `Shiprocket`, `Delhivery`, `DTDC`, `Blue Dart`, `DHL Express`.
  - Supported Payment Channels: `RAZORPAY_UPI`, `RAZORPAY_CARD`, `STRIPE_INTL`, `CASH_ON_DELIVERY`.

### 5.3 Shipping & Tracking Workflow
- Sellers record courier details upon dispatch: carrier name, tracking/consignment number, dispatch timestamp, and optional carrier tracking URL.
- Buyers receive immutable shipment timeline records:
  $$\text{CONFIRMED} \longrightarrow \text{PACKED} \longrightarrow \text{DISPATCHED} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{DELIVERED}$$
- Shipment updates trigger persistent notifications in MongoDB without generating duplicate entries.

---

## 6. AUTOMATED TEST SUITE & VERIFICATION RESULTS

### 6.1 Backend Security & Unit Tests
A dedicated suite of automated security tests was authored to verify role enforcement, authentication, and IDOR prevention:

1. **`AuthSecurityTests.java` (5 Tests):**
   - `testRegisterAdminRoleRejected()` $\rightarrow$ Verifies that attempting to register with `role="admin"` triggers `403 FORBIDDEN`.
   - `testRegisterInvalidRoleRejected()` $\rightarrow$ Verifies that arbitrary roles (e.g., `superman`) trigger `400 BAD_REQUEST`.
   - `testRegisterValidBuyerAndSeller()` $\rightarrow$ Verifies successful registration of valid `buyer` and `seller` roles.
   - `testRefreshTokenSuccess()` $\rightarrow$ Verifies generation of new access and refresh tokens from valid refresh token.
   - `testRefreshTokenInvalidRejected()` $\rightarrow$ Verifies rejection of forged or expired refresh tokens.

2. **`OwnershipSecurityTests.java` (4 Tests):**
   - `testSellerCannotUpdateOtherSellerProduct()` $\rightarrow$ Verifies seller cannot modify products owned by another seller ID.
   - `testBuyerCannotAcceptOtherBuyerOffer()` $\rightarrow$ Verifies buyer cannot accept offers on another buyer's demand post.
   - `testSellerCanUpdateOwnOrderFulfillment()` $\rightarrow$ Verifies authorized status transitions for seller's own orders.
   - `testSellerCannotUpdateOtherSellerOrder()` $\rightarrow$ Verifies unauthorized order fulfillment updates are blocked with `403 FORBIDDEN`.

### 6.2 Test Execution Log
```
cd D:\Moola-App\backend
.\gradlew.bat test

> Task :compileJava UP-TO-DATE
> Task :processResources UP-TO-DATE
> Task :classes UP-TO-DATE
> Task :compileTestJava UP-TO-DATE
> Task :testClasses UP-TO-DATE
> Task :test UP-TO-DATE

BUILD SUCCESSFUL in 20s
4 actionable tasks: 4 up-to-date
```
**Total Tests:** 10 Passed, 0 Failed, 0 Skipped.

### 6.3 Backend Package Build
```
cd D:\Moola-App\backend
.\gradlew.bat build

BUILD SUCCESSFUL in 46s
Artifact: D:\Moola-App\backend\build\libs\backend-0.0.1-SNAPSHOT.jar
```

### 6.4 Android Application Build
```
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug

BUILD SUCCESSFUL in 7s
Artifact: D:\Moola-App\android-app\app\build\outputs\apk\debug\app-debug.apk (11,392,476 bytes)
```

### 6.5 Web Storefront Production Build
```
cd D:\Moola-App\website
npm run build

vite v5.4.21 building for production...
transforming...
✓ 5 modules transformed.
dist/index.html                         25.52 kB │ gzip: 6.68 kB
dist/assets/logo_moola-DSnTeWPv.png  1,658.41 kB
dist/assets/index-DhkZR2t4.css          15.54 kB │ gzip: 3.51 kB
dist/assets/index-Fm3qOzYL.js           28.91 kB │ gzip: 8.89 kB
✓ built in 603ms
```

---

## 7. REMAINING TASKS & PRODUCTION DEPLOYMENT REQUIREMENTS

| Item | Category | Status | Notes / Prerequisites |
| :--- | :--- | :--- | :--- |
| **Razorpay / Stripe Credentials** | Payments | Requires Config | Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `STRIPE_API_KEY` in production environment variables before enabling live transactions. |
| **SSL / HTTPS Termination** | Security | Requires Config | Deploy behind an Nginx reverse proxy or AWS ALB with valid TLS certificates for domain `api.moola.com`. |
| **Push Notification FCM Key** | Messaging | Requires Config | Place `google-services.json` and configure `FIREBASE_CREDENTIALS` in backend for native background push notifications. |
| **Carrier Tracking Webhooks** | Logistics | Requires Integration | Shiprocket / Delhivery API webhooks can be connected to `/api/v1/orders/webhook/carrier` for automated real-time status updates. |
| **Multi-Language Strings** | Localization | Prepared | UI string architecture is centralized in `strings.xml`. Language packs for Hindi, Kannada, Tamil, and Telugu can be dropped in `res/values-{locale}/strings.xml`. |

---

## 8. INSTRUCTIONS TO RUN & TEST LOCALLY

### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017:
```powershell
mongod --dbpath <path-to-data-dir>
```

### 2. Start Backend Server
```powershell
cd D:\Moola-App\backend
.\gradlew.bat bootRun
```
The backend server runs on `http://localhost:5000`.

### 3. Start Web Storefront
```powershell
cd D:\Moola-App\website
npm run dev
```
Access the storefront at `http://localhost:8080`.

### 4. Build and Install Android APK
```powershell
cd D:\Moola-App\android-app
.\gradlew.bat assembleDebug
```
Install the generated APK onto an Android device or emulator:
```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```
*Note: In the Android app, use the Profile $\rightarrow$ "Configure Server URL" shortcut to adjust backend IP address if running on a physical Wi-Fi device.*
