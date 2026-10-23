// ============================================================
// MOOLA Shared Types
// Used by both apps/server and apps/mobile
// ============================================================

// ─── User & Auth ─────────────────────────────────────────────

export type UserRole = 'buyer' | 'seller' | 'admin';
export type Language = 'en' | 'kn';

export interface UserLocation {
  state: string;
  district: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
}

export interface UserBase {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  preferredLanguage: Language;
  location?: UserLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserBase;
  tokens: AuthTokens;
}

// ─── Seller ──────────────────────────────────────────────────

export type KYCStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface KYCDocument {
  type: string;
  url: string;
  uploadedAt: string;
}

/**
 * @deprecated Bank details are strictly out of scope for current marketplace release.
 */
export interface BankDetails {
  accountNumber?: string;
  ifsc?: string;
  accountName?: string;
}

export type SellerApplicationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface SellerApplicationInput {
  shopName: string;
  description?: string;
  whatsappNumber: string;
  categorySpecialty?: string;
  fssaiNumber?: string;
  location?: {
    state?: string;
    district?: string;
    pincode?: string;
  };
}

export interface SellerApplicationStatusResponse {
  hasApplication: boolean;
  status: SellerApplicationStatus | null;
  shopName?: string;
  description?: string;
  rejectionReason?: string;
  appliedAt?: string;
  reviewedAt?: string;
}

export interface SellerProfile {
  _id: string;
  userId: string;
  shopName: string;
  description?: string;
  logo?: string;
  kycStatus: KYCStatus;
  kycDocuments: KYCDocument[];
  bankDetails?: BankDetails;
  whatsappNumber?: string;
  whatsappVerified?: boolean;
  paymentInstructions?: string;
  upiId?: string;
  isVerified: boolean;
  totalRating: number;
  ratingCount: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}


// ─── Category ────────────────────────────────────────────────

export interface LocalizedText {
  en: string;
  kn: string;
}

export interface Category {
  _id: string;
  name: LocalizedText;
  slug: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
}

// ─── Product ─────────────────────────────────────────────────

export interface Product {
  _id: string;
  sellerId: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  images: string[];
  thumbnailUrl?: string;
  price: number;
  mrp?: number;
  unit: string;
  quantityAvailable: number;
  minOrderQty: number;
  tags: string[];
  isOrganic: boolean;
  isCertified: boolean;
  certificationDetails?: string;
  isActive: boolean;
  isApproved: boolean;
  moderationNote?: string;
  isSeasonal: boolean;
  seasonalFrom?: string;
  seasonalTo?: string;
  isFestivalItem: boolean;
  festivalTags: string[];
  averageRating: number;
  reviewCount: number;
  seller?: SellerProfile;
  createdAt: string;
  updatedAt: string;
}

// ─── Address ─────────────────────────────────────────────────

export interface Address {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// ─── Cart ────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product?: Product;
  qty: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  buyerId: string;
  items: CartItem[];
  updatedAt: string;
}

// ─── Order ───────────────────────────────────────────────────

