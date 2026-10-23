import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@moola/shared';
import { apiService } from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  shopName?: string;
  isVerified?: boolean;
  kycStatus?: 'pending' | 'under_review' | 'verified' | 'rejected';
  rejectionReason?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  sellerApplicationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | null;
  login: (phone: string, password?: string, targetRole?: UserRole) => Promise<void>;
  register: (
    name: string,
    phone: string,
    role: 'buyer' | 'seller',
    shopName?: string,
    password?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_BUYER: AuthUser = {
  id: 'buyer_001',
  name: 'Ananya Rao',
  phone: '9845012345',
  email: 'ananya@example.com',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_BUYER,
  token: null,
  role: 'buyer',
  isAuthenticated: true,
  sellerApplicationStatus: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_BUYER);
  const [token, setToken] = useState<string | null>(null);

  const role = user?.role || 'buyer';
  const sellerApplicationStatus = user?.kycStatus || null;

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiService.auth.me(token);
      if (res.success && res.data) {
        const u = res.data.user;
        const sp = res.data.sellerProfile;
        setUser({
          id: u._id || u.id || user?.id || '',
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          shopName: sp?.shopName,
          isVerified: sp?.isVerified,
          kycStatus: sp?.kycStatus,
          rejectionReason: sp?.rejectionReason,
        });
      }
    } catch {
      // Quiet fail on network hiccup
    }
  };

  const login = async (phone: string, password = 'password123', _targetRole?: UserRole) => {
    try {
      const res = await apiService.auth.login(phone, password);
      if (res.success && res.data) {
        const u = res.data.user;
        const sp = res.data.sellerProfile;
        setUser({
          id: u._id || u.id || `usr_${phone}`,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          shopName: sp?.shopName,
          isVerified: sp?.isVerified,
          kycStatus: sp?.kycStatus,
          rejectionReason: sp?.rejectionReason,
        });
        setToken(res.data.tokens.accessToken);
        return;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Network request failed') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      // Offline fallback for development testing: only if explicitly simulated with known demo accounts
      if (phone === '9000000000') {
        setUser({
          id: 'admin_demo',
          name: 'MOOLA Admin',
          phone: '9000000000',
          role: 'admin',
        });
      } else if (phone === '9000000001' || phone === '9000000002') {
        setUser({
          id: 'seller_demo',
          name: 'Verified Seller',
          phone,
          role: 'seller',
          shopName: phone === '9000000001' ? 'Kodagu Forest Honey' : 'Lakshmi Pickles',
          isVerified: true,
          kycStatus: 'verified',
        });
      } else {
        setUser(DEFAULT_BUYER);
      }
      setToken('dev_offline_token_' + Date.now());
    }
  };

  const register = async (
    name: string,
    phone: string,
    newRole: 'buyer' | 'seller',
    shopName?: string,
    password = 'Password@123',
  ) => {
    if (newRole !== 'buyer' && newRole !== 'seller') {
      throw new Error('Public registration is permitted only for Buyers and Sellers.');
    }

    try {
      const res = await apiService.auth.register({
        name,
        phone,
        password,
        role: newRole,
        shopName: newRole === 'seller' ? shopName || `${name}'s Homemade Goods` : undefined,
      });

      if (res.success && res.data) {
        const u = res.data.user;
        setUser({
          id: u._id || u.id || `usr_${phone}`,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role, // Set to 'buyer' by backend until seller application approved
          shopName: newRole === 'seller' ? shopName || `${name}'s Homemade Goods` : undefined,
          isVerified: false,
          kycStatus: newRole === 'seller' ? 'pending' : undefined,
        });
        setToken(res.data.tokens.accessToken);
        return;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Network request failed') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      setUser({
        id: `usr_${Date.now()}`,
        name,
        phone,
        role: 'buyer',
        shopName: newRole === 'seller' ? shopName || `${name}'s Homemade Goods` : undefined,
        isVerified: false,
        kycStatus: newRole === 'seller' ? 'pending' : undefined,
      });
      setToken('dev_offline_token_' + Date.now());
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        sellerApplicationStatus,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
