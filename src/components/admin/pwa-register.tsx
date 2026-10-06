'use client';

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Auto-register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[PWA] Service Worker registration skipped:', err);
      });
    }

    // 2. Detect if app is already running in standalone mode (installed PWA)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    }

    // 3. Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
        Admin App Installed
      </span>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="px-3 py-1.5 bg-gold text-dark hover:bg-gold/90 text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 shadow-sm border border-gold/40"
      title="Install Secret Admin Console as a Desktop / Mobile App"
    >
      <Download className="w-3.5 h-3.5 text-dark" />
      <span>Install Admin App</span>
    </button>
  );
}