export type OrderStatus =
  | 'ORDER_REQUESTED'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  // Compatibility aliases
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'handed_to_courier'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export interface OrderItemSnapshot {
  name: string;
  description?: string;
  unit: string;
  price: number;
  categoryName?: string;
  isOrganic?: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  imageUrl?: string;
  snapshot?: OrderItemSnapshot;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  status: OrderStatus;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  shippingAddress: Address;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentId?: string;
  shipmentId?: string;
  carrierName?: string;
  consignmentNumber?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
  dispatchNotes?: string;
  whatsappEnquiryId?: string;
  customRequestId?: string;
  isPreBooking: boolean;
  preCampaignId?: string;
  cancellationReason?: string;
  returnReason?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ─────────────────────────────────────────────────

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION_PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'pending'
  | 'verification_pending'
  | 'created'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'whatsapp_manual'
  | 'upi'
  | 'bank_transfer'
  | 'cod'
  | 'gateway_placeholder';

export interface Payment {
  _id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  method?: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentReference?: string;
  paymentNotes?: string;
  sellerInstructions?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  // Extensible for future gateway update without rewriting order system
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}


// ─── Custom Request (Reverse Marketplace) ────────────────────

export type CustomRequestStatus =
  | 'open'
  | 'offers_received'
  | 'accepted'
  | 'expired'
  | 'cancelled';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface CustomOffer {
  _id: string;
  sellerId: string;
  seller?: SellerProfile;
  price: number;
  note?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface CustomRequest {
  _id: string;
  buyerId: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  budget?: number;
  categoryId?: string;
  location?: string;
  images: string[];
  status: CustomRequestStatus;
  expiresAt: string;
  offers: CustomOffer[];
  acceptedOfferId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Chat ────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'order_ref' | 'product_ref';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  orderId?: string;
  productId?: string;
  customRequestId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  isActive: boolean;
  unreadCount?: number;
}

// ─── Review ──────────────────────────────────────────────────

export interface Review {
  _id: string;
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  title?: string;
  body?: string;
  images: string[];
  sellerResponse?: string;
  isVerifiedPurchase: boolean;
  isModerated: boolean;
  moderationNote?: string;
  buyer?: UserBase;
  createdAt: string;
  updatedAt: string;
}

// ─── Seasonal Campaign ────────────────────────────────────────

export interface CampaignProduct {
  productId: string;
  product?: Product;
  priceOverride?: number;
  maxQuantity: number;
  bookedQuantity: number;
}

export interface SeasonalCampaign {
  _id: string;
  title: LocalizedText;
  description: string;
  bannerImage?: string;
  startDate: string;
  endDate: string;
  bookingDeadline: string;
  products: CampaignProduct[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PreBookingStatus = 'booked' | 'confirmed' | 'cancelled' | 'fulfilled';

export interface PreBooking {
  _id: string;
  campaignId: string;
  buyerId: string;
  sellerId: string;
  items: Array<{ productId: string; qty: number; price: number }>;
  totalAmount: number;
  paymentId?: string;
  status: PreBookingStatus;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Shipment & Tracking ─────────────────────────────────────

export type ShipmentStatus =
  | 'NOT_SHIPPED'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export const SUPPORTED_CARRIERS = [
  'India Post',
  'DTDC',
  'Professional Couriers',
  'Blue Dart',
  'ST Courier',
  'Trackon',
  'Other',
] as const;

export type SupportedCarrier = (typeof SUPPORTED_CARRIERS)[number];

export const CARRIER_TRACKING_TEMPLATES: Record<string, string> = {
  'India Post': 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
  'DTDC': 'https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strAvbNo={TRACKING_NO}',
  'Blue Dart': 'https://www.bluedart.com/tracking?trackNumber={TRACKING_NO}',
  'Professional Couriers': 'https://www.tpcindia.com/track.aspx',
  'ST Courier': 'https://stcourier.com/',
  'Trackon': 'https://trackon.in/',
};

export interface SellerShipmentUpdate {
  status: ShipmentStatus;
  note?: string;
  location?: string;
  timestamp: string;
}

export type ShipmentProvider = 'manual_courier' | 'india_post' | 'shiprocket' | 'delhivery';

export interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  _id: string;
  orderId: string;
  carrierName: string;
  consignmentNumber: string;
  dispatchDate: string;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
  dispatchNotes?: string;
  currentStatus: ShipmentStatus;
  sellerUpdates: SellerShipmentUpdate[];
  provider?: ShipmentProvider;
  awbNumber?: string;
  trackingEvents?: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

// ─── WhatsApp Enquiry ────────────────────────────────────────

export type EnquiryStatus = 'initiated' | 'replied' | 'order_placed' | 'closed';

export interface WhatsAppEnquiry {
  _id: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName?: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price?: number;
  sellerWhatsAppNumber: string;
  prefilledMessage: string;
  clickToChatUrl: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}


// ─── Notification ────────────────────────────────────────────

export type NotificationType =
  | 'order_update'
  | 'message'
  | 'custom_offer'
  | 'shipment'
  | 'prebooking'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  pushSent?: boolean;
  pushMessageId?: string;
  pushError?: string;
  fcmSent?: boolean; // legacy compatibility alias
  createdAt: string;
}

export interface PushNotificationPayload {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface PushNotificationResult {
  success: boolean;
  provider: string;
  status: 'delivered' | 'accepted' | 'failed' | 'skipped';
  messageId?: string;
  error?: string;
  details?: unknown;
}



// ─── API Response Wrappers ────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Constants ───────────────────────────────────────────────

export const ORDER_STATUSES: OrderStatus[] = [
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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
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

export const PRODUCT_UNITS = [
  'kg', 'g', 'mg', 'litre', 'ml',
  'piece', 'dozen', 'pack', 'bottle', 'jar', 'box',
  '100g', '250g', '500g',
];

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'kn'];

// ─── Helper Functions ────────────────────────────────────────

/**
 * Normalizes a phone number to standard international format without '+' or spaces.
 * Defaults to 91 (India) if 10 digits provided.
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Validates whether a phone number is a potentially valid mobile number with country code.
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const normalized = normalizeWhatsAppNumber(phone);
  return /^[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Builds the official WhatsApp click-to-chat URL: https://wa.me/<number>?text=<encoded_text>
 */
export function buildWhatsAppChatUrl(phone: string, text: string): string {
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
export function formatWhatsAppEnquiryMessage(params: {
  productName: string;
  productId: string;
  quantity: number;
  unit: string;
  price?: number;
}): string {
  const priceLine = params.price ? `\nDisplayed Price: ₹${params.price} / ${params.unit}` : '';
  return `Hello MOOLA Seller, I am interested in ${params.productName}.\nProduct ID: ${params.productId}\nQuantity: ${params.quantity} ${params.unit}${priceLine}\nPlease confirm availability, total price, delivery options, and payment instructions.`;
}

/**
 * Generates an official tracking link from trusted carrier templates or validates a custom carrier URL.
 */
export function generateCarrierTrackingUrl(
  carrierName: string,
  trackingNumber: string,
  customUrl?: string,
): string | undefined {
  if (customUrl && (customUrl.startsWith('http://') || customUrl.startsWith('https://'))) {
    return customUrl;
  }
  const template = CARRIER_TRACKING_TEMPLATES[carrierName];
  if (!template) {
    return undefined;
  }
  if (template.includes('{TRACKING_NO}')) {
    return template.replace('{TRACKING_NO}', encodeURIComponent(trackingNumber.trim()));
  }
  return template;
}

// ─── Customer Support Configuration ──────────────────────────

export interface SupportContactNumber {
  raw: string; // e.g. '8088653820'
  display: string; // e.g. '+91 80886 53820'
  telUri: string; // e.g. 'tel:+918088653820'
  whatsappUrl: string; // e.g. 'https://wa.me/918088653820'
  label: string;
}

export interface SocialLinkInfo {
  url: string;
  handle: string;
  name: string;
}

export interface CustomerSupportConfig {
  brandName: string;
  brandTagline: string;
  numbers: {
    primary: SupportContactNumber;
    secondary: SupportContactNumber;
  };
  supportEmail: string | null; // Nullable until official email address is created
  operatingHours: string;
  policyVersion: string;
  policyEffectiveDate: string;
  publicWebRoutes: {
    privacyPolicy: string;
    termsAndConditions: string;
    accountDeletion: string;
    customerSupport: string;
  };
  socialLinks: {
    instagram: SocialLinkInfo;
    facebook: SocialLinkInfo;
  };
}

export const CUSTOMER_SUPPORT_CONFIG: CustomerSupportConfig = {
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
  socialLinks: {
    instagram: {
      url: 'https://instagram.com/moola.organic',
      handle: '@moola.organic',
      name: 'Instagram',
    },
    facebook: {
      url: 'https://facebook.com/moola.organic',
      handle: 'MOOLA Organic Marketplace',
      name: 'Facebook',
    },
  },
};

// ─── Customer Complaints & Support Tickets ───────────────────

export const COMPLAINT_CATEGORIES = [
  'account_login',
  'product_quality_damaged',
  'incorrect_product_description',
  'seller_communication',
  'payment_enquiry',
  'order_cancellation_refund',
  'delivery_tracking',
  'privacy_account_deletion',
  'other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
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

export const COMPLAINT_STATUSES = [
  'SUBMITTED',
  'ACKNOWLEDGED',
  'UNDER_REVIEW',
  'RESOLVED',
  'CLOSED',
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: 'Submitted',
  ACKNOWLEDGED: 'Acknowledged',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export interface ComplaintStatusHistoryEntry {
  status: ComplaintStatus;
  changedAt: string;
  changedByRole: 'user' | 'admin' | 'system';
  note?: string;
}

export interface ComplaintInternalNote {
  noteId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface ComplaintTicket {
  _id: string;
  ticketId: string; // e.g. 'TKT-20261022-ABCD'
  userId: string;
  userName?: string;
  userPhone?: string;
  userRole?: UserRole;
  category: ComplaintCategory;
  subject: string;
  description: string;
  orderId?: string;
  orderNumber?: string;
  attachmentUrl?: string;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publicResponse?: string;
  statusHistory: ComplaintStatusHistoryEntry[];
  slaDeadline: string; // ISO Date string (e.g. 48 hours target)
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminComplaintTicket extends ComplaintTicket {
  internalNotes: ComplaintInternalNote[];
}

// ─── Account Deletion ────────────────────────────────────────

export const DELETION_REQUEST_STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'COMPLETED',
  'REJECTED',
] as const;

export type DeletionRequestStatus = (typeof DELETION_REQUEST_STATUSES)[number];

export const DELETION_REQUEST_STATUS_LABELS: Record<DeletionRequestStatus, string> = {
  PENDING: 'Pending Verification',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed (Deactivated & Anonymized)',
  REJECTED: 'Rejected',
};

export interface DeletionInternalNote {
  noteId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface AccountDeletionRequest {
  _id: string;
  requestId: string; // e.g. 'DEL-20261022-XYZ1'
  userId: string;
  userName?: string;
  userPhone: string;
  userRole: UserRole;
  reason?: string;
  status: DeletionRequestStatus;
  verificationState: 'authenticated_session' | 'web_requested_pending_verification' | 'verified';
  activeOrdersCount: number;
  unresolvedComplaintsCount?: number;
  completionReason?: string;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccountDeletionRequest extends AccountDeletionRequest {
  internalNotes: DeletionInternalNote[];
}

