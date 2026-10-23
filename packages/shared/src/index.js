"use strict";
// ============================================================
// MOOLA Shared Types
// Used by both apps/server and apps/mobile
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETION_REQUEST_STATUS_LABELS = exports.DELETION_REQUEST_STATUSES = exports.COMPLAINT_STATUS_LABELS = exports.COMPLAINT_STATUSES = exports.COMPLAINT_CATEGORY_LABELS = exports.COMPLAINT_CATEGORIES = exports.CUSTOMER_SUPPORT_CONFIG = exports.SUPPORTED_LANGUAGES = exports.PRODUCT_UNITS = exports.ORDER_STATUS_LABELS = exports.ORDER_STATUSES = exports.CARRIER_TRACKING_TEMPLATES = exports.SUPPORTED_CARRIERS = void 0;
exports.normalizeWhatsAppNumber = normalizeWhatsAppNumber;
exports.isValidWhatsAppNumber = isValidWhatsAppNumber;
exports.buildWhatsAppChatUrl = buildWhatsAppChatUrl;
exports.formatWhatsAppEnquiryMessage = formatWhatsAppEnquiryMessage;
exports.generateCarrierTrackingUrl = generateCarrierTrackingUrl;
exports.SUPPORTED_CARRIERS = [
    'India Post',
    'DTDC',
    'Professional Couriers',
    'Blue Dart',
    'ST Courier',
    'Trackon',
    'Other',
];
exports.CARRIER_TRACKING_TEMPLATES = {
    'India Post': 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
    'DTDC': 'https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strAvbNo={TRACKING_NO}',
    'Blue Dart': 'https://www.bluedart.com/tracking?trackNumber={TRACKING_NO}',
    'Professional Couriers': 'https://www.tpcindia.com/track.aspx',
    'ST Courier': 'https://stcourier.com/',
    'Trackon': 'https://trackon.in/',
};
// ─── Constants ───────────────────────────────────────────────
exports.ORDER_STATUSES = [
    'ORDER_REQUESTED',
    'ORDER_CONFIRMED',
    'PAYMENT_PENDING',
    'PAYMENT_VERIFICATION_PENDING',
    'PAID',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'pending',
    'confirmed',
    'packed',
    'handed_to_courier',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'return_requested',
    'returned',
];
exports.ORDER_STATUS_LABELS = {
    ORDER_REQUESTED: 'Order Requested',
    ORDER_CONFIRMED: 'Order Confirmed',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_VERIFICATION_PENDING: 'Payment Verification Pending',
    PAID: 'Paid & Verified',
    PROCESSING: 'Processing',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    IN_TRANSIT: 'In Transit',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    pending: 'Order Requested',
    confirmed: 'Order Confirmed',
    packed: 'Packed',
    handed_to_courier: 'Handed to Courier',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    return_requested: 'Return Requested',
    returned: 'Returned',
};
exports.PRODUCT_UNITS = [
    'kg', 'g', 'mg', 'litre', 'ml',
    'piece', 'dozen', 'pack', 'bottle', 'jar', 'box',
    '100g', '250g', '500g',
];
exports.SUPPORTED_LANGUAGES = ['en', 'kn'];
// ─── Helper Functions ────────────────────────────────────────
/**
 * Normalizes a phone number to standard international format without '+' or spaces.
 * Defaults to 91 (India) if 10 digits provided.
 */
function normalizeWhatsAppNumber(rawPhone) {
    if (!rawPhone)
        return '';
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
        return `91${digitsOnly}`;
    }
    return digitsOnly;
}
/**
 * Validates whether a phone number is a potentially valid mobile number with country code.
 */
function isValidWhatsAppNumber(phone) {
    const normalized = normalizeWhatsAppNumber(phone);
    return /^[1-9]\d{9,14}$/.test(normalized);
}
/**
 * Builds the official WhatsApp click-to-chat URL: https://wa.me/<number>?text=<encoded_text>
 */
