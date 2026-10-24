# MOOLA — SOCIAL MARKETPLACE GAP AUDIT & ARCHITECTURAL BLUEPRINT
**Document ID:** `MOOLA-SOC-MKT-001`  
**Date:** 2026-10-24  
**Status:** In Progress / Implementation Milestone  
**Scope:** Android Java Native, Spring Boot Java 3.3.4, MongoDB, Vite Storefront Website

---

## 1. Executive Summary & Problem Analysis
The MOOLA platform aims to be India's premier social-commerce marketplace for homemade foods, traditional products, honey, pickles, spices, snacks, and seasonal/festival products. 

A thorough inspection of the repository (`D:\Moola-App`) revealed the following foundational gaps:
1. **Undefined Social Follow Relationship**: Buyers could not follow independent makers/sellers or receive a curated feed of listings from makers they follow.
2. **Missing In-App Persistent Notification Centre**: While in-app events occur (orders, offers, status updates), there was no persistent MongoDB `Notification` collection to power a unified notification bell, unread counts, and deep-linking on either Android or Web.
3. **Admin Role Leaks & Overreach**: 
   - Admin previously had permissions to create seasonal/festival campaigns (`SeasonalCampaignController` had `@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")`). Per marketplace ethics, only actual makers own seasonal and festival harvest listings.
   - Admin lacked a prominent, dedicated, verified Logout mechanism that clears sessions, clears sensitive tokens, and terminates activity backstacks.
4. **Seller Shop Isolation & Visibility**: Buyers needed a dedicated public Seller Shop profile (`/api/v1/sellers/{id}/shop`) with maker credentials, FSSAI verification badge, bio, follower count, Follow/Following state, and the seller's active product catalogue (regular + festival).
5. **Reverse Marketplace (Buyer Demands & Offers)**: Demand posts (`CustomRequest`) existed but lacked:
   - Automated notification dispatches to eligible verified sellers when matching demand is posted.
   - Automated buyer notification when an offer is submitted.
   - Strict prevention of duplicate active offers or race-conditioned duplicate order generation upon offer acceptance.
6. **Cross-Platform Parity**: The website storefront (`website/`) was missing the dedicated Seller Shop view, Follow/Following interaction, Buyer Demand posting modal, and Notification centre.

---

## 2. Differentiated Roles & Architectural Boundaries

| Feature / Capability | Buyer | Seller (Artisan Maker) | Admin (Platform Safety) |
|---|---|---|---|
| **Primary Dashboard** | Search, Feed, Seasonal, Demands, Orders, Notifications | Shop profile, Listings, Orders fulfillment, Demand board, Offers, Analytics | Metrics, KYC approvals, Complaints SLA, Deletion queue, Order safety |
| **Product Listings** | Browse, Search, Wishlist, Filter | Create, Edit, Stock update, Toggle active | Moderate, Flag, Deactivate prohibited items (Cannot create on seller behalf) |
| **Seasonal / Festival Listings** | Browse, Pre-book, Track reservation | Create, Edit, Set quota, Manage pre-orders | Moderate only (Strictly FORBIDDEN from creating or managing) |
| **Buyer Demand Posts** | Create requirement, compare offers, accept 1 offer, cancel | Browse board, submit product link or custom quote | Moderate spam (Strictly FORBIDDEN from creating demands or quotes) |
| **Social Follow** | Follow / Unfollow makers, view followed makers feed | View follower count, view follower list | Audit platform graphs |
| **Fulfillment & Dispatch** | View stepper tracking, copy AWB, open tracking URL | Mark Packed, enter carrier, consignment ID, URL | Inspect delivery exceptions |
| **Notifications** | Bell icon, unread count, deep link to orders/offers/products | Bell icon, demand alerts, new order alerts | System alerts |
| **Session & Logout** | Clear session, return to public/login | Clear session, return to public/login | Dedicated confirmation dialog, clear token, `finishAffinity()` |

---

## 3. Database Schema & Indexing Plan

### 3.1. `SellerFollow` Collection (`seller_follows`)
- `id` (ObjectId string)
- `buyerId` (Indexed string)
- `sellerId` (Indexed string)
- `sellerShopName` (String)
- `createdAt` (Instant)
- **Compound Unique Index:** `{ "buyerId": 1, "sellerId": 1 }` (Prevents duplicate follow records atomically).

