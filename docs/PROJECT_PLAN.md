# MOOLA — From the Source. To Your Home.
## Comprehensive Project Plan

> **Blueprint Source**: `organic_marketplace_blueprint (1).pdf` — Organic Foods & Home-Made Products Platform (V1.0)
> **Generated**: 2026-10-22

---

## 1. Executive Summary

MOOLA is a Direct-to-Consumer (D2C) e-commerce + reverse marketplace connecting:
- **Farmers & organic food producers** (forest honey, organic staples, seasonal produce)
- **Home-made product makers** (traditional pickles, festival sweets, artisanal items)
- **Health-conscious consumers** in India

The platform eliminates intermediaries, bringing verified fresh products directly to buyers while empowering rural/artisanal sellers with AI-assisted listing tools in regional languages.

---

## 2. Architecture Overview

```
MOOLA Monorepo
  apps/mobile     (Expo React Native + TypeScript)
  apps/server     (Node.js + Express.js + TypeScript)
  packages/shared (Shared types + constants)
  docs/           (Planning documents)

Mobile App communicates via HTTPS REST + WebSocket with Backend API.
Backend integrates: MongoDB, Socket.io, FCM, Cloudinary.
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 51+ + TypeScript |
| Navigation | React Navigation v6 |
| State Mgmt | Zustand + TanStack Query |
| Backend | Node.js 20+ + Express.js + TypeScript |
| Database | MongoDB 7+ + Mongoose |
| Real-time | Socket.io 4.x |
| Auth | JWT (access 15m + refresh 7d) + bcrypt |
| Payments | Razorpay (sandbox mode) |
| Logistics | Manual India Post & Courier Consignment Tracking |
| Storage | Cloudinary |
| Push Notifs | Firebase Cloud Messaging |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |

---

## 3. User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Buyer** | Browse, search, wishlist, cart, checkout, chat, custom requests, reviews, order tracking |
| **Seller** | Product CRUD, inventory, orders, chat, custom offers, pre-bookings, earnings |
| **Admin** | User management, seller verification, product moderation, campaigns, reports |

---

## 4. Database Schema Design

### User
_id, name, phone, email, passwordHash, role[buyer|seller|admin], avatar, preferredLanguage[en|kn], location{state,district,pincode}, isActive, fcmTokens[], createdAt, updatedAt

### SellerProfile
_id, userId, shopName, description, logo, kycStatus[pending|under_review|verified|rejected], kycDocuments[], bankDetails{accountNumber,ifsc,accountName}, isVerified, totalRating, ratingCount, totalSales

### Category
_id, name{en,kn}, slug, icon, image, parentCategory, isActive, sortOrder

### Product
_id, sellerId, categoryId, name{en,kn}, description{en,kn}, images[], price, mrp, unit, quantityAvailable, minOrderQty, tags[], isOrganic, isCertified, certificationDetails, isActive, isApproved, moderationNote, isSeasonal, seasonalFrom, seasonalTo, isFestivalItem, festivalTags[], averageRating, reviewCount

### Order
_id, buyerId, sellerId, items[{productId,name,price,qty,unit}], status[pending|confirmed|packed|handed_to_courier|in_transit|out_for_delivery|delivered|cancelled|return_requested|returned], shippingAddress{name,phone,line1,line2,city,state,pincode}, subtotal, shippingFee, discount, total, paymentId, shipmentId, customRequestId, isPreBooking, preCampaignId, cancellationReason, returnReason, deliveredAt

### Payment
_id, orderId, buyerId, sellerId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency, status[created|paid|failed|refunded], webhookEvents[], refundId, refundAmount

### CustomRequest
_id, buyerId, title, description, quantity, unit, budget, categoryId, location, images[], status[open|offers_received|accepted|expired|cancelled], expiresAt, offers[{sellerId,price,note,status,createdAt}], acceptedOfferId, orderId

### Conversation
_id, participants[userId], orderId, productId, customRequestId, lastMessage, lastMessageAt, isActive

### Message
_id, conversationId, senderId, type[text|image|order_ref|product_ref], content, mediaUrl, isRead, readAt

### Review
_id, orderId, productId, buyerId, sellerId, rating(1-5), title, body, images[], sellerResponse, isVerifiedPurchase, isModerated, moderationNote

### SeasonalCampaign
_id, title{en,kn}, description, bannerImage, startDate, endDate, bookingDeadline, products[{productId,priceOverride,maxQuantity,bookedQuantity}], isActive, createdBy

### PreBooking
_id, campaignId, buyerId, sellerId, items[{productId,qty,price}], totalAmount, paymentId, status[booked|confirmed|cancelled|fulfilled]

### Shipment
_id, orderId, provider[shiprocket|delhivery], providerShipmentId, awbNumber, labelUrl, trackingUrl, currentStatus, trackingEvents[{status,location,timestamp,description}], estimatedDelivery

### Notification
_id, userId, type[order_update|message|custom_offer|shipment|prebooking|system], title, body, data(JSON), isRead, fcmSent

### Wishlist
_id, buyerId, productId

### Cart
_id, buyerId, items[{productId,qty,addedAt}]

### Address
_id, userId, name, phone, line1, line2, city, state, pincode, isDefault

---

## 5. API Endpoints (REST /api/v1)

### Auth
POST /auth/register | POST /auth/login | POST /auth/refresh | POST /auth/logout
POST /auth/forgot-password | POST /auth/reset-password | GET /auth/me | PATCH /auth/me

### Products
GET /products | GET /products/:id | POST /products [Seller] | PATCH /products/:id [Seller]
DELETE /products/:id [Seller] | POST /products/ai-listing [Seller] | GET /products/my [Seller]

### Categories
GET /categories | POST /categories [Admin] | PATCH /categories/:id [Admin]

### Cart
GET /cart | POST /cart/items | PATCH /cart/items/:productId | DELETE /cart/items/:productId | DELETE /cart

### Wishlist
GET /wishlist | POST /wishlist | DELETE /wishlist/:productId

### Addresses
GET /addresses | POST /addresses | PATCH /addresses/:id | DELETE /addresses/:id

### Orders
POST /orders | GET /orders | GET /orders/:id | PATCH /orders/:id/status [Seller/Admin]
POST /orders/:id/cancel | POST /orders/:id/return

### Payments
POST /payments/create-order | POST /payments/verify | POST /payments/webhook | GET /payments/:orderId

### Custom Requests (Reverse Marketplace)
GET /custom-requests [Seller] | POST /custom-requests [Buyer] | GET /custom-requests/:id
POST /custom-requests/:id/offers [Seller] | PATCH /custom-requests/:id/offers/:offerId/accept [Buyer]
POST /custom-requests/:id/cancel [Buyer] | GET /custom-requests/my [Buyer]

### Conversations & Messages
GET /conversations | POST /conversations | GET /conversations/:id/messages
POST /conversations/:id/messages | PATCH /conversations/:id/read

### Reviews
GET /reviews/product/:productId | POST /reviews [Buyer] | PATCH /reviews/:id/seller-response [Seller]
DELETE /reviews/:id [Admin]

### Seller
GET /seller/profile | PATCH /seller/profile | POST /seller/kyc | GET /seller/earnings | GET /seller/analytics

### Campaigns & Pre-bookings
GET /campaigns | GET /campaigns/:id | POST /campaigns [Admin] | PATCH /campaigns/:id [Admin]
POST /campaigns/:id/prebooking [Buyer] | GET /prebookings/my [Buyer]

### Shipments
POST /shipments [Seller] | GET /shipments/:orderId | GET /shipments/:id/tracking

### Admin
GET /admin/users | PATCH /admin/users/:id | GET /admin/sellers/pending | PATCH /admin/sellers/:id/verify
GET /admin/products/pending | PATCH /admin/products/:id/moderate | GET /admin/orders | GET /admin/reports



### Notifications
GET /notifications | PATCH /notifications/:id/read | PATCH /notifications/read-all | POST /notifications/fcm-token

### Health
GET /api/health

---

## 6. Screen Inventory

### Auth
SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen, OTPVerificationScreen, ForgotPasswordScreen

### Buyer
HomeScreen, ProductListScreen, ProductDetailScreen, SellerProfileScreen, SearchScreen,
SearchResultsScreen, FilterScreen, MyRequestsScreen, CreateRequestScreen, RequestDetailScreen,
OfferCompareScreen, CartScreen, CheckoutScreen, AddressListScreen, AddAddressScreen,
PaymentScreen, OrderSuccessScreen, ProfileScreen, WishlistScreen, OrderHistoryScreen,
OrderDetailScreen, TrackOrderScreen, PreBookingsScreen, ChatListScreen, ChatDetailScreen,
NotificationsScreen, SettingsScreen

### Seller
SellerHomeScreen, EarningsScreen, AnalyticsScreen, ProductsListScreen, AddProductScreen,
EditProductScreen, ImageUploadScreen, SellerOrderListScreen, SellerOrderDetailScreen,
BrowseRequestsScreen, SellerRequestDetailScreen, MyOffersScreen, SellerChatListScreen,
SellerChatDetailScreen, SellerProfileEditScreen, KYCSubmissionScreen

---

## 7. Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| join_conversation | C->S | { conversationId } |
| send_message | C->S | { conversationId, content, type } |
| new_message | S->C | { message } |
| message_read | C->S | { conversationId, messageId } |
| messages_read | S->C | { conversationId, readBy } |
| typing_start / typing_stop | C->S | { conversationId } |
| user_typing | S->C | { conversationId, userId } |
| offer_received | S->C | { customRequestId, offer } |
| order_status_update | S->C | { orderId, status } |

---

## 8. Integration Notes

### Razorpay (Payments)
- IMPORTANT: True escrow API requires RBI license. We implement Razorpay Route (split payments) as compliant alternative.
- Sandbox mode during development. Never claim live escrow capability.
- Server creates payment order -> Client SDK opens checkout -> Server verifies signature.

### Shiprocket / Delhivery (Logistics)
- Adapter pattern: abstract provider behind common interface.
- During development: mock adapter returns realistic test data.
- Requires seller-registered shipper account for production.



### Push Notifications (Expo Push Service & Provider Abstraction)
- Free Expo Push Notification service (`https://exp.host/--/api/v2/push/send`).
- Standardized `IPushNotificationProvider` interface for zero-friction provider swapping.
- In-app notification history and unread status stored primarily in MongoDB Atlas.
- Missing push credentials or token issues never disrupt in-app operations.
- Production Android (FCM V1) and iOS (APNs) credentials managed via Expo / EAS CLI (`eas credentials`).