function buildWhatsAppChatUrl(phone, text) {
    const normalized = normalizeWhatsAppNumber(phone);
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${normalized}?text=${encodedText}`;
}
/**
 * Formats standard product enquiry message as required by MOOLA specification:
 * Hello MOOLA Seller, I am interested in [product name].
 * Product ID: [product ID]
 * Quantity: [quantity]
 * Please confirm availability, total price, delivery options, and payment instructions.
 */
function formatWhatsAppEnquiryMessage(params) {
    const priceLine = params.price ? `\nDisplayed Price: ₹${params.price} / ${params.unit}` : '';
    return `Hello MOOLA Seller, I am interested in ${params.productName}.\nProduct ID: ${params.productId}\nQuantity: ${params.quantity} ${params.unit}${priceLine}\nPlease confirm availability, total price, delivery options, and payment instructions.`;
}
/**
 * Generates an official tracking link from trusted carrier templates or validates a custom carrier URL.
 */
function generateCarrierTrackingUrl(carrierName, trackingNumber, customUrl) {
    if (customUrl && (customUrl.startsWith('http://') || customUrl.startsWith('https://'))) {
        return customUrl;
    }
    const template = exports.CARRIER_TRACKING_TEMPLATES[carrierName];
    if (!template) {
        return undefined;
    }
    if (template.includes('{TRACKING_NO}')) {
        return template.replace('{TRACKING_NO}', encodeURIComponent(trackingNumber.trim()));
    }
    return template;
}
exports.CUSTOMER_SUPPORT_CONFIG = {
    brandName: 'MOOLA',
    brandTagline: 'From the Source. To Your Home.',
    numbers: {
        primary: {
            raw: '8088653820',
            display: '+91 80886 53820',
            telUri: 'tel:+918088653820',
            whatsappUrl: 'https://wa.me/918088653820',
            label: 'Support Line 1',
        },
        secondary: {
            raw: '6362095126',
            display: '+91 63620 95126',
            telUri: 'tel:+916362095126',
            whatsappUrl: 'https://wa.me/916362095126',
            label: 'Support Line 2',
        },
    },
    // Support email is explicitly null until an official address is provisioned.
    // DO NOT invent a placeholder email.
    supportEmail: null,
    operatingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
    policyVersion: '1.0.0',
    policyEffectiveDate: 'October 22, 2026',
    publicWebRoutes: {
        privacyPolicy: '/privacy-policy',
        termsAndConditions: '/terms-and-conditions',
        accountDeletion: '/account-deletion',
        customerSupport: '/support',
    },
};
// ─── Customer Complaints & Support Tickets ───────────────────
exports.COMPLAINT_CATEGORIES = [
    'account_login',
    'product_quality_damaged',
    'incorrect_product_description',
    'seller_communication',
    'payment_enquiry',
    'order_cancellation_refund',
    'delivery_tracking',
    'privacy_account_deletion',
    'other',
];
exports.COMPLAINT_CATEGORY_LABELS = {
    account_login: 'Account & Login',
    product_quality_damaged: 'Product Quality or Damaged Product',
    incorrect_product_description: 'Incorrect Product Description',
    seller_communication: 'Seller Communication',
    payment_enquiry: 'Payment Enquiry',
    order_cancellation_refund: 'Order Cancellation or Refund',
    delivery_tracking: 'Delivery or Tracking',
    privacy_account_deletion: 'Privacy or Account Deletion',
    other: 'Other Enquiry / Feedback',
};
exports.COMPLAINT_STATUSES = [
    'SUBMITTED',
    'ACKNOWLEDGED',
    'UNDER_REVIEW',
    'RESOLVED',
    'CLOSED',
];
exports.COMPLAINT_STATUS_LABELS = {
    SUBMITTED: 'Submitted',
    ACKNOWLEDGED: 'Acknowledged',
    UNDER_REVIEW: 'Under Review',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
};
// ─── Account Deletion ────────────────────────────────────────
exports.DELETION_REQUEST_STATUSES = [
    'PENDING',
    'UNDER_REVIEW',
    'COMPLETED',
    'REJECTED',
];
exports.DELETION_REQUEST_STATUS_LABELS = {
    PENDING: 'Pending Verification',
    UNDER_REVIEW: 'Under Review',
    COMPLETED: 'Completed (Deactivated & Anonymized)',
    REJECTED: 'Rejected',
};
//# sourceMappingURL=index.js.map