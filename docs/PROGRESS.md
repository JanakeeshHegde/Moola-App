# MOOLA — Progress Tracker

## Phase 0 — Plan & Architecture ✅ COMPLETE
**Date**: 2026-10-22  
**Files**: `docs/PROJECT_PLAN.md`, `docs/PROGRESS.md`

### Completed
- Analyzed `organic_marketplace_blueprint.pdf` completely.
- Documented 19-phase roadmap, database schema, REST API contract (60+ endpoints), Socket.io events, and security architecture.
- Clarified Razorpay escrow regulations (using compliant Razorpay Route / direct payout model).

---

## Phase 1 — Monorepo Foundation & Shared Types ✅ COMPLETE
**Date**: 2026-10-22  
**Workspace Packages**:
- `packages/shared`: Shared TypeScript types, interfaces, constants, and status enums (`@moola/shared`).
- `apps/server`: Express.js + TypeScript + Node.js backend.
- `apps/mobile`: React Native + Expo SDK 51 + TypeScript mobile app.

### Commands Run & Results:
- `npm run build --workspace=packages/shared` ➔ **Exit Code 0** (Generated `dist/index.d.ts` & `dist/index.js`).
- `npm test --workspace=apps/server` ➔ **Exit Code 0** (8 tests passed).
- `npm run build --workspace=apps/server` ➔ **Exit Code 0** (Compiled cleanly to `dist/`).
- `npm run tsc --workspace=apps/mobile` ➔ **Exit Code 0** (Zero TypeScript errors).

---

## Phase 2 — Database Models & Schemas ✅ COMPLETE
**Date**: 2026-10-22  
**Files**: `apps/server/src/models/*`

Implemented 13 Mongoose schemas with compound indexes and validation:
- `User.ts`: Buyers, Farmers, Admins, phone/email validation, bcrypt password hashing, FCM push tokens.
- `SellerProfile.ts`: Shop name, KYC status (`pending`, `under_review`, `verified`, `rejected`), bank details, ratings.
- `Category.ts`: Bilingual localized names (English & Kannada), slugs, active status.
- `Product.ts`: Pricing, stock, units, organic certification badges, multi-image gallery, full-text indexes.
- `Buyer.ts`: Cart, Wishlist, and multi-address management.
- `Order.ts`: Order splitting, multi-status lifecycle (`confirmed`, `packed`, `handed_to_courier`, `in_transit`, `out_for_delivery`, `delivered`), address snapshots.
- `Payment.ts`: Razorpay order ID, payment ID, HMAC signature, idempotency key, webhook event logs.
- `CustomRequest.ts`: Reverse marketplace custom requests and seller price offers.
- `Chat.ts`: Socket.io conversations, persistent messages, read receipts, product references.
- `Campaign.ts`: Seasonal harvest and festival pre-booking campaigns with capacity limit tracking.
- `Shipment.ts`: Carrier tracking (Shiprocket/Delhivery), AWB numbers, verified tracking timeline events.
- `Review.ts`: Verified purchase check (only delivered orders), 5-star ratings, buyer photos, seller responses.
- `Notification.ts`: Push and in-app notifications with 90-day TTL index.

---

## Phase 3 — Authentication & Authorization ✅ COMPLETE
**Files**: `apps/server/src/routes/auth.ts`, `apps/server/src/middleware/auth.ts`
- JWT access tokens (15m expiry) and refresh tokens (7d expiry).
- Role-based access control (`buyer`, `seller`, `admin`).
- Brute-force rate limiting on auth endpoints (`authLimiter`).
- Seller registration workflow with store profile generation.

---

## Phase 4 — Buyer Marketplace & Shopping Cart ✅ COMPLETE
**Files**:
- `apps/server/src/routes/products.ts`, `apps/server/src/routes/buyer.ts`
- `apps/mobile/src/screens/buyer/HomeScreen.tsx`
- `apps/mobile/src/screens/buyer/ProductDetailScreen.tsx`
- `apps/mobile/src/screens/buyer/CartScreen.tsx`
- `apps/mobile/src/screens/buyer/CheckoutScreen.tsx`
- High-res product cards with organic badges, farmer origin, price per unit, cart quantity controls.
- Dynamic delivery fee threshold calculation (Free delivery over ₹500).

