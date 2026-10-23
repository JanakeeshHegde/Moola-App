# MOOLA — REST API Contract Specification

All endpoints are hosted at `http://localhost:5000/api/v1/`.  
Standard response envelope:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new customer or maker |
| `POST` | `/api/v1/auth/login` | Public | Login with phone & password; returns JWT |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile |

---

## 2. Product Catalog (`/api/v1/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Public | Search products with query, category, min/max price, sort |
| `GET` | `/api/v1/products/{id}` | Public | Detailed product view with seller information |
| `GET` | `/api/v1/products/my` | Seller | Retrieve maker's own listings |
| `POST` | `/api/v1/products` | Seller | Publish a new homemade product listing |
| `PATCH`| `/api/v1/products/{id}` | Seller / Admin | Update product details or stock status |
| `DELETE`| `/api/v1/products/{id}` | Seller / Admin | Remove listing |

---

## 3. Orders & Direct Requests (`/api/v1/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders/request` | Authenticated | Create direct order request to artisan maker |
| `GET` | `/api/v1/orders/my` | Buyer | List buyer's active and fulfilled orders |
| `GET` | `/api/v1/orders/seller` | Seller | List incoming orders received by maker |
| `GET` | `/api/v1/orders/{id}` | Authenticated | Get detailed order status and consignment info |
| `POST` | `/api/v1/orders/{id}/confirm` | Seller | Confirm fresh batch preparation |
| `POST` | `/api/v1/orders/{id}/shipment` | Seller | Record courier/India Post AWB tracking number |
| `PATCH`| `/api/v1/orders/{id}/verify-payment` | Seller | Mark payment as verified |
| `POST` | `/api/v1/orders/{id}/utr` | Buyer | Submit transaction UTR reference |
| `POST` | `/api/v1/orders/{id}/cancel` | Authenticated | Cancel order request |

---

## 4. WhatsApp Enquiries (`/api/v1/enquiries`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/enquiries` | Public / Buyer | Log customer WhatsApp click-to-chat inquiry |
| `GET` | `/api/v1/enquiries/seller` | Seller | Retrieve maker's received inquiries |

---

## 5. Maker Portal (`/api/v1/seller`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/seller/profile` | Seller | Retrieve maker shop details & KYC status |
| `PATCH`| `/api/v1/seller/profile` | Seller | Update kitchen details, UPI, and dispatch address |
| `POST` | `/api/v1/seller/apply` | Authenticated | Submit maker onboarding & KYC application |
| `GET` | `/api/v1/seller/analytics` | Seller | Metrics: total products, pending orders |

---

## 6. Admin Portal (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/analytics` | Admin | Total buyers, sellers, products, pending KYC |
| `GET` | `/api/v1/admin/sellers` | Admin | List maker applications for KYC review |
| `PUT` | `/api/v1/admin/sellers/{id}/kyc` | Admin | Approve or reject maker KYC |
| `GET` | `/api/v1/admin/buyers` | Admin | List registered buyer accounts |

---

## 7. Customer Care & SLA Complaints (`/api/v1/complaints`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/complaints` | Authenticated | Submit grievance ticket (48h SLA response target) |
| `GET` | `/api/v1/complaints/my` | Buyer | List user's active grievance tickets |
| `GET` | `/api/v1/complaints/admin` | Admin | Operational queue of complaints |
| `PATCH`| `/api/v1/complaints/admin/{id}` | Admin | Resolve ticket and append public reply |

---

## 8. Account Deletion & Privacy (`/api/v1/account-deletion`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/account-deletion/request` | Authenticated | Queue account for permanent erasure |
| `GET` | `/api/v1/account-deletion/my` | Authenticated | Check deletion status |
| `GET` | `/api/v1/account-deletion/admin` | Admin | Review deletion queue |
| `PATCH`| `/api/v1/account-deletion/admin/{id}/process` | Admin | Anonymize user records |
