'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Save, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminMarketingPage() {
  const [announcementText, setAnnouncementText] = useState('Complimentary Express Shipping on Orders Above ₹2,500');
  const [announcementActive, setAnnouncementActive] = useState(true);

  const [heroTitle, setHeroTitle] = useState('Handcrafted Luxury Chocolates');
  const [heroSubtitle, setHeroSubtitle] = useState('Experience single-origin Venezuelan dark cacao infused with rare botanical cardamom and artisanal praline layers.');
  const [heroButtonText, setHeroButtonText] = useState('Shop Chocolates');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarketingSettings() {
      try {
        const res = await fetch('/api/v1/admin/settings/marketing');
        const data = await res.json();
        if (data.success && data.marketing) {
          setAnnouncementText(data.marketing.announcementText || '');
          setAnnouncementActive(data.marketing.announcementActive !== false);
          setHeroTitle(data.marketing.heroTitle || '');
          setHeroSubtitle(data.marketing.heroSubtitle || '');
          setHeroButtonText(data.marketing.heroButtonText || '');
        }
      } catch (err: any) {
        setError('Failed to load marketing settings from server.');
      } finally {
        setLoading(false);
      }
    }

    loadMarketingSettings();
  }, []);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/admin/settings/marketing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementText,
          announcementActive,
          heroTitle,
          heroSubtitle,
          heroButtonText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update marketing banners.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Storefront CMS</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Marketing & Campaign Banners
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 p-4 text-red-800 text-xs font-bold uppercase tracking-wider flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
          {error}
        </div>
      )}

      {savedSuccess && (
        <div className="bg-green-100 border border-green-300 p-4 text-green-800 text-xs font-bold uppercase tracking-wider flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          Homepage Banners & CMS Content Published Successfully!
        </div>
      )}

      <form onSubmit={handleSaveCMS} className="space-y-6">
        
        {/* Section 1: Announcement Bar */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
              <Megaphone className="h-4 w-4 mr-2 text-gold" /> Top Announcement Bar
            </h2>
            <div className="flex items-center space-x-2">
              <input
                suppressHydrationWarning
                type="checkbox"
                id="annActive"
                checked={announcementActive}
                onChange={e => setAnnouncementActive(e.target.checked)}
                className="accent-gold"
              />
              <label htmlFor="annActive" className="text-xs font-bold uppercase text-dark">
                {announcementActive ? 'Visible' : 'Hidden'}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
              Banner Text Message
            </label>
            <input
              suppressHydrationWarning
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Section 2: Hero Section */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-gold" /> Homepage Hero Banner
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Main Headline
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                className="w-full px-3 py-2 bg-cream border border-parchment text-sm font-serif font-bold focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                Sub-Headline Description
              </label>
              <textarea
                suppressHydrationWarning
                rows={3}
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                CTA Button Text
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={heroButtonText}
                onChange={e => setHeroButtonText(e.target.value)}
                className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            suppressHydrationWarning
            type="submit"
            disabled={submitting || loading}
            className="inline-flex items-center px-6 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>{submitting ? 'Publishing...' : 'Save & Update Storefront'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
