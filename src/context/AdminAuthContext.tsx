import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  ADMIN_SESSION_KEY,
  ADMIN_SESSION_VALUE,
  verifyAdminCredentials,
} from '../lib/adminGate';

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_VALUE;
    } catch {
      return false;
    }
  });

  const login = (id: string, password: string) => {
    const ok = verifyAdminCredentials(id, password);
    if (ok) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_SESSION_VALUE);
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
