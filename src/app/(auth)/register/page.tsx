'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Requirement Indicators
  const isMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          password,
          confirmPassword,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/profile/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border border-parchment p-8 bg-cream shadow-lux">
        
        {/* Branding Header */}
        <div className="text-center">
          <Link href="/" className="flex flex-col items-center">
            <span className="font-serif text-3xl font-black uppercase tracking-[0.25em] text-dark">THALF</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-gold mt-1">Premium Handmade Chocolate</span>
          </Link>
          <h2 className="mt-6 text-xl font-serif font-bold uppercase tracking-wider text-dark">
            Create Your Account
          </h2>
          <p className="mt-2 text-xs text-taupe font-light">
            Join the THALF Atelier for bespoke chocolate reserves & personalized service.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-800 bg-red-950/20 text-red-200 text-xs text-center flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form className="mt-8 space-y-5" onSubmit={handleRegister} suppressHydrationWarning>
          <div className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-parchment px-3 py-2 text-xs text-dark placeholder-dark/30 bg-transparent focus:border-gold focus:outline-none transition-colors"
                placeholder="Eleanor Vance"
                suppressHydrationWarning
              />
            </div>

            {/* Mobile Number */}
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

            {/* Optional Email */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70">
                  Email Address
                </label>
                <span className="text-[9px] text-taupe font-mono uppercase">(Optional)</span>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-parchment px-3 py-2 text-xs text-dark placeholder-dark/30 bg-transparent focus:border-gold focus:outline-none transition-colors"
                placeholder="eleanor@example.com"
                suppressHydrationWarning
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Password
              </label>
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

              {/* Password Requirement Indicators */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1 text-[10px] text-taupe">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className={`w-3 h-3 ${isMinLength ? 'text-emerald-600' : 'text-taupe/40'}`} />
                    <span>At least 8 characters long</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className={`w-3 h-3 ${hasNumberOrSymbol ? 'text-emerald-600' : 'text-taupe/40'}`} />
                    <span>Contains number or symbol</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Confirm Password
              </label>
              <div className="relative border-b border-parchment focus-within:border-gold transition-colors flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-dark placeholder-dark/30 bg-transparent focus:outline-none pr-9"
                  placeholder="••••••••"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 text-taupe hover:text-dark transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  suppressHydrationWarning
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <span className={`text-[10px] mt-1 block ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </span>
              )}
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            suppressHydrationWarning
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="pt-6 border-t border-parchment/60 text-center">
          <p className="text-xs text-taupe font-light">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-dark hover:text-gold transition-colors underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