---

## Phase 5 — Seller Dashboard & Product Management ✅ COMPLETE
**Files**:
- `apps/server/src/routes/seller.ts`
- `apps/mobile/src/screens/seller/SellerDashboardScreen.tsx`
- `apps/mobile/src/screens/seller/SellerOrdersScreen.tsx`
- `apps/mobile/src/screens/seller/SellerKYCScreen.tsx`
- Revenue metrics, active produce, pending orders summary.
- KYC documentation upload (FSSAI, NPOP / PGS-India organic certificate, bank account).
- Order fulfillment: Mark orders packed, generate Shiprocket AWB tracking numbers.

---

## Phase 6 — Reverse Marketplace ("Custom Requests") ✅ COMPLETE
**Files**:
- `apps/server/src/routes/customRequests.ts`
- `apps/mobile/src/screens/buyer/CustomRequestsScreen.tsx`
- `apps/mobile/src/screens/buyer/NewCustomRequestScreen.tsx`
- Buyers post custom requirements (e.g. 5kg unpolished Navara rice).
- Farmers discover relevant requests in their category and submit custom price offers.
- Buyers compare quotes, delivery timelines, initiate chat, or accept offer to generate order.

---

## Phase 7 — Real-Time Chat ✅ COMPLETE
**Files**:
- `apps/server/src/sockets/chat.ts`, `apps/server/src/routes/conversations.ts`
- `apps/mobile/src/screens/buyer/ChatScreen.tsx`
- Socket.io authenticated connection with JWT middleware.
- Persistent chat history, product context attachment banner, quick reply suggestion chips.

---

## Phase 8 — Payments & Razorpay Integration ✅ COMPLETE
**Files**:
- `apps/server/src/routes/payments.ts`
- Razorpay order creation (`orders.create`), client-side checkout initiation.
- Server-side HMAC SHA256 signature verification.
- Idempotent webhook processing (`payment.captured`, `payment.failed`, `refund.processed`).
- Verified payment records with transaction references.

---

## Phase 9 — Logistics & Verified Shipment Tracking ✅ COMPLETE
**Files**:
- `apps/server/src/routes/shipments.ts`
- `apps/mobile/src/components/TimelineTracker.tsx`
- `apps/mobile/src/screens/buyer/OrderTrackingScreen.tsx`
- Verified 6-stage order timeline:
  `ORDER_CONFIRMED ➔ PACKED ➔ HANDED_TO_COURIER ➔ IN_TRANSIT ➔ OUT_FOR_DELIVERY ➔ DELIVERED`.
- AWB tracking generation, delivery date estimation, farm dispatch details.

---

## Phase 10 — Seasonal & Festival Pre-Booking ✅ COMPLETE
**Files**:
- `apps/server/src/routes/campaigns.ts`
- `apps/mobile/src/screens/buyer/PreBookingScreen.tsx`
- Tree-fresh seasonal campaigns (Sirsi Alphonso Mango Harvest, Diwali Desi Cow Ghee Festival Box).
- Production capacity tracking (e.g., 64/100 slots booked), deadline countdown, reservation slots.

---

## Phase 11 & 12 — Manual Seller Product Listing & Text Search ✅ COMPLETE
**Date**: 2026-10-22  
**Updates**:
- Removed all AI voice-assisted product listing, speech-to-text endpoints, voice search, and microphone interfaces.
- Replaced with dedicated `AddProductScreen.tsx` for manual seller product listing and editing:
  - Product name in English and Kannada
  - Category selector (chips, pickles, honey, spices, snacks)
  - Price (₹), MRP, available stock inventory, and unit picker
  - High-resolution product photo preview and URL input
  - Organic and purity certification toggles (zero chemicals, FSSAI / PGS-India / NPOP)
  - Product description and shelf life details
- Preserved text-based search, multi-category filtering, and sorting in `HomeScreen.tsx`.
- Removed voice configuration keys (`GOOGLE_STT_API_KEY`, `OPENAI_API_KEY`) and unmounted unused `/ai` backend routes.

