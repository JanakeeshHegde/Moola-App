# MOOLA — Product Roadmap & Future Extension Plan

**Document Version**: 1.0.0  
**Last Updated**: October 22, 2026  
**Project**: MOOLA — *From the Source. To Your Home.*  

---

## 1. Current Implemented Capabilities (Release v1.0)

| Domain | Implemented Features |
| :--- | :--- |
| **Product Discovery** | Categorized organic homemade foods (chips, raw honey, spices, authentic pickles, snacks). Full-text compound search, category pills, seasonal banners. |
| **WhatsApp Direct Negotiation** | Official `wa.me/<phone>?text=<msg>` click-to-chat generation. Auditable MongoDB enquiry records. Safe non-blocking execution. |
| **Order Management** | Cart checkout, direct order requests, immutable order item snapshots, state machine with strict transition guards, seller confirmation/decline. |
| **Payment Verification** | Direct UPI payment instructions, buyer payment reference (UTR) submission, seller independent receipt verification before dispatch. Decoupled from shipment status. |
| **Manual Logistics Tracking** | Manual consignment recording (India Post, DTDC, Blue Dart, etc.), trusted carrier link generation via pre-approved URL templates, milestone status updates. |
| **In-App Notifications** | MongoDB Atlas storage with unread counts, read/unread status, mark-all-read, 90-day TTL index, mobile notification center. |
| **Push Notifications** | Abstracted `IPushNotificationProvider`, `ExpoPushNotificationProvider` (`https://exp.host/--/api/v2/push/send`), non-blocking failure recovery. |
| **Seller Tools** | Manual product creation/editing (`AddProductScreen`), inventory management, KYC submission and verification, order fulfillment dashboard. |

---

## 2. Explicitly Excluded Features (By Specification)

1. **AI Voice Features**: AI voice product listing, speech-to-text product creation, and voice search are explicitly excluded from the current scope. Normal text search and manual product listing are used instead.
2. **Fresh Vegetables**: MOOLA is dedicated exclusively to homemade and specialty organic shelf-stable/semi-perishable food products (chips, honey, spices, pickles, snacks). Fresh green vegetables are not part of the product scope.
3. **Automated Payment Gateways**: In this release, automated payment gateway charging (Razorpay/Stripe) is omitted to preserve direct buyer-seller trust via WhatsApp and manual UPI confirmation.
4. **Automated Carrier APIs**: Shiprocket and Delhivery automated booking APIs are omitted in this version; manual consignment recording and trusted carrier tracking links are used instead.

---

## 3. Future Extension Architecture

### 3.1 Payment Gateway Integration Plan (e.g. Razorpay / Cashfree)
The existing database schema and controller boundaries were designed to be forward-compatible with automated payment gateways without altering existing order records:

- **Schema Fields Already Present in `Payment.ts`**:
  ```ts
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  idempotencyKey?: string;
  refundId?: string;
  refundAmount?: number;
  ```
- **Step-by-Step Implementation Strategy**:
  1. Create `IPaymentGatewayProvider` interface in `apps/server/src/integrations/payments/`.
  2. Implement `RazorpayPaymentProvider` implementing `createOrder()`, `verifySignature()`, `capturePayment()`, and `initiateRefund()`.
  3. In `apps/server/src/controllers/paymentController.ts`, branch based on selected payment method: if `method === 'razorpay'`, generate gateway order ID and return checkout options to the mobile app.
  4. On mobile, launch the Razorpay checkout sheet. Upon signature return, call `POST /api/v1/payments/verify-gateway` to verify HMAC signature server-side.
  5. Upon verification, transition `paymentStatus` to `PAID` using existing `NotificationService.notifyPaymentVerified(...)`.

### 3.2 Automated Courier Integration Plan (e.g. Shiprocket / Delhivery)
The existing shipment schema and controller boundaries are forward-compatible with automated 3PL logistics:

- **Schema Fields Already Present in `Shipment.ts`**:
  ```ts
  provider?: 'manual_courier' | 'india_post' | 'shiprocket' | 'delhivery';
  awbNumber?: string;
  trackingEvents?: Array<{ status: string; location?: string; timestamp: string; description: string }>;
  ```
- **Step-by-Step Implementation Strategy**:
  1. Create `IShippingProvider` interface in `apps/server/src/integrations/shipping/`.
  2. Implement `ShiprocketShippingProvider` implementing `checkServiceability(pincode)`, `generateAWB()`, `requestPickup()`, and `trackAWB()`.
  3. Add a webhook handler `POST /api/v1/shipments/webhook` to ingest carrier tracking milestones from Shiprocket/Delhivery.
  4. On receiving carrier tracking webhook, map courier milestone to canonical `ShipmentStatus` (`IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`), update `Shipment.sellerUpdates`, and dispatch `NotificationService.notifyShipmentStatusUpdate(...)`.

### 3.3 Enhanced Localization (Kannada & Regional Languages)
- All product schemas already support localized text structures (`{ en: string; kn: string }`).
- Extend `apps/mobile/src/localization/i18n.ts` with additional Indian languages (Tamil, Telugu, Hindi, Malayalam) as market expansion proceeds.

### 3.4 Direct Image Upload via Presigned URLs
- Implement direct mobile-to-Cloudinary image uploads using server-signed presigned URLs (`POST /api/v1/uploads/presigned-url`), enabling sellers to capture product photos directly from the mobile camera without pasting URL strings.
