'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
}

export default function ProfileDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserSession() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUserSession();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      setError('Unable to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-cream">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 space-y-8 animate-fade-up">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-parchment pb-8 space-y-4 sm:space-y-0">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">My Account</span>
          <h1 className="text-2xl font-editorial font-light text-dark mt-1">
            {user?.name || 'Account'}
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center border border-dark px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-dark hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Profile Details */}
      <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
        <div className="flex items-center space-x-3 border-b border-parchment pb-4">
          <User className="h-5 w-5 text-gold" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-dark">Profile Details</h2>
        </div>
        <div className="space-y-2 text-xs">
          {user?.name && <p className="font-semibold text-dark">{user.name}</p>}
          <p className="text-taupe">{user?.email}</p>
          {user?.phone && <p className="text-taupe">{user.phone}</p>}
        </div>
      </div>
    </div>
  );
}
