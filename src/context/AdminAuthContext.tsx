'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  companyName: string;
  role: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isLoading: boolean;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const API_BASE = 'http://localhost:8000/api';
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // First try dedicated admin token keys
      let savedToken = localStorage.getItem('Finlytics AI_admin_token') || localStorage.getItem('finlytics_admin_token');
      let savedUser = localStorage.getItem('Finlytics AI_admin_user') || localStorage.getItem('finlytics_admin_user');

      // Fallback: if admin logged in via main login page, token is in the regular keys
      if (!savedToken || !savedUser) {
        const regularToken = localStorage.getItem('Finlytics AI_token') || localStorage.getItem('finlytics_token');
        const regularUser = localStorage.getItem('Finlytics AI_user') || localStorage.getItem('finlytics_user');
        if (regularToken && regularUser) {
          try {
            const parsed = JSON.parse(regularUser);
            if (parsed.role === 'admin') {
              savedToken = regularToken;
              savedUser = regularUser;
              // Sync into admin-specific keys
              localStorage.setItem('Finlytics AI_admin_token', regularToken);
              localStorage.setItem('Finlytics AI_admin_user', regularUser);
              localStorage.setItem('finlytics_admin_token', regularToken);
              localStorage.setItem('finlytics_admin_user', regularUser);
            }
          } catch (_) {}
        }
      }

      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin') {
          setAdminToken(savedToken);
          setAdminUser(parsed);
        } else {
          localStorage.removeItem('Finlytics AI_admin_token');
          localStorage.removeItem('Finlytics AI_admin_user');
          localStorage.removeItem('finlytics_admin_token');
          localStorage.removeItem('finlytics_admin_user');
        }
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  const adminLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.detail || 'Invalid admin credentials' };
      }

      if (data.user?.role !== 'admin') {
        setIsLoading(false);
        return {
          success: false,
          error: 'Access denied: This account does not possess internal Finlytics AI administrator privileges.',
        };
      }

      const userObj: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        companyName: data.user.companyName,
        role: data.user.role,
      };

      setAdminToken(data.access_token);
      setAdminUser(userObj);

      localStorage.setItem('Finlytics AI_admin_token', data.access_token);
      localStorage.setItem('Finlytics AI_admin_user', JSON.stringify(userObj));
      localStorage.setItem('finlytics_admin_token', data.access_token);
      localStorage.setItem('finlytics_admin_user', JSON.stringify(userObj));

      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: 'Could not connect to backend server.' };
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('Finlytics AI_admin_token');
    localStorage.removeItem('Finlytics AI_admin_user');
    localStorage.removeItem('finlytics_admin_token');
    localStorage.removeItem('finlytics_admin_user');
    router.push('/admin/login');
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    return fetch(url, { ...options, headers });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isLoading,
        isAdminAuthenticated: !!adminToken && adminUser?.role === 'admin',
        adminLogin,
        adminLogout,
        apiFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
