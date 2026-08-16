'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNotificationToggle } from '@/components/admin/admin-notification-toggle';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'NOTIFICATIONS' | 'GENERAL' | 'CURRENCY'>('WHATSAPP');

  // WhatsApp Config state
  const [phoneNumber, setPhoneNumber] = useState('+919876500000');
  const [displayName, setDisplayName] = useState('THALF Artisanal Concierge');
  const [enabled, setEnabled] = useState(true);
  const [messageFooter, setMessageFooter] = useState(
    'Please confirm my order and share the payment details.\n\nThank you.'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/v1/admin/settings/whatsapp');
        const data = await res.json();
        if (isMounted && data.success && data.config) {
          setPhoneNumber(data.config.phoneNumber);
          setDisplayName(data.config.displayName);
          setEnabled(data.config.enabled);
          setMessageFooter(data.config.messageFooter);
        }
      } catch (err) {
        setErrorMsg('Failed to load settings from server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleSaveWhatsAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/admin/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          displayName,
          enabled,
          messageFooter,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSuccessMsg('WhatsApp Concierge settings updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Save operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Store Configuration</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Settings & Integrations
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-parchment space-x-2">
        <button
          onClick={() => setActiveTab('WHATSAPP')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'WHATSAPP'
              ? 'border-gold text-dark bg-cream'
              : 'border-transparent text-dark/60 hover:text-dark'
          }`}
        >
          <Smartphone className="h-4 w-4 text-gold" />
          <span>WhatsApp Assisted Checkout</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-gold text-dark bg-cream'
              : 'border-transparent text-dark/60 hover:text-dark'
          }`}
        >
          <span>Push Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'GENERAL'
              ? 'border-gold text-dark bg-cream'
              : 'border-transparent text-dark/60 hover:text-dark'
          }`}
        >
          General & Brand
        </button>

        <button
          onClick={() => setActiveTab('CURRENCY')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'CURRENCY'
              ? 'border-gold text-dark bg-cream'
              : 'border-transparent text-dark/60 hover:text-dark'
          }`}
        >
          Currency & Taxes
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-green-100 border border-green-300 text-green-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* WhatsApp Settings Panel */}
      {activeTab === 'WHATSAPP' && (
        <form onSubmit={handleSaveWhatsAppSettings} className="bg-cream border border-parchment p-6 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark">
              WhatsApp Business Concierge Setup
            </h2>
            <p className="text-xs text-dark/60 mt-0.5">
              Configure the receiving phone number and pre-filled handoff message templates for Phase-1 customer checkout.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-dark/50">Loading settings...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  WhatsApp Ordering Status
                </label>
                <div className="flex items-center space-x-3 p-3 bg-parchment/30 border border-parchment">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 accent-gold cursor-pointer"
                  />
                  <span className="text-xs font-bold text-dark">
                    {enabled ? 'WhatsApp Checkout Active' : 'WhatsApp Checkout Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Business WhatsApp Phone Number (E.164 format)
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+919876500000"
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono text-dark focus:border-gold outline-none"
                />
                <p className="text-[10px] text-dark/50 mt-1">
                  Customers clicking &ldquo;Place Order on WhatsApp&rdquo; will be directed to this number.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Concierge Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="THALF Artisanal Concierge"
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Pre-filled Message Footer
                </label>
                <textarea
                  rows={3}
                  value={messageFooter}
                  onChange={(e) => setMessageFooter(e.target.value)}
                  className="w-full p-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-parchment flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gold text-dark hover:bg-gold-dark hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Push Notifications Settings Panel */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark border-b border-parchment pb-3">
            Real-Time Push Notification Management
          </h2>
          <AdminNotificationToggle />
        </div>
      )}

      {/* General Settings Panel */}
      {activeTab === 'GENERAL' && (
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark">Brand & Store Identity</h2>
          <p className="text-dark/60">Store Name: THALF Artisanal Chocolates</p>
          <p className="text-dark/60">Brand Theme: Luxury Dark Charcoal, Parchment, Cream & Warm Gold</p>
        </div>
      )}

      {/* Currency & Taxes Panel */}
      {activeTab === 'CURRENCY' && (
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark">Currency & Tax Rules</h2>
          <div className="p-3 bg-gold-light/40 border border-gold/30 text-dark space-y-1">
            <span className="font-bold block">Phase-1 Active Policy:</span>
            <p>• Primary Currency: INR (₹)</p>
            <p>• Locale: en-IN (Asia/Kolkata)</p>
            <p>• Tax Mode: Zero GST/VAT calculation in Phase-1.</p>
          </div>
        </div>
      )}

    </div>
  );
}