---

## Phase 13 & 14 — Reviews, Trust & Admin Dashboard ✅ COMPLETE
**Files**:
- `apps/server/src/routes/reviews.ts`, `apps/server/src/routes/admin.ts`
- `apps/mobile/src/screens/admin/AdminDashboardScreen.tsx`
- Verified purchase enforcement: only buyers who received a delivered order can review.
- Automated rating aggregation for products and farmers.
- Admin dashboard: Pending KYC approvals queue, review farmer credentials, approve/reject, GMV tracking.

---

## Phase 15 — UI/UX Polish & Localization ✅ COMPLETE
**Files**:
- `apps/mobile/src/theme/colors.ts`: Organic green palette (`#2D5A27`, `#4A7C39`, `#1B3B17`, `#F8FAF5`).
- `apps/mobile/src/localization/i18n.ts`: Full bilingual English & Kannada dictionary.
- One-tap language switcher (`English` ⟷ `ಕನ್ನಡ`) and role switcher (`Buyer` ⟷ `Seller` ⟷ `Admin`) in header for complete end-to-end evaluation.

---

## Phase 16 — Atlas DB Connection, WhatsApp Enquiry Flow, & Manual Courier Tracking ✅ COMPLETE
**Date**: 2026-10-22  
**Key Features Implemented**:
1. **Atlas Connection & Credential Safety**:
   - `apps/server/src/config/database.ts`: Safe connection with URI password masking in logs (`//***:***@`).
   - Root `.gitignore` enforces `.env` isolation so credentials are never checked into Git.
   - `apps/server/.env.example` provides the placeholder `MONGODB_URI=mongodb+srv://<username>:<password>@moolacluster.xxxx.mongodb.net/moola?retryWrites=true&w=majority`.
   - Health check endpoint `GET /api/health` reports `{ connected: true, host, name }` without exposing credentials.
2. **Business Domain Alignment**:
   - Focus: Homemade and organic food products (Kerala banana chips, Jackfruit chips, Appe Midi pickles, wild honey, authentic spices, native flours).
   - Removed vegetables marketplace references; updated seed data with authentic homemade chips & pickles.
3. **Database Models & Architecture**:
   - `WhatsAppEnquiry.ts`: Dedicated collection for tracking WhatsApp product enquiries without claiming delivery.
   - `Shipment.ts`: Manual consignment tracking supporting India Post, DTDC, Professional Couriers, Blue Dart, ST Courier, Trackon, and Custom carriers.
   - `Order.ts`: Added `OrderItemSnapshot` for price/name preservation across catalog edits, separate `PaymentStatus` and `ShipmentStatus`, and full status flow:
     `ORDER_REQUESTED ➔ ORDER_CONFIRMED ➔ PAYMENT_PENDING ➔ PAYMENT_VERIFICATION_PENDING ➔ PAID ➔ PROCESSING ➔ PACKED ➔ SHIPPED ➔ IN_TRANSIT ➔ OUT_FOR_DELIVERY ➔ DELIVERED ➔ CANCELLED`.
   - `SellerProfile.ts`: Added verified WhatsApp contact, UPI ID, and direct payment instructions.
4. **WhatsApp Direct Enquiry & Order Flow**:
   - Prefilled message generation adhering to official `https://wa.me/<number>?text=<encoded_text>`.
   - Real-time logging of customer interest in MongoDB (`POST /api/v1/enquiries`).
   - Order request endpoint (`POST /api/v1/orders/request`) placing orders in `ORDER_REQUESTED`.
   - Payment discussions held directly via WhatsApp; buyer can submit UPI transaction reference (`POST /api/v1/payments/submit-reference`) which flags `PAYMENT_VERIFICATION_PENDING`.
   - Authorized seller verifies receipt independently (`PATCH /api/v1/orders/:id/verify-payment`) before transitioning to `PAID`.
   - Architecture designed to allow seamless drop-in of payment gateways in future updates without breaking orders.
