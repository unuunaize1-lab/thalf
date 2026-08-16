'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading, clearSession } = useAuthStore();

  useEffect(() => {
    async function syncSession() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/auth/me');
        let data = null;
        try {
          const text = await res.text();
          if (text) {
            data = JSON.parse(text);
          }
        } catch (parseErr) {
          // Silent catch for invalid JSON
        }

        if (data && data.success && data.user) {
          setSession({
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.name || 'Valued Guest',
            role: data.user.role.toLowerCase() === 'admin' ? 'admin' : 'customer',
            loyaltyPoints: 100,
            savedAddresses: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          clearSession();
        }
      } catch (err) {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    syncSession();
  }, [setSession, setLoading, clearSession]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
