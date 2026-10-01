import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  SUPER_ADMIN_SESSION_KEY,
  SUPER_ADMIN_SESSION_VALUE,
  verifySuperAdminCredentials,
} from '../lib/superAdminGate';

type SuperAdminAuthContextValue = {
  isAuthenticated: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
};

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | null>(null);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(SUPER_ADMIN_SESSION_KEY) === SUPER_ADMIN_SESSION_VALUE;
    } catch {
      return false;
    }
  });

  const login = (id: string, password: string) => {
    const ok = verifySuperAdminCredentials(id, password);
    if (ok) {
      sessionStorage.setItem(SUPER_ADMIN_SESSION_KEY, SUPER_ADMIN_SESSION_VALUE);
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    sessionStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <SuperAdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
  return ctx;
}