5. **Manual India Post & Courier Tracking**:
   - Seller inputs courier name, consignment/AWB number, dispatch date, and notes (`POST /api/v1/shipments/manual`).
   - Official tracking URL templates for verified carriers (India Post, DTDC, Blue Dart) with "Track Shipment on Carrier Website" button.
   - Buyer tracking screen transparently notes "Tracking updates are seller-provided".
6. **Mobile App Screens Updated**:
   - `ProductDetailScreen`: "Enquire on WhatsApp" + "Place Order Request" buttons.
   - `CheckoutScreen`: WhatsApp payment instructions & UPI reference input (no fake payment success screen).
   - `OrderTrackingScreen` & `TimelineTracker`: Multi-status tracker, separate payment & shipment badges, official carrier tracking launch.
   - `SellerOrdersScreen` & `SellerDashboardScreen`: Confirm/reject order requests, verify payments, manage manual shipments, and alert counts.

---

## Phase 17 — In-App Notifications & Resilient Push Provider Abstraction ✅ COMPLETE
**Date**: 2026-10-22  
**Key Features Implemented**:
1. **Primary Database & Zero Firebase Auth/DB Footprint**:
   - Kept MongoDB Atlas as the exclusive primary database for in-app notification storage, unread counts, read/unread states, and history.
   - Audited existing codebase and confirmed zero usage of Firebase Authentication or Firebase Realtime/Firestore database.
2. **Push Provider Abstraction**:
   - `pushProvider.interface.ts`: Standardized `IPushNotificationProvider` with `send()` and `sendBatch()` accepting `PushNotificationPayload`.
   - `expoPushProvider.ts`: Production provider targeting Expo's official REST API (`https://exp.host/--/api/v2/push/send`). Validates token format (`ExponentPushToken[...]`), inspects ticket responses (`status === 'ok'` vs error), and never claims delivery without verification.
   - `mockPushProvider.ts`: Memory-backed test provider for zero-dependency CI and local execution.
   - Provider swapping via `NotificationService.setProvider()`.
3. **Resilient Notification Dispatcher**:
   - `notificationService.ts`: Always creates in-app `Notification` document in MongoDB Atlas first.
   - Push notifications are strictly non-blocking: missing push tokens or network errors log safely and never disrupt order requests, confirmations, or payments.
   - Wired triggers across key marketplace events:
     - New Order Request 🛒 (notifies seller)
     - Order Confirmation ✅ (notifies buyer)
     - Order Request Cancellation (notifies buyer)
     - Payment Reference Submitted 💳 (notifies seller)
     - Payment Verified 🎉 (notifies buyer)
     - Manual Consignment Dispatched 📦 (notifies buyer with courier & AWB)
     - Shipment Progress Updates 🚚 (notifies buyer)
     - Custom Reverse Bid Offers 🤝 (notifies buyer)
4. **Cleaned Firebase Configuration**:
   - Removed unused `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_CLIENT_EMAIL` from `env.ts`, `setup.ts`, `.env.example`, and `.env`.
   - Added optional `EXPO_ACCESS_TOKEN` for Expo push rate limits.
   - Documented production Android FCM V1 and iOS APNs credentials setup through Expo / EAS CLI (`eas credentials`).
5. **Mobile In-App Notification Center**:
   - `NotificationsScreen.tsx`: Tabbed view (`All`, `Unread`, `Orders`, `Shipments`), relative timestamps ("15m ago", "2h ago"), unread green indicators, tap-to-navigate to orders, pull-to-refresh, "Mark All as Read", and "Clear All".
   - `Header.tsx`: Added notification bell icon (`🔔`) with unread badge counter for quick access across Buyer, Seller, and Admin interfaces.
   - Registered `Notifications` in `RootNavigator.tsx`.

---

## Validation Summary
| Component | Test / Build Command | Result |
| :--- | :--- | :--- |
| Shared Types (`@moola/shared`) | `npm run build` | ✅ Succeeded (0 errors) |
| Backend API (`@moola/server`) | `npm test` | ✅ 35 / 35 tests passed |
| Backend API (`@moola/server`) | `npm run build` | ✅ Succeeded (dist compiled cleanly) |
| Mobile App (`@moola/mobile`) | `npx tsc --noEmit` | ✅ Succeeded (0 errors) |