---

## 9. Security Checklist

- [ ] JWT with short access token expiry (15m) + refresh token rotation
- [ ] bcrypt password hashing (cost factor 12)
- [ ] Rate limiting: 5 login attempts per 15m per IP
- [ ] Zod validation on all API request bodies
- [ ] Razorpay webhook signature verification (HMAC-SHA256)
- [ ] Socket.io auth middleware (JWT on connection)
- [ ] Helmet.js security headers
- [ ] CORS: whitelist only known origins
- [ ] File upload: MIME + size validation, no local disk writes
- [ ] MongoDB: Mongoose model-level validation, no raw user-input queries
- [ ] .env.example with placeholders only, never commit real secrets
- [ ] Admin routes: role === 'admin' check + separate middleware

---

## 10. Phased Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Plan & Architecture | COMPLETE |
| 1 | Monorepo setup, Express health, MongoDB connect, Expo scaffold | ACTIVE |
| 2 | All Mongoose models + seed data | PENDING |
| 3 | Auth API + Login/Register screens | PENDING |
| 4 | Buyer marketplace (browse, search, product detail) | PENDING |
| 5 | Seller dashboard + product management | PENDING |
| 6 | Reverse marketplace | PENDING |
| 7 | Real-time chat (Socket.io) | PENDING |
| 8 | Cart, checkout, Razorpay | PENDING |
| 9 | Logistics adapter | PENDING |
| 10 | Seasonal pre-booking | PENDING |
| 11 | Manual seller product listing & catalog management | COMPLETE |
| 12 | Text search, category filtering & sorting | COMPLETE |
| 13 | Reviews & ratings | PENDING |
| 14 | Admin workflows | PENDING |
| 15 | Push notifications | PENDING |
| 16 | Security audit | PENDING |
| 17 | Performance optimization | PENDING |
| 18 | QA & testing | PENDING |
| 19 | Deployment prep | PENDING |
