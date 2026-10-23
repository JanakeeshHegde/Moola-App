import { API_CONFIG } from '../config/api';
import {
  Notification,
  WhatsAppEnquiry,
  PaymentStatus,
  ShipmentStatus,
  ComplaintTicket,
  AdminComplaintTicket,
  ComplaintCategory,
  ComplaintStatus,
  AccountDeletionRequest,
  AdminAccountDeletionRequest,
  DeletionRequestStatus,
  SellerApplicationInput,
  SellerApplicationStatusResponse,
} from '@moola/shared';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string;
}

/**
 * Robust fetch wrapper with timeout and JSON parsing
 */
async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = API_CONFIG.timeoutMs, token, ...init } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    ...API_CONFIG.headers,
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

export const apiService = {
  /**
   * System Health
   */
  health: {
    check: async () => {
      return apiFetch<{ success: boolean; data: { service: string; version: string; database: unknown } }>(
        '/health',
      );
    },
  },

  /**
   * Product Catalog & Marketplace
   */
  products: {
    list: async (query?: {
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams();
      if (query?.q) params.append('q', query.q);
      if (query?.category && query.category !== 'cat_all') params.append('category', query.category);
      if (query?.minPrice) params.append('minPrice', String(query.minPrice));
      if (query?.maxPrice) params.append('maxPrice', String(query.maxPrice));
      if (query?.page) params.append('page', String(query.page));
      if (query?.limit) params.append('limit', String(query.limit));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          products?: any[];
          data?: any[];
          total: number;
          page: number;
          limit: number;
        };
      }>(`/products${qs}`);
    },

    getById: async (id: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          product: any;
          sellerProfile?: any;
        };
      }>(`/products/${id}`);
    },

    getMy: async (token: string, page = 1, limit = 20) => {
      return apiFetch<{
        success: boolean;
        data: {
          data: any[];
          total: number;
          page: number;
          limit: number;
        };
      }>(`/products/my?page=${page}&limit=${limit}`, { token });
    },

    create: async (data: any, token: string) => {
      return apiFetch<{ success: boolean; data: { product: any }; message: string }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    update: async (id: string, data: any, token: string) => {
      return apiFetch<{ success: boolean; data: { product: any }; message: string }>(
        `/products/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
          token,
        },
      );
    },

    delete: async (id: string, token: string) => {
      return apiFetch<{ success: boolean; message: string }>(`/products/${id}`, {
        method: 'DELETE',
        token,
      });
    },
  },

  /**
   * Product Categories
   */
  categories: {
    list: async () => {
      return apiFetch<{ success: boolean; data: { categories: any[] } }>('/buyer/categories');
    },
  },

  /**
   * WhatsApp Enquiries
   */
  enquiries: {
    create: async (data: {
      productId: string;
      quantity: number;
      unit?: string;
      buyerName?: string;
      buyerPhone?: string;
      notes?: string;
    }, token?: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          enquiryId: string;
          clickToChatUrl: string;
          prefilledMessage: string;
          sellerWhatsAppNumber: string;
          productName: string;
          status: string;
        };
        message: string;
      }>('/enquiries', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    getSellerEnquiries: async (token: string, page = 1, limit = 20) => {
      return apiFetch<{
        success: boolean;
        data: {
          enquiries: WhatsAppEnquiry[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/enquiries/seller?page=${page}&limit=${limit}`, { token });
    },

    getBuyerEnquiries: async (token: string) => {
      return apiFetch<{ success: boolean; data: { enquiries: WhatsAppEnquiry[] } }>(
        '/enquiries/buyer',
        { token },
      );
    },

    updateStatus: async (enquiryId: string, status: string, notes?: string, token?: string) => {
      return apiFetch<{ success: boolean; data: { enquiry: WhatsAppEnquiry } }>(
        `/enquiries/${enquiryId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, notes }),
          token,
        },
      );
    },
  },

  /**
   * Orders
   */
  orders: {
    createFromCart: async (shippingAddress: any, token: string) => {
      return apiFetch<{ success: boolean; data: { orders: any[] }; message: string }>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({ shippingAddress }),
          token,
        },
      );
    },

    directRequest: async (data: {
      productId: string;
      quantity: number;
      shippingAddress: any;
      whatsappEnquiryId?: string;
      buyerNotes?: string;
    }, token: string) => {
      return apiFetch<{ success: boolean; data: { order: any }; message: string }>(
        '/orders/request',
        {
          method: 'POST',
          body: JSON.stringify(data),
          token,
        },
      );
    },

    getBuyerOrders: async (token: string, page = 1) => {
      return apiFetch<{
        success: boolean;
        data: { data: any[]; total: number; page: number; hasNext: boolean };
      }>(`/orders/my?page=${page}`, { token });
    },

    getSellerOrders: async (token: string, page = 1) => {
      return apiFetch<{
        success: boolean;
        data: { data: any[]; total: number; page: number; hasNext: boolean };
      }>(`/orders/seller?page=${page}`, { token });
    },

    getById: async (orderId: string, token: string) => {
      return apiFetch<{ success: boolean; data: { order: any } }>(`/orders/${orderId}`, { token });
    },

    confirm: async (orderId: string, token: string) => {
      return apiFetch<{ success: boolean; data: { order: any }; message: string }>(
        `/orders/${orderId}/confirm`,
        { method: 'POST', token },
      );
    },

    decline: async (orderId: string, reason: string, token: string) => {
      return apiFetch<{ success: boolean; data: { order: any }; message: string }>(
        `/orders/${orderId}/decline`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
          token,
        },
      );
    },

    cancel: async (orderId: string, reason: string, token: string) => {
      return apiFetch<{ success: boolean; data: { order: any }; message: string }>(
        `/orders/${orderId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
          token,
        },
      );
    },
  },

  /**
   * Manual Courier & India Post Tracking
   */
  shipments: {
    getCarriers: async () => {
      return apiFetch<{
        success: boolean;
        data: { carriers: string[]; templates: Record<string, string> };
      }>('/shipments/carriers');
    },

    recordManual: async (data: {
      orderId: string;
      carrierName: string;
      consignmentNumber: string;
      dispatchDate?: string;
      estimatedDeliveryDate?: string;
      customTrackingUrl?: string;
      dispatchNotes?: string;
    }, token: string) => {
      return apiFetch<{ success: boolean; data: { shipment: any; trackingUrl?: string } }>(
        '/shipments/manual',
        {
          method: 'POST',
          body: JSON.stringify(data),
          token,
        },
      );
    },

    getByOrderId: async (orderId: string, token: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          hasShipment: boolean;
          shipment?: any;
          trackingUrl?: string;
          carrierName?: string;
          consignmentNumber?: string;
          dispatchDate?: string;
          estimatedDeliveryDate?: string;
          currentStatus?: ShipmentStatus;
          sellerUpdates?: any[];
        };
      }>(`/shipments/order/${orderId}`, { token });
    },

    updateStatus: async (
      shipmentId: string,
      status: ShipmentStatus,
      note?: string,
      location?: string,
      token?: string,
    ) => {
      return apiFetch<{ success: boolean; data: { shipment: any } }>(
        `/shipments/${shipmentId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, note, location }),
          token,
        },
      );
    },
  },

  /**
   * Payments
   */
  payments: {
    getInstructions: async (orderId: string, token: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          orderId: string;
          orderNumber: string;
          totalAmount: number;
          paymentStatus: PaymentStatus;
          sellerWhatsAppNumber: string;
          whatsappPaymentUrl: string;
          upiId: string;
          sellerPaymentInstructions: string;
          currentPayment?: any;
        };
      }>(`/payments/instructions/${orderId}`, { token });
    },

    submitReference: async (data: {
      orderId: string;
      paymentReference: string;
      paymentNotes?: string;
    }, token: string) => {
      return apiFetch<{
        success: boolean;
        data: { payment: any; paymentStatus: PaymentStatus; verificationNotice: string };
      }>('/payments/submit-reference', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    verify: async (orderId: string, data: { verificationNotes?: string; confirmedAmount?: number }, token: string) => {
      return apiFetch<{ success: boolean; data: { payment: any; order: any } }>(
        `/payments/verify/${orderId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
          token,
        },
      );
    },
  },

  /**
   * Seller Management & Onboarding
   */
  seller: {
    getProfile: async (token: string) => {
      return apiFetch<{ success: boolean; data: { profile: any } }>('/seller/profile', { token });
    },

    updateProfile: async (
      data: {
        shopName?: string;
        description?: string;
        logo?: string;
        whatsappNumber?: string;
        paymentInstructions?: string;
        upiId?: string;
      },
      token: string,
    ) => {
      return apiFetch<{ success: boolean; data: { profile: any } }>('/seller/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
        token,
      });
    },

    apply: async (data: SellerApplicationInput, token: string) => {
      return apiFetch<{ success: boolean; message: string; data: any }>('/seller/apply', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    getApplicationStatus: async (token: string) => {
      return apiFetch<{ success: boolean; data: SellerApplicationStatusResponse }>(
        '/seller/application-status',
        { token },
      );
    },

    submitKYC: async (documents: Array<{ type: string; url: string }>, token: string) => {
      return apiFetch<{ success: boolean; data: { profile: any }; message: string }>(
        '/seller/kyc',
        {
          method: 'POST',
          body: JSON.stringify({ documents }),
          token,
        },
      );
    },

    getEarnings: async (period = '30d', token: string) => {
      return apiFetch<{ success: boolean; data: any }>(`/seller/earnings?period=${period}`, {
        token,
      });
    },
  },

  /**
   * In-App & Push Notifications
   */
  notifications: {
    list: async (token: string, page = 1, limit = 20) => {
      return apiFetch<{
        success: boolean;
        data: {
          notifications: Notification[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/notifications?page=${page}&limit=${limit}`, { token });
    },

    getUnreadCount: async (token: string) => {
      return apiFetch<{ success: boolean; data: { unreadCount: number } }>(
        '/notifications/unread-count',
        { token },
      );
    },

    markRead: async (id: string, token: string) => {
      return apiFetch<{ success: boolean; data: Notification }>(
        `/notifications/${id}/read`,
        { method: 'PUT', token },
      );
    },

    markAllRead: async (token: string) => {
      return apiFetch<{ success: boolean; message: string }>(
        '/notifications/read-all',
        { method: 'PUT', token },
      );
    },

    deleteNotification: async (id: string, token: string) => {
      return apiFetch<{ success: boolean; message: string }>(
        `/notifications/${id}`,
        { method: 'DELETE', token },
      );
    },

    clearAll: async (token: string) => {
      return apiFetch<{ success: boolean; message: string }>(
        '/notifications',
        { method: 'DELETE', token },
      );
    },

    registerPushToken: async (pushToken: string, token: string) => {
      return apiFetch<{ success: boolean; message: string }>(
        '/notifications/push-token',
        {
          method: 'POST',
          body: JSON.stringify({ token: pushToken }),
          token,
        },
      );
    },
  },

  /**
   * Customer Support & Complaints
   */
  complaints: {
    submit: async (
      data: {
        category: ComplaintCategory;
        subject: string;
        description: string;
        orderId?: string;
        attachmentUrl?: string;
        priority?: 'low' | 'medium' | 'high' | 'urgent';
      },
      token: string,
    ) => {
      return apiFetch<{
        success: boolean;
        data: { ticket: ComplaintTicket };
        message: string;
      }>('/complaints', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    getMy: async (token: string, page = 1, limit = 10) => {
      return apiFetch<{
        success: boolean;
        data: {
          complaints: ComplaintTicket[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/complaints/my?page=${page}&limit=${limit}`, { token });
    },

    getById: async (ticketId: string, token: string) => {
      return apiFetch<{
        success: boolean;
        data: { ticket: ComplaintTicket };
      }>(`/complaints/my/${ticketId}`, { token });
    },
  },

  /**
   * Account Deletion
   */
  accountDeletion: {
    request: async (
      data: { reason?: string; passwordConfirm?: string },
      token: string,
    ) => {
      return apiFetch<{
        success: boolean;
        data: {
          request: AccountDeletionRequest;
          activeOrdersCount: number;
          unresolvedComplaintsCount: number;
          notice: string;
        };
        message: string;
      }>('/account-deletion/request', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      });
    },

    getMyStatus: async (token: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          hasRequest: boolean;
          request: AccountDeletionRequest | null;
        };
      }>('/account-deletion/my', { token });
    },

    publicRequest: async (data: {
      phone: string;
      fullName: string;
      reason?: string;
      confirmationAcknowledgement: boolean;
    }) => {
      return apiFetch<{
        success: boolean;
        data: { requestId: string; verificationStatus: string };
        message: string;
      }>('/account-deletion/public-request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  /**
   * Admin Support & Deletion Management (for the two developers)
   */
  adminSupport: {
    listComplaints: async (
      token: string,
      query?: { status?: string; category?: string; search?: string; overdue?: boolean; page?: number },
    ) => {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.category) params.append('category', query.category);
      if (query?.search) params.append('search', query.search);
      if (query?.overdue) params.append('overdue', 'true');
      if (query?.page) params.append('page', String(query.page));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          complaints: AdminComplaintTicket[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/admin/complaints${qs}`, { token });
    },

    getComplaint: async (ticketId: string, token: string) => {
      return apiFetch<{
        success: boolean;
        data: { ticket: AdminComplaintTicket };
      }>(`/admin/complaints/${ticketId}`, { token });
    },

    updateComplaint: async (
      ticketId: string,
      data: {
        status?: ComplaintStatus;
        priority?: string;
        publicResponse?: string;
        internalNote?: string;
        statusNote?: string;
      },
      token: string,
    ) => {
      return apiFetch<{
        success: boolean;
        data: { ticket: AdminComplaintTicket };
        message: string;
      }>(`/admin/complaints/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        token,
      });
    },

    listDeletionRequests: async (
      token: string,
      query?: { status?: string; search?: string; page?: number },
    ) => {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);
      if (query?.page) params.append('page', String(query.page));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          requests: AdminAccountDeletionRequest[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/admin/account-deletion${qs}`, { token });
    },

    processDeletionRequest: async (
      requestId: string,
      data: {
        status: DeletionRequestStatus;
        internalNote?: string;
        rejectionReason?: string;
        completionReason?: string;
        forceComplete?: boolean;
      },
      token: string,
    ) => {
      return apiFetch<{
        success: boolean;
        data: { request: AdminAccountDeletionRequest };
        message: string;
      }>(`/admin/account-deletion/${requestId}/process`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        token,
      });
    },
  },

  /**
   * Authentication
   */
  auth: {
    login: async (phone: string, password: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          user: {
            _id: string;
            id?: string;
            name: string;
            phone: string;
            email?: string;
            role: 'buyer' | 'seller' | 'admin';
            preferredLanguage?: string;
            avatar?: string;
          };
          tokens: {
            accessToken: string;
            refreshToken: string;
          };
          sellerProfile?: any;
        };
        message: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
    },

    register: async (data: {
      name: string;
      phone: string;
      password: string;
      role: 'buyer' | 'seller';
      email?: string;
      shopName?: string;
      preferredLanguage?: string;
    }) => {
      return apiFetch<{
        success: boolean;
        data: {
          user: any;
          tokens: {
            accessToken: string;
            refreshToken: string;
          };
        };
        message: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    me: async (token: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          user: any;
          sellerProfile?: any;
        };
      }>('/auth/me', { token });
    },
  },

  /**
   * Private Admin Dashboard API (Authorized Administrators Only)
   */
  admin: {
    getAnalytics: async (token: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          totalBuyers: number;
          activeBuyers: number;
          totalSellers: number;
          verifiedSellers: number;
          pendingKycCount: number;
          totalProducts: number;
          activeProducts: number;
          inactiveProducts: number;
          totalOrders: number;
          ordersByStatus: Record<string, number>;
          totalEnquiries: number;
          enquiriesByStatus: Record<string, number>;
          totalComplaints: number;
          openComplaints: number;
          totalDeletionRequests: number;
          pendingDeletionRequests: number;
          totalRevenue: number;
          recentRegistrations: any[];
          recentOrders: any[];
        };
      }>('/admin/analytics', { token });
    },

    listSellers: async (
      token: string,
      query?: { status?: string; search?: string; page?: number },
    ) => {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);
      if (query?.page) params.append('page', String(query.page));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          sellers: any[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/admin/sellers${qs}`, { token });
    },

    reviewSellerKyc: async (
      token: string,
      sellerId: string,
      status: 'verified' | 'rejected',
      rejectionReason?: string,
    ) => {
      return apiFetch<{ success: boolean; data: any; message: string }>(
        `/admin/sellers/${sellerId}/kyc`,
        {
          method: 'PUT',
          body: JSON.stringify({ status, rejectionReason }),
          token,
        },
      );
    },

    updateSellerStatus: async (
      token: string,
      sellerId: string,
      isActive: boolean,
      reason?: string,
    ) => {
      return apiFetch<{ success: boolean; data: any; message: string }>(
        `/admin/sellers/${sellerId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isActive, reason }),
          token,
        },
      );
    },

    listBuyers: async (
      token: string,
      query?: { status?: string; search?: string; page?: number },
    ) => {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);
      if (query?.page) params.append('page', String(query.page));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          buyers: any[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/admin/buyers${qs}`, { token });
    },

    getBuyerDetails: async (token: string, buyerId: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          buyer: any;
          recentOrders: any[];
          recentEnquiries: any[];
          complaints: any[];
          deletionRequest: any;
        };
      }>(`/admin/buyers/${buyerId}`, { token });
    },

    updateBuyerStatus: async (
      token: string,
      buyerId: string,
      isActive: boolean,
      reason?: string,
    ) => {
      return apiFetch<{ success: boolean; data: any; message: string }>(
        `/admin/buyers/${buyerId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isActive, reason }),
          token,
        },
      );
    },

    listOrders: async (
      token: string,
      query?: { status?: string; search?: string; page?: number },
    ) => {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);
      if (query?.page) params.append('page', String(query.page));

      const qs = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{
        success: boolean;
        data: {
          orders: any[];
          total: number;
          page: number;
          limit: number;
          hasNext: boolean;
        };
      }>(`/admin/orders${qs}`, { token });
    },

    getOrderDetails: async (token: string, orderId: string) => {
      return apiFetch<{
        success: boolean;
        data: {
          order: any;
          complaints: any[];
        };
      }>(`/admin/orders/${orderId}`, { token });
    },

    moderateProduct: async (
      token: string,
      productId: string,
      isActive: boolean,
      reason?: string,
    ) => {
      return apiFetch<{ success: boolean; data: any; message: string }>(
        `/admin/products/${productId}/moderate`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive, reason }),
          token,
        },
      );
    },
  },
};
