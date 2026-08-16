'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldAlert, MessageCircle, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
        throw new Error(data.error || 'Mobile number or password is incorrect.');
      }

      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN' || data.user.role === 'CONCIERGE') {
        const host = window.location.hostname;
        if (!host.startsWith('admin.') && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
          // They are on the main storefront (production), redirect them to the admin subdomain
          window.location.href = `${window.location.protocol}//admin.${host}/admin/orders`;
        } else {
          router.push('/admin/orders');
        }
      } else {
        router.push('/profile/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Mobile number or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border border-parchment p-8 bg-cream shadow-lux relative">
        
        {/* Branding Header */}
        <div className="text-center">
          <Link href="/" className="flex flex-col items-center">
            <span className="font-serif text-3xl font-black uppercase tracking-[0.25em] text-dark">THALF</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-gold mt-1">Premium Handmade Chocolate</span>
          </Link>
          <h2 className="mt-6 text-xl font-serif font-bold uppercase tracking-wider text-dark">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs text-taupe font-light">
            Sign in to access your saved reserve & order history.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-800 bg-red-950/20 text-red-200 text-xs text-center flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin} suppressHydrationWarning>
          <div className="space-y-4">
            
            {/* Mobile Number Input */}
            <div>
              <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Mobile Number
              </label>
              <div className="flex items-center border-b border-parchment focus-within:border-gold transition-colors">
                <span className="px-2 text-xs font-mono text-gold border-r border-parchment/60 py-2">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 text-xs text-dark placeholder-dark/30 bg-transparent focus:outline-none font-mono"
                  placeholder="9876543210"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[10px] text-gold hover:underline font-light"
                  suppressHydrationWarning
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative border-b border-parchment focus-within:border-gold transition-colors flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-dark placeholder-dark/30 bg-transparent focus:outline-none pr-9"
                  placeholder="••••••••"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-taupe hover:text-dark transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            suppressHydrationWarning
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-6 border-t border-parchment/60 text-center">
          <p className="text-xs text-taupe font-light">
            New to THALF?{' '}
            <Link href="/register" className="font-semibold text-dark hover:text-gold transition-colors underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream border border-parchment p-6 max-w-md w-full space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-taupe hover:text-dark"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gold">Concierge Assistance</span>
              <h3 className="text-xl font-serif text-dark font-bold">Password Recovery</h3>
              <p className="text-xs text-taupe leading-relaxed font-light">
                For security reasons, password resets are assisted directly by our THALF Concierge team. Please reach out on WhatsApp with your registered mobile number.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919061107915?text=Hello%20THALF,%20I%20need%20assistance%20recovering%20my%20account%20password."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-900 text-emerald-100 hover:bg-emerald-800 text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Concierge on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