### 3.2. `Notification` Collection (`notifications`)
- `id` (ObjectId string)
- `recipientId` (Indexed string)
- `title` (String)
- `message` (String)
- `type` (Enum string: `NEW_PRODUCT`, `BUYER_REQUEST`, `SELLER_OFFER`, `ORDER_STATUS`, `CHAT_MESSAGE`, `PRE_BOOKING`)
- `referenceId` (String - Order ID, Request ID, Product ID, etc.)
- `referenceType` (String - `ORDER`, `CUSTOM_REQUEST`, `PRODUCT`, `CHAT`)
- `isRead` (boolean, default false)
- `createdAt` (Instant)
- **Index:** `{ "recipientId": 1, "createdAt": -1 }`, `{ "recipientId": 1, "isRead": 1 }`.

### 3.3. Hardening `CustomRequest` (Reverse Marketplace)
- `resultingOrderId` ensures atomic single-order generation.
- Offer status lifecycle: `PENDING` -> `ACCEPTED` / `REJECTED`.
- Atomic validation prevents double-acceptance or duplicate orders.

---

## 4. REST API Endpoint Mapping

| Endpoint | Method | Role Required | Description |
|---|---|---|---|
| `/api/v1/sellers/{id}/shop` | `GET` | Public / Authenticated | Public Seller Shop profile + active products + seasonal listings |
| `/api/v1/sellers/{id}/follow` | `POST` | `ROLE_BUYER` | Follow an artisan seller (idempotent, unique index) |
| `/api/v1/sellers/{id}/follow` | `DELETE` | `ROLE_BUYER` | Unfollow an artisan seller |
| `/api/v1/sellers/{id}/follow-status` | `GET` | `ROLE_BUYER` | Returns `{ isFollowing: true/false, followerCount: N }` |
| `/api/v1/sellers/following` | `GET` | `ROLE_BUYER` | List of makers followed by current buyer |
| `/api/v1/sellers/feed/followed` | `GET` | `ROLE_BUYER` | Aggregated product feed from followed makers |
| `/api/v1/notifications` | `GET` | Authenticated | List persistent notifications for current user |
| `/api/v1/notifications/unread-count` | `GET` | Authenticated | Count of unread notifications |
| `/api/v1/notifications/{id}/read` | `PATCH` | Authenticated | Mark single notification as read |
| `/api/v1/notifications/read-all` | `POST` | Authenticated | Mark all notifications as read for current user |
| `/api/v1/campaigns` | `POST` | `ROLE_SELLER` ONLY | Create seasonal campaign (ADMIN stripped) |
| `/api/v1/custom-requests` | `POST` | `ROLE_BUYER` | Post product demand (Triggers notifications to matching sellers) |
| `/api/v1/custom-requests/{id}/offers` | `POST` | `ROLE_SELLER` ONLY | Submit quote on buyer demand (Triggers notification to buyer) |

---

## 5. Client Integration Plan

### 5.1. Android Java Native
1. **`SellerShopActivity`**:
   - Header with Maker logo, Shop Name, Verified FSSAI badge, bio, total followers.
   - Follow / Following toggle button with instant UI updates and backend sync.
   - Tab/Section displaying the maker's regular homemade products and seasonal festival offerings.
2. **`NotificationsActivity`**:
   - Recycler view displaying timestamped in-app alerts with icon based on notification type.
   - Tap to open associated Order, Demand Quote, or Product.
   - "Mark all as read" action.
3. **`AdminDashboardActivity`**:
   - Remove unauthorized campaign creation / seller offering hooks.
   - Add explicit "Logout" action with confirmation dialog, token clearance, and backstack termination.

### 5.2. Website Storefront
1. **Header Updates**:
   - Notification Bell with unread counter badge.
   - "Post Requirement" quick button in header & hero.
2. **Seller Showcase & Shop Modal**:
   - Explore Artisan Makers section.
   - View Maker Profile modal with Follow button and products.
3. **Demand Post Modal**:
   - Simple modal for buyers to submit a product demand post directly to the backend.

---

## 6. Execution Timeline & Verification Milestones
- **Step 1**: Write audit document (Completed).
- **Step 2**: Implement Backend models, repositories, services, controllers (`SellerFollow`, `Notification`, shop endpoint, permission fixes).
- **Step 3**: Website API and UI enhancements (`api.js`, `index.html`, `app.js`).
- **Step 4**: Android app models, API service, UI activities (`SellerShopActivity`, `NotificationsActivity`, Admin Logout).
- **Step 5**: Full compilation and verification (`gradlew test`, `gradlew assembleDebug`, `npm run build`).
