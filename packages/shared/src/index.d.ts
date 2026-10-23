export type UserRole = 'buyer' | 'seller' | 'admin';
export type Language = 'en' | 'kn';
export interface UserLocation {
    state: string;
    district: string;
    pincode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
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
export type KYCStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export interface KYCDocument {
    type: string;
    url: string;
    uploadedAt: string;
}
export interface BankDetails {
    accountNumber: string;
    ifsc: string;
    accountName: string;
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
export type OrderStatus = 'ORDER_REQUESTED' | 'ORDER_CONFIRMED' | 'PAYMENT_PENDING' | 'PAYMENT_VERIFICATION_PENDING' | 'PAID' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'pending' | 'confirmed' | 'packed' | 'handed_to_courier' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';
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
export type PaymentStatus = 'PAYMENT_PENDING' | 'PAYMENT_VERIFICATION_PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'pending' | 'verification_pending' | 'created' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'whatsapp_manual' | 'upi' | 'bank_transfer' | 'cod' | 'gateway_placeholder';
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
export type CustomRequestStatus = 'open' | 'offers_received' | 'accepted' | 'expired' | 'cancelled';
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
    items: Array<{
        productId: string;
        qty: number;
        price: number;
    }>;
    totalAmount: number;
    paymentId?: string;
    status: PreBookingStatus;
    fulfilledAt?: string;
    createdAt: string;
    updatedAt: string;
}
export type ShipmentStatus = 'NOT_SHIPPED' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export declare const SUPPORTED_CARRIERS: readonly ["India Post", "DTDC", "Professional Couriers", "Blue Dart", "ST Courier", "Trackon", "Other"];
export type SupportedCarrier = (typeof SUPPORTED_CARRIERS)[number];
export declare const CARRIER_TRACKING_TEMPLATES: Record<string, string>;
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
export type NotificationType = 'order_update' | 'message' | 'custom_offer' | 'shipment' | 'prebooking' | 'system';
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
    fcmSent?: boolean;
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
export declare const ORDER_STATUSES: OrderStatus[];
export declare const ORDER_STATUS_LABELS: Record<OrderStatus, string>;
export declare const PRODUCT_UNITS: string[];
export declare const SUPPORTED_LANGUAGES: Language[];
/**
 * Normalizes a phone number to standard international format without '+' or spaces.
 * Defaults to 91 (India) if 10 digits provided.
 */
export declare function normalizeWhatsAppNumber(rawPhone: string): string;
/**
 * Validates whether a phone number is a potentially valid mobile number with country code.
 */
export declare function isValidWhatsAppNumber(phone: string): boolean;
/**
 * Builds the official WhatsApp click-to-chat URL: https://wa.me/<number>?text=<encoded_text>
 */
export declare function buildWhatsAppChatUrl(phone: string, text: string): string;
/**
 * Formats standard product enquiry message as required by MOOLA specification:
 * Hello MOOLA Seller, I am interested in [product name].
 * Product ID: [product ID]
 * Quantity: [quantity]
 * Please confirm availability, total price, delivery options, and payment instructions.
 */
export declare function formatWhatsAppEnquiryMessage(params: {
    productName: string;
    productId: string;
    quantity: number;
    unit: string;
    price?: number;
}): string;
/**
 * Generates an official tracking link from trusted carrier templates or validates a custom carrier URL.
 */
export declare function generateCarrierTrackingUrl(carrierName: string, trackingNumber: string, customUrl?: string): string | undefined;
export interface SupportContactNumber {
    raw: string;
    display: string;
    telUri: string;
    whatsappUrl: string;
    label: string;
}
export interface CustomerSupportConfig {
    brandName: string;
    brandTagline: string;
    numbers: {
        primary: SupportContactNumber;
        secondary: SupportContactNumber;
    };
    supportEmail: string | null;
    operatingHours: string;
    policyVersion: string;
    policyEffectiveDate: string;
    publicWebRoutes: {
        privacyPolicy: string;
        termsAndConditions: string;
        accountDeletion: string;
        customerSupport: string;
    };
}
export declare const CUSTOMER_SUPPORT_CONFIG: CustomerSupportConfig;
export declare const COMPLAINT_CATEGORIES: readonly ["account_login", "product_quality_damaged", "incorrect_product_description", "seller_communication", "payment_enquiry", "order_cancellation_refund", "delivery_tracking", "privacy_account_deletion", "other"];
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
export declare const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string>;
export declare const COMPLAINT_STATUSES: readonly ["SUBMITTED", "ACKNOWLEDGED", "UNDER_REVIEW", "RESOLVED", "CLOSED"];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export declare const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string>;
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
    ticketId: string;
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
    slaDeadline: string;
    isOverdue?: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AdminComplaintTicket extends ComplaintTicket {
    internalNotes: ComplaintInternalNote[];
}
export declare const DELETION_REQUEST_STATUSES: readonly ["PENDING", "UNDER_REVIEW", "COMPLETED", "REJECTED"];
export type DeletionRequestStatus = (typeof DELETION_REQUEST_STATUSES)[number];
export declare const DELETION_REQUEST_STATUS_LABELS: Record<DeletionRequestStatus, string>;
export interface DeletionInternalNote {
    noteId: string;
    authorName: string;
    note: string;
    createdAt: string;
}
export interface AccountDeletionRequest {
    _id: string;
    requestId: string;
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
