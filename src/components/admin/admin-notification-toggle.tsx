'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function AdminNotificationToggle() {
  const [supported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  });
  const [permission, setPermission] = useState<NotificationPermission | 'unknown'>(() => {
    if (typeof window === 'undefined') return 'unknown';
    return 'Notification' in window ? Notification.permission : 'unknown';
  });
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setIsSubscribed(true);
      }
    } catch (err) {
      console.warn('[AdminNotificationToggle] Error checking subscription:', err);
    }
  };

  useEffect(() => {
    if (!supported) return;

    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/v1/admin/notifications/vapid-key');
        const data = await res.json();
        if (!isMounted) return;

        if (data.success) {
          setIsConfigured(Boolean(data.isConfigured));
          setPublicKey(data.publicKey || null);

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            checkExistingSubscription();
          }
        } else {
          setIsConfigured(false);
        }
      } catch (err) {
        console.warn('[AdminNotificationToggle] Could not fetch VAPID status:', err);
      }
    };

    fetchConfig();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnableNotifications = async () => {
    if (!supported) {
      setStatusMessage('Browser push notifications are not supported in this browser.');
      return;
    }

    if (!isConfigured || !publicKey) {
      setStatusMessage('Push notifications are not configured.');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      // 1. Register Service Worker if not already active
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // 2. Intentional browser permission request
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'denied') {
        setStatusMessage('Notifications are blocked by this browser. Please unblock in site settings.');
        setLoading(false);
        return;
      }

      if (perm !== 'granted') {
        setStatusMessage('Notification permission was not granted.');
        setLoading(false);
        return;
      }

      // 3. Subscribe with PushManager
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 4. Register PushSubscription with server for authenticated Admin session
      const res = await fetch('/api/v1/admin/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save push subscription on server');
      }

      setIsSubscribed(true);
      setStatusMessage('✓ Notifications enabled for this device.');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[AdminNotificationToggle] Error enabling push notifications:', error);
      setStatusMessage(error.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2">
        <BellOff className="h-4 w-4 flex-shrink-0 text-rose-500" />
        <span>Push notifications not supported in this browser.</span>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center space-x-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
        <span>Push notifications are not configured.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-parchment/30 border border-parchment/60 rounded-none">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-gold/20 text-dark'}`}>
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark">
            Admin Order Notifications
          </h4>
          <p className="text-[11px] text-dark/70">
            Receive real-time push alerts on desktop & PWA whenever a customer places an order.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end w-full sm:w-auto">
        {permission === 'denied' ? (
          <span className="inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            Notifications are blocked by this browser
          </span>
        ) : isSubscribed ? (
          <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            ✓ Notifications enabled
          </span>
        ) : (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gold hover:bg-gold-light text-dark transition-colors border border-gold/40 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-3.5 w-3.5" />
                Enable Notifications
              </>
            )}
          </button>
        )}

        {statusMessage && (
          <span className="text-[10px] font-medium text-dark/80 mt-1">
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
}
