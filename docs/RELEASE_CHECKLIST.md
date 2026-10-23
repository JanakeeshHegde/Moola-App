# MOOLA Marketplace — Pre-Release Legal & Operational Checklist

> **Status:** PENDING OWNER / LEGAL REVIEW  
> **Effective Date:** October 22, 2026  
> **Document Purpose:** This checklist flags statutory business, seller, customer-care, and compliance disclosures that must be reviewed, verified, and officially completed by the platform owners prior to public production deployment on the Google Play Store or public web domains.

---

## 1. Statutory Business & Legal Entity Disclosures

| Item | Requirement / Regulation | Current Status | Required Action Before Public Launch |
| :--- | :--- | :--- | :--- |
| **Legal Entity Name** | Consumer Protection (E-Commerce) Rules, 2020 | ⚠️ **Unverified** | Provide the registered legal entity name (e.g., Sole Proprietorship, LLP, or Private Limited). Do not use an informal trade name alone. |
| **Registered Business Address** | Consumer Protection (E-Commerce) Rules, 2020 | ⚠️ **Unverified** | Provide the official physical registered office address and principal place of business in India. |
| **Corporate Identification / Registration** | Companies Act / MSME / Shops & Establishment | ⚠️ **Unverified** | Add CIN, LLPIN, or MSME registration number once official certificates are in place. |
| **GSTIN Registration** | Central Goods & Services Tax (CGST) Act | ⚠️ **Unverified** | If platform fees or marketplace facilitator thresholds apply, configure the valid GSTIN. |
| **Official Customer Support Email** | Consumer Protection (E-Commerce) Rules, 2020 | ⚠️ **Pending Setup** | Create and configure an official domain-based email address (e.g., `support@yourdomain.com`). Set in `CUSTOMER_SUPPORT_CONFIG`. |

---

## 2. Customer Support & Internal Ticket Management

| Item | Context | Status | Operational Notes |
| :--- | :--- | :--- | :--- |
| **Designated Support Helplines** | Two developer lines (`8088653820`, `6362095126`) | ✅ **Implemented** | Functional in mobile app and public web pages with direct `tel:` and WhatsApp links. |
| **Operating Hours** | Mon - Sat: 9:00 AM - 7:00 PM IST | ✅ **Configured** | Clearly displayed in in-app and web banners. |
| **Complaint Ticketing System** | In-app submission, tracking, SLA countdown | ✅ **Implemented** | Unique ticket references (`TKT-YYYYMMDD-XXXX`) generated; status history tracked. |
| **Administrator Ticket Management** | Restricted to the two developers | ✅ **Implemented** | Authenticated admin tab in `AdminDashboardScreen` and protected endpoints under `/api/v1/admin/complaints`. |
| **SLA Response Deadline** | 48-hour internal target | ✅ **Implemented** | Flags overdue tickets in admin dashboard; does not claim full legal immunity. |
| **Grievance Officer Designation** | Information Technology (Intermediary Guidelines) | ⚠️ **Pending Formal Appointment** | **DO NOT invent a fictitious Grievance Officer name or designation.** Once the business formally appoints an officer, update documentation and policies accordingly. Internally, the two developers manage tickets. |

---

## 3. Food Product & Seller Compliance (FSSAI)

| Item | Requirement | Current Status | Required Action Before Public Launch |
| :--- | :--- | :--- | :--- |
| **Platform Scope** | Shelf-stable homemade & artisanal food (chips, honey, spices, pickles) | ✅ **Clarified** | Platform is **not a vegetable or fresh produce marketplace**. |
| **Seller FSSAI Licensing** | Food Safety and Standards Act, 2006 | ⚠️ **Review Required** | Ensure all onboarding sellers possess valid FSSAI registration/license numbers and upload them during KYC. |
| **Allergen & Expiry Disclosures** | FSS (Packaging & Labelling) Regulations | ⚠️ **Review Required** | Sellers must declare common allergens (nuts, sesame, gluten) and shelf-life / storage instructions on packaging. |
| **Organic Claims Verification** | Jaivik Bharat / NPOP / PGS-India | ⚠️ **Review Required** | Do not label products as "Certified Organic" without verifying official NPOP or PGS-India certification certificates uploaded by the seller. |

---

## 4. Payment & WhatsApp Communication Scope

| Item | Implemented Scope | Status | Operational Notes |
| :--- | :--- | :--- | :--- |
| **Direct UPI / Manual Transfer** | Buyer transfers directly to seller UPI ID; submits UTR | ✅ **Implemented** | Clarified in policies that MOOLA does not hold funds in escrow or operate a payment gateway. |
| **Automated Gateway / Escrow** | Razorpay / in-app cards | ⚪ **Not in Current Scope** | Policies and terms explicitly state that payment is manual direct transfer. No fake claims made. |
| **WhatsApp Enquiries** | Redirects to external WhatsApp app | ✅ **Clarified** | Policies explicitly clarify that Meta's WhatsApp terms apply and MOOLA does not host or store WhatsApp chat records. |

---

## 5. Account Deletion & Data Privacy (Google Play Console)

| Item | Play Console Policy Requirement | Current Status | Operational Notes |
| :--- | :--- | :--- | :--- |
| **In-App Deletion Workflow** | Users can delete account within app | ✅ **Implemented** | Profile &gt; Settings &gt; Delete Account with confirmation and active order check. |
| **Public HTTPS Deletion Webpage** | Direct URL accessible without app sign-in | ✅ **Implemented** | Served at `/account-deletion` with public verification request form. |
| **Public Privacy Policy Webpage** | Direct HTTPS URL for Play Console | ✅ **Implemented** | Served at `/privacy-policy`. |
| **Public Terms & Conditions Webpage** | Direct HTTPS URL | ✅ **Implemented** | Served at `/terms-and-conditions`. |
| **Data Anonymization** | PII scrubbed while preserving tax audit logs | ✅ **Implemented** | Deactivates tokens, anonymizes name/phone/address, and deactivates seller listings. |
| **Domain & SSL Deployment** | HTTPS production URL | ⚠️ **Pending Hosting** | Public pages are served by Express from `apps/server/public/`. A custom production domain with valid SSL certificate must be mapped before submitting URLs to Google Play Console. |

---

## 6. Pre-Launch Owner Approval Sign-Off

- [ ] Legal entity name and registered address verified and inserted by application owner.
- [ ] Official support email provisioned and added to `CUSTOMER_SUPPORT_CONFIG`.
- [ ] Production HTTPS domain configured with SSL certificate (e.g. `https://moola.example.com`).
- [ ] Public URLs tested over HTTPS from external browser:
  - `https://<domain>/privacy-policy`
  - `https://<domain>/terms-and-conditions`
  - `https://<domain>/account-deletion`
  - `https://<domain>/support`
- [ ] URLs submitted into Google Play Console (Data Safety & App Content sections).
- [ ] Seller onboarding verification workflow confirmed by development team.
