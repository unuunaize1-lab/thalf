'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated as Admin
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && ['ADMIN', 'SUPER_ADMIN', 'CONCIERGE'].includes(data.user?.role)) {
          router.push('/admin/orders');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials.');
      }

      const role = data.user?.role;
      if (!['ADMIN', 'SUPER_ADMIN', 'CONCIERGE'].includes(role)) {
        throw new Error('Access denied: Account does not have administrative privileges.');
      }

      window.location.href = '/admin/orders';
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 border border-gold/30 p-8 bg-dark/95 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-gold" />
          </div>
          <span className="font-serif text-3xl font-black uppercase tracking-[0.25em] text-cream">THALF</span>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold mt-1">Management Portal</p>
          <h2 className="mt-6 text-lg font-serif font-bold uppercase tracking-wider text-cream">
            Administrator Sign In
          </h2>
          <p className="mt-1 text-xs text-parchment/60 font-light">
            Authorized personnel access only
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-500/50 bg-red-950/40 text-red-200 text-xs text-center flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
          <div className="space-y-4">
            
            {/* Mobile Number Input */}
            <div>
              <label htmlFor="admin-phone" className="block text-[10px] font-bold uppercase tracking-wider text-parchment/80 mb-1">
                Admin Mobile Number
              </label>
              <div className="flex items-center border-b border-parchment/30 focus-within:border-gold transition-colors">
                <span className="px-2 text-xs font-mono text-gold border-r border-parchment/20 py-2">
                  +91
                </span>
                <input
                  id="admin-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 10 && val.startsWith('91')) {
                      val = val.substring(2);
                    } else if (val.length === 11 && val.startsWith('0')) {
                      val = val.substring(1);
                    }
                    setPhone(val.slice(0, 10));
                  }}
                  className="w-full px-3 py-2 text-xs text-cream placeholder-parchment/30 bg-transparent focus:outline-none font-mono"
                  placeholder="9876500000"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="admin-password" className="block text-[10px] font-bold uppercase tracking-wider text-parchment/80 mb-1">
                Password
              </label>
              <div className="relative border-b border-parchment/30 focus-within:border-gold transition-colors flex items-center">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-cream placeholder-parchment/30 bg-transparent focus:outline-none pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-parchment/50 hover:text-cream transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-dark hover:bg-gold/90 text-xs uppercase tracking-ultra font-bold transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Access Admin Portal'}</span>
          </button>
        </form>

        <div className="pt-6 border-t border-parchment/10 text-center">
          <Link href="/" className="text-[10px] text-parchment/50 hover:text-gold uppercase tracking-wider transition-colors">
            ← Return to Main Website
          </Link>
        </div>

      </div>
    </div>
  );
}
