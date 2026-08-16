'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MessageCircle, 
  Clock, 
  PackageX, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight,
  FileCheck2
} from 'lucide-react';

interface WhatsAppSettings {
  phoneNumber: string;
  displayName: string;
  enabled: boolean;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
}

export default function ReturnsRefundsPolicyPage() {
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppSettings>({
    phoneNumber: '919061107915',
    displayName: 'THALF Artisanal Concierge',
    enabled: true,
  });
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [requestType, setRequestType] = useState<'Return' | 'Replacement' | 'Refund' | 'General Assistance'>('Replacement');
  const [customOrderInput, setCustomOrderInput] = useState<string>('');

  useEffect(() => {
    // 1. Fetch dynamic WhatsApp business config
    async function fetchWhatsAppConfig() {
      try {
        const res = await fetch('/api/v1/settings/whatsapp');
        const data = await res.json();
        if (data.success && data.phoneNumber) {
          setWhatsappConfig({
            phoneNumber: data.phoneNumber.replace(/\D/g, ''),
            displayName: data.displayName || 'THALF Artisanal Concierge',
            enabled: data.enabled !== false,
          });
        }
      } catch (err) {
        // Fallback to default state silently
      }
    }

    // 2. Fetch authenticated customer's recent orders for safe prefilling
    async function fetchCustomerOrders() {
      try {
        const res = await fetch('/api/v1/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const mapped: CustomerOrder[] = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
          }));
          setUserOrders(mapped);
          if (mapped.length > 0) {
            setSelectedOrderNumber(mapped[0].orderNumber);
          }
        }
      } catch {
        // Guest user or not logged in; fallback to manual input
      }
    }

    fetchWhatsAppConfig();
    fetchCustomerOrders();
  }, []);

  // Generate safe WhatsApp prefilled deep link
  const activeOrderNum = selectedOrderNumber || customOrderInput.trim() || '[Your Order Number]';
  const rawMessage = `Hello THALF, I need assistance with my order.\n\nOrder Number: ${activeOrderNum}\nRequest: ${requestType}\n\nPlease guide me.`;
  const encodedMessage = encodeURIComponent(rawMessage);
  const targetPhone = whatsappConfig.phoneNumber.replace(/\D/g, '') || '919061107915';
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

  return (
    <div className="bg-cream text-dark min-h-screen">
      {/* 1. Header Hero Banner */}
      <section className="bg-dark text-cream border-b border-gold/20 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,160,89,0.1),_transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gold border border-gold/30 px-3 py-1 bg-gold/10">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Operational Policy & Concierge Care</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black uppercase tracking-wider text-cream">
            Returns, Replacements & Refunds
          </h1>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl mx-auto leading-relaxed">
            Our commitment to artisanal quality, temperature preservation, and fair dispute resolution for THALF Handmade Chocolates.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        
        {/* Important Notice Callout */}
        <div className="bg-amber-50/70 border border-amber-200 p-6 space-y-3 shadow-lux">
          <div className="flex items-center space-x-3 text-amber-900 font-serif font-bold text-base">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <h2>Food & Confectionery Product Policy Notice</h2>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed font-sans">
            Because THALF products are perishable food and artisanal chocolate items, delivered products are <strong>generally not eligible for return or exchange</strong>. To preserve strict hygiene and food safety standards, once a package is delivered, it cannot be returned to our atelier inventory.
          </p>
        </div>

        {/* Section 1: Returns Policy */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4 flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <PackageX className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> General Return Policy
            </h2>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 border border-gold/30">
              Food Safety
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
            Delivered THALF chocolate creations are non-returnable. We do not accept returns or exchanges for:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dark/70 pt-2">
            <li className="flex items-start space-x-2 bg-parchment/30 p-3 border border-parchment/60">
              <span className="text-red-700 font-bold">✕</span>
              <span><strong>Change of mind</strong> after order dispatch</span>
            </li>
            <li className="flex items-start space-x-2 bg-parchment/30 p-3 border border-parchment/60">
              <span className="text-red-700 font-bold">✕</span>
              <span><strong>Taste preference</strong> or subjective flavor profiles</span>
            </li>
            <li className="flex items-start space-x-2 bg-parchment/30 p-3 border border-parchment/60">
              <span className="text-red-700 font-bold">✕</span>
              <span><strong>Ordering the wrong product</strong> by mistake</span>
            </li>
            <li className="flex items-start space-x-2 bg-parchment/30 p-3 border border-parchment/60">
              <span className="text-red-700 font-bold">✕</span>
              <span><strong>Ordering the wrong quantity</strong> during checkout</span>
            </li>
          </ul>
        </section>

        {/* Section 2: Eligible Issues */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <CheckCircle2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> What Qualifies for Assistance
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
            THALF will thoroughly review claims and provide appropriate replacement or refund assistance for genuine fulfillment or transit issues, including:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-parchment bg-cream p-4 space-y-1">
              <h3 className="font-serif font-bold text-sm text-dark">Damaged Products</h3>
              <p className="text-xs text-dark/70">Boxes or chocolate slabs crushed, broken, or damaged during transit.</p>
            </div>
            <div className="border border-parchment bg-cream p-4 space-y-1">
              <h3 className="font-serif font-bold text-sm text-dark">Incorrect Products</h3>
              <p className="text-xs text-dark/70">Items received differ from the creations listed on your order confirmation.</p>
            </div>
            <div className="border border-parchment bg-cream p-4 space-y-1">
              <h3 className="font-serif font-bold text-sm text-dark">Missing Products</h3>
              <p className="text-xs text-dark/70">Shortages or missing items from a multi-item presentation hamper.</p>
            </div>
            <div className="border border-parchment bg-cream p-4 space-y-1">
              <h3 className="font-serif font-bold text-sm text-dark">Melted / Unusable Chocolate</h3>
              <p className="text-xs text-dark/70">Chocolate severely melted or altered due to unexpected courier delay.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Melted Chocolate Policy */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <Flame className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Damaged or Melted Chocolate
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
            Handcrafted luxury chocolate is temperature sensitive. We package all dispatches in thermal insulated presentation boxes with gel ice packs. However, during high ambient summer temperatures or unexpected courier delays, transit issues may occur.
          </p>
          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-semibold">
            We do NOT automatically reject melted chocolate claims. If your order arrives melted, liquid, or compromised, please contact Concierge support within 48 hours with video/photo proof for evaluation.
          </p>
        </section>

        {/* Section 4: Reporting Window */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <Clock className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Reporting Window (48 Hours)
            </h2>
          </div>
          <div className="flex items-start space-x-4 bg-parchment/40 p-4 border border-parchment">
            <Clock className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-dark">Strict 48-Hour Claim Period</h3>
              <p className="text-xs text-dark/80 leading-relaxed">
                All damage, melting, missing item, or incorrect delivery claims must be reported within <strong>48 hours of delivery completion</strong>. Requests submitted after 48 hours may be declined unless THALF determines that an exception is justified.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: How to Request Help via WhatsApp */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <MessageCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> How to Request Assistance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
            THALF handles all order claims through our dedicated <strong>WhatsApp Concierge Support Channel</strong>. There is no automated self-serve return portal.
          </p>
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-dark/70">Please prepare the following information when reaching out:</p>
            <ol className="list-decimal list-inside text-xs text-dark/80 space-y-2 bg-parchment/30 p-4 border border-parchment">
              <li><strong>Order Number</strong> (e.g. #THF-84920)</li>
              <li><strong>Registered Mobile Number</strong> used at checkout</li>
              <li><strong>Clear reason for the request</strong> (Damaged / Melted / Missing / Wrong Item)</li>
              <li><strong>High-resolution photos</strong> of the exterior package and product</li>
              <li><strong>Unboxing video evidence</strong> where useful for melted or missing items</li>
            </ol>
          </div>
        </section>

        {/* Section 6: Refunds & Resolutions */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center">
              <FileCheck2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Refunds & Possible Resolutions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed">
            All requests are manually reviewed by our master concierge team. Upon verification of a valid claim, THALF may offer:
          </p>
          <ul className="list-disc list-inside text-xs text-dark/80 space-y-1.5 pl-2">
            <li><strong>Express Product Replacement</strong> dispatched at zero additional charge</li>
            <li><strong>Monetary Refund</strong> processed back to your original payment account</li>
            <li><strong>Store Credit / Atelier Voucher</strong> for future releases</li>
          </ul>
          <p className="text-xs text-dark/60 italic pt-2 border-t border-parchment">
            Note: Refund requests are reviewed and explicitly approved by THALF Admin. Once approved, you will be notified via WhatsApp when the refund transaction has been initiated.
          </p>
        </section>

        {/* Section 7: Dedicated WhatsApp Concierge CTA Card */}
        <section id="contact-concierge" className="bg-dark text-cream border border-gold/40 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(197,160,89,0.15),_transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-gold text-[10px] font-bold uppercase tracking-ultra">
              <MessageCircle className="w-4 h-4" />
              <span>Direct Concierge Handoff</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl uppercase text-cream">
              Need help with your order?
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light max-w-xl">
              Contact our Concierge team on WhatsApp for returns, replacements and refund assistance.
            </p>

            {/* Order selector / prefill form for customer */}
            <div className="bg-cream/5 border border-gold/20 p-4 space-y-3 max-w-lg">
              {userOrders.length > 0 ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1">
                    Select Your Recent Order:
                  </label>
                  <select
                    value={selectedOrderNumber}
                    onChange={(e) => setSelectedOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-dark/90 border border-gold/40 text-cream text-xs font-mono focus:outline-none focus:border-gold"
                  >
                    {userOrders.map((ord) => (
                      <option key={ord.id} value={ord.orderNumber}>
                        #{ord.orderNumber} ({new Date(ord.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1">
                    Enter Order Number (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THF-10492"
                    value={customOrderInput}
                    onChange={(e) => setCustomOrderInput(e.target.value)}
                    className="w-full px-3 py-2 bg-dark/90 border border-gold/40 text-cream text-xs font-mono focus:outline-none focus:border-gold placeholder:text-taupe/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1">
                  Request Category:
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-dark/90 border border-gold/40 text-cream text-xs font-sans focus:outline-none focus:border-gold"
                >
                  <option value="Replacement">Replacement (Damaged / Melted / Wrong Item)</option>
                  <option value="Refund">Refund Request</option>
                  <option value="Return">Return Query</option>
                  <option value="General Assistance">General Order Support</option>
                </select>
              </div>

              {/* Message Preview */}
              <div className="pt-2">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-taupe mb-1">Prefilled WhatsApp Message Preview:</span>
                <pre className="p-3 bg-dark/80 border border-gold/20 text-[10px] font-mono text-gold/90 whitespace-pre-wrap rounded-none">
                  {rawMessage}
                </pre>
              </div>
            </div>

            {/* Launch WhatsApp Deep Link Button */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-dark hover:bg-gold-light text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl space-x-2"
              >
                <MessageCircle className="w-4 h-4 fill-dark" />
                <span>Contact THALF on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
