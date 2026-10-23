/**
 * MOOLA Web API Client
 * Connects directly to Spring Boot backend running at http://localhost:5000
 */

const API_BASE_URL = window.MOOLA_API_URL || 'http://localhost:5000';

class MoolaApiClient {
  constructor() {
    this.token = localStorage.getItem('moola_jwt_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('moola_jwt_token', token);
    } else {
      localStorage.removeItem('moola_jwt_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('moola_jwt_token');
  }

  getUser() {
    const userJson = localStorage.getItem('moola_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  setUser(user) {
    if (user) {
      localStorage.setItem('moola_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('moola_user');
    }
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.message) || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  async login(phone, password) {
    const data = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    if (data && data.success && data.data) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }
    return data;
  }

  async register(phone, password, name) {
    const data = await this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, name }),
    });
    if (data && data.success && data.data) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }
    return data;
  }

  async getMe() {
    return this.request('/api/v1/auth/me');
  }

  // Product Endpoints
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category) query.append('category', params.category);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.isOrganic !== undefined) query.append('isOrganic', params.isOrganic);
    if (params.sort) query.append('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/v1/products${qs}`);
  }

  async getProduct(id) {
    return this.request(`/api/v1/products/${id}`);
  }

  async getCategories() {
    return this.request('/api/v1/categories');
  }

  // Order Endpoints
  async requestOrder(orderData) {
    return this.request('/api/v1/orders/request', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request('/api/v1/orders/my');
  }

  // WhatsApp Enquiry
  async createWhatsAppEnquiry(enquiryData) {
    return this.request('/api/v1/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  }

  // Customer Care Complaints
  async submitComplaint(complaintData) {
    return this.request('/api/v1/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async getMyComplaints() {
    return this.request('/api/v1/complaints/my');
  }

  // Account Deletion
  async requestAccountDeletion(reason) {
    return this.request('/api/v1/account-deletion/request', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getDeletionStatus() {
    return this.request('/api/v1/account-deletion/my');
  }

  // Seller Application
  async applyForSeller(sellerData) {
    return this.request('/api/v1/seller/apply', {
      method: 'POST',
      body: JSON.stringify(sellerData),
    });
  }
}

window.moolaApi = new MoolaApiClient();
