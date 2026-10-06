'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  MessageCircle, 
  Mail, 
  Server, 
  CreditCard, 
  Trash2, 
  UserCheck,
  Scale,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const PRIVACY_FAQS: FAQItem[] = [
  {
    question: 'Does THALF ever sell or rent my personal contact details?',
    answer: 'Never. THALF maintains a strict Zero-Monetization policy regarding customer data. We have never sold, rented, leased, or traded our patrons’ names, phone numbers, addresses, or order history to third-party marketing networks, data brokers, or advertisers.'
  },
  {
    question: 'Does THALF store my credit card, debit card, or UPI PIN numbers?',
    answer: 'No. THALF does not capture, store, or have access to your sensitive payment credentials. All payments are processed through Razorpay, a Reserve Bank of India (RBI) authorized payment aggregator certified with PCI-DSS Level 1 compliance. Your card numbers, CVVs, and UPI MPINs never touch THALF servers.'
  },
  {
    question: 'Why do you request my phone number and WhatsApp number?',
    answer: 'Because fresh chocolate requires temperature-sensitive doorstep delivery, your phone number is required by our express logistics carriers (Delhivery, Blue Dart, DTDC) to coordinate delivery timing, verify OTPs, and prevent packages from being left in hot mailboxes. We also use WhatsApp to send automated dispatch tracking codes.'
  },
  {
    question: 'How long does THALF retain my personal order data?',
    answer: 'We retain transaction invoices, customer names, and addresses for up to 7 fiscal years to satisfy statutory compliance under Indian Goods and Services Tax (GST) and accounting regulations. Account profile information can be deleted or anonymized upon request.'
  },
  {
    question: 'How can I exercise my right to erasure (data deletion) under the DPDP Act 2023?',
    answer: 'Under the Digital Personal Data Protection Act, 2023, you have the right to request the erasure of your personal data. You may submit an erasure request directly via our interactive Concierge Tool below or by emailing our Grievance Officer at privacy@thalf.store. We process non-statutory erasure requests within 7 business days.'
  },
  {
    question: 'What types of cookies does the THALF website use?',
    answer: 'We use strictly necessary functional cookies to maintain your shopping bag items, remember user session tokens, and ensure CSRF security during checkout. We do not use intrusive third-party cross-site behavioral tracking cookies.'
  }
];

export default function PrivacyPolicyClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [requestType, setRequestType] = useState<
    'Data Summary Request' | 'Correction of Address/Profile' | 'Marketing Unsubscribe' | 'Account & Data Erasure'
  >('Data Summary Request');
  const [patronContact, setPatronContact] = useState('');
  const [customRequestNotes, setCustomRequestNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const copyPolicyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const generateWhatsAppMessage = () => {
    const contactLine = patronContact.trim() ? `Patron Phone/Email: ${patronContact.trim()}\n` : '';
    const notesLine = customRequestNotes.trim() ? `Details: ${customRequestNotes.trim()}\n` : '';
    return encodeURIComponent(
      `*THALF PRIVACY RIGHTS & GRIEVANCE REQUEST*\n` +
      `Request Type: ${requestType}\n` +
      contactLine +
      notesLine +
      `Submitted under Digital Personal Data Protection Act (DPDP Act, 2023).`
    );
  };

  return (
    <div className="bg-[#0B0604] text-[#FAF7F2] min-h-screen selection:bg-[#C5A059] selection:text-[#0B0604]" suppressHydrationWarning>
      
      {/* 1. HERO HEADER */}
      <section className="relative pt-24 pb-16 border-b border-[#C5A059]/20 overflow-hidden bg-gradient-to-b from-[#140C08] via-[#0E0805] to-[#0B0604]">
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C5A059]/30 blur-[120px]" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-[#5A3D24]/40 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-[#C5A059]/90">
            <div className="flex items-center space-x-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#FAF7F2]">Privacy Policy</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#C5A059]/10 border border-[#C5A059]/30 px-3 py-1 text-[11px]">
              <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>DPDP Act (2023) & IT Act Compliant</span>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059] block">
              Patron Confidentiality & Governance
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-cream leading-[1.05] tracking-tight">
              Privacy Policy <span className="poetic-italic font-normal text-[#C5A059]">&</span> Data Protection.
            </h1>
            <p className="text-sm sm:text-base text-taupe font-light leading-relaxed">
              At THALF Chocolates, we honor your trust with the highest standards of data integrity. Learn how your information is gathered, encrypted, and protected in full accordance with Indian data privacy statutes.
            </p>
          </div>

          <div className="pt-4 border-t border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-taupe font-mono">
            <div className="flex items-center space-x-4">
              <span>Effective: October 2026</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={copyPolicyLink}
                suppressHydrationWarning
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-[#C5A059]/30 hover:border-[#C5A059] text-[#FAF7F2] hover:text-[#C5A059] transition-colors text-[11px]"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Policy'}</span>
              </button>

              <a
                href="#grievance"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#C5A059] text-[#0B0604] hover:bg-[#D4AF37] font-semibold transition-colors text-[11px]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Grievance Officer</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CORE PRIVACY COMMITMENTS */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">Zero Data Sale</h3>
              <p className="text-xs text-taupe leading-relaxed">
                We never monetize, sell, or lease your personal information or purchase history to third-party marketing brokers or advertising companies.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              Strict Non-Disclosure
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">No Card Storage</h3>
              <p className="text-xs text-taupe leading-relaxed">
                Payments are handled directly by RBI-authorized gateway Razorpay (PCI-DSS Level 1). THALF never stores card numbers, CVVs, or PINs.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              RBI & PCI-DSS Compliant
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">SSL Encryption</h3>
              <p className="text-xs text-taupe leading-relaxed">
                All communications and order data are transmitted across robust 256-bit TLS/SSL cryptographic channels preventing eavesdropping.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              End-to-End Security
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">Patron Control</h3>
              <p className="text-xs text-taupe leading-relaxed">
                You retain complete rights to access, update, export, or request the deletion of your account information under the DPDP Act 2023.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              Full Erasure Rights
            </span>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES OF DATA COLLECTED */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Data Scope & Taxonomy</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Information We Collect and Why</h2>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl">
            We collect only the precise information necessary to craft your chocolates, process authorized payments, and coordinate cold-chain doorstep delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#140C08] border border-[#C5A059]/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-[#C5A059]">
              <FileText className="w-4 h-4" />
              <h4 className="font-editorial text-xl text-cream font-medium">Personal & Contact Coordinates</h4>
            </div>
            <ul className="text-xs text-taupe space-y-2 font-light list-disc pl-4">
              <li><strong className="text-cream">Full Name: </strong>Used to identify your order and print bespoke gift box inscriptions.</li>
              <li><strong className="text-cream">Phone & WhatsApp: </strong>Used by couriers for doorstep delivery calls, delivery OTP verification, and automated AWB tracking dispatch.</li>
              <li><strong className="text-cream">Email Address: </strong>Used to transmit tax invoices, payment receipts, and order confirmations.</li>
            </ul>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-[#C5A059]">
              <Server className="w-4 h-4" />
              <h4 className="font-editorial text-xl text-cream font-medium">Delivery & Logistics Coordinates</h4>
            </div>
            <ul className="text-xs text-taupe space-y-2 font-light list-disc pl-4">
              <li><strong className="text-cream">Shipping Address & Landmark: </strong>Provided to express courier partners to ensure accurate door delivery.</li>
              <li><strong className="text-cream">Postal PIN Code: </strong>Used to verify cold-chain serviceability, calculate regional rates (₹80 / ₹100), and schedule dispatches.</li>
              <li><strong className="text-cream">Gift Recipient Details: </strong>When ordering a gift hamper, recipient names and addresses are used strictly for parcel routing.</li>
            </ul>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-[#C5A059]">
              <CreditCard className="w-4 h-4" />
              <h4 className="font-editorial text-xl text-cream font-medium">Payment & Transaction Records</h4>
            </div>
            <ul className="text-xs text-taupe space-y-2 font-light list-disc pl-4">
              <li><strong className="text-cream">Transaction Reference: </strong>Razorpay payment transaction ID, timestamp, and payment status (Success/Failed).</li>
              <li><strong className="text-cream">Payment Mode: </strong>Indicates method used (UPI, Net Banking, Credit/Debit Card) for reconciliation.</li>
              <li><strong className="text-cream">Card Protection: </strong>THALF never captures, logs, or stores card numbers, CVVs, or OTPs.</li>
            </ul>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-[#C5A059]">
              <Lock className="w-4 h-4" />
              <h4 className="font-editorial text-xl text-cream font-medium">Technical & Diagnostic Logs</h4>
            </div>
            <ul className="text-xs text-taupe space-y-2 font-light list-disc pl-4">
              <li><strong className="text-cream">Device & IP Headers: </strong>Logged temporarily for cybersecurity audits, DDoS mitigation, and fraud prevention.</li>
              <li><strong className="text-cream">Session Cart Cookies: </strong>Used locally on your device to maintain chocolate items in your shopping bag.</li>
              <li><strong className="text-cream">Zero Cross-Site Trackers: </strong>We do not deploy intrusive third-party behavioural ad-trackers.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. THIRD-PARTY DATA DISCLOSURES */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Data Processing Partners</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Strict Need-To-Know Sharing</h2>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl">
            We share your data strictly with trusted partners essential for fulfilling your purchase:
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h4 className="font-editorial text-lg text-cream font-medium">1. Express Courier Partners (Delhivery, Blue Dart, DTDC, India Post)</h4>
              <p className="text-xs text-taupe font-light">
                We share your recipient name, postal address, PIN code, and mobile number strictly for package routing, OTP verification, and doorstep handover.
              </p>
            </div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 self-start sm:self-auto">
              Doorstep Logistics Only
            </span>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h4 className="font-editorial text-lg text-cream font-medium">2. Payment Gateway (Razorpay Software Private Limited)</h4>
              <p className="text-xs text-taupe font-light">
                Razorpay securely tokenizes transactions under RBI payment guidelines. THALF does not handle raw card data.
              </p>
            </div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 self-start sm:self-auto">
              RBI & PCI-DSS Tier 1
            </span>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h4 className="font-editorial text-lg text-cream font-medium">3. WhatsApp Cloud API / SMS Gateway</h4>
              <p className="text-xs text-taupe font-light">
                Used solely to transmit transaction notifications, live tracking links, and customer care responses. Never used for spam.
              </p>
            </div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 self-start sm:self-auto">
              Transactional Only
            </span>
          </div>
        </div>
      </section>

      {/* 5. PATRON RIGHTS UNDER DPDP ACT 2023 */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Statutory Safeguards</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Your Rights Under Indian Privacy Law</h2>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl">
            In compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the IT Rules (2011), you possess comprehensive sovereignty over your personal data:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-taupe font-light">
          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right to Access Summary</h4>
            <p>You may request a clear summary of personal data held about you and identity of third parties with whom it was shared for delivery.</p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right to Correction & Update</h4>
            <p>You may update or correct inaccurate contact coordinates, addresses, or profile details at any point.</p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right to Erasure (Deletion)</h4>
            <p>You may request full erasure of your account details. Invoices are retained only as required under Indian taxation law.</p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right to Withdraw Consent</h4>
            <p>Where processing relies on consent (such as seasonal newsletters), you may revoke your consent with 1-click anytime.</p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right of Grievance Redressal</h4>
            <p>You have the right to register complaints with our dedicated Grievance Officer, with guaranteed resolution timelines.</p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-2">
            <h4 className="font-editorial text-base text-cream font-medium text-[#C5A059]">Right to Nominate</h4>
            <p>Under the DPDP Act 2023, you may nominate an individual to exercise your privacy rights in the event of death or incapacity.</p>
          </div>
        </div>
      </section>

      {/* 6. STATUTORY GRIEVANCE REDRESSAL OFFICER */}
      <section id="grievance" className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="bg-[#1A100B] border-2 border-[#C5A059]/40 p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Statutory Compliance Appointment</span>
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-cream font-light">
                Grievance Redressal Officer
              </h3>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 self-start sm:self-auto">
              Mandatory IT Rules 2011 / DPDP Act 2023
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-taupe font-light">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#C5A059] block">Designated Officer</span>
                <strong className="text-cream text-sm">Grievance & Data Protection Officer</strong>
                <p className="text-taupe text-xs">THALF Artisanal Chocolates</p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-[#C5A059] block">Registered Atelier Address</span>
                <p className="text-cream text-xs">THALF Confectionery Ateliers, Kerala, India - 682001</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#C5A059] block">Official Privacy Inquiries</span>
                <a href="mailto:privacy@thalf.store" className="text-[#C5A059] hover:underline font-mono text-xs block">
                  privacy@thalf.store
                </a>
                <a href="mailto:support@thalf.store" className="text-taupe hover:underline font-mono text-xs block">
                  support@thalf.store
                </a>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-[#C5A059] block">Response Turnaround Mandate</span>
                <p className="text-cream text-xs">
                  Initial acknowledgement within <strong className="text-[#C5A059]">48 hours</strong>; definitive resolution within <strong className="text-[#C5A059]">30 days</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE PRIVACY RIGHTS SUBMISSION TOOL */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="bg-[#140C08] border border-[#C5A059]/30 p-6 sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Interactive Concierge Desk</span>
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl text-cream font-light">
              Submit A Privacy Or Data Request
            </h3>
            <p className="text-xs sm:text-sm text-taupe font-light">
              Select your request category below to dispatch a formal petition directly to our Grievance Desk via WhatsApp or Email.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#C5A059] block mb-2">Request Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Data Summary Request', 'Correction of Address/Profile', 'Marketing Unsubscribe', 'Account & Data Erasure'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setRequestType(type)}
                    suppressHydrationWarning
                    className={`p-3 text-left border text-xs font-mono transition-all ${
                      requestType === type
                        ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#C5A059] font-bold'
                        : 'border-[#C5A059]/20 bg-[#0B0604] text-taupe hover:border-[#C5A059]/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#C5A059] block mb-2">Your Registered Phone / Email</label>
                <input
                  type="text"
                  value={patronContact}
                  onChange={(e) => setPatronContact(e.target.value)}
                  placeholder="e.g. +91 9876543210 or patron@email.com"
                  className="w-full bg-[#0B0604] border border-[#C5A059]/30 px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-[#C5A059]"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#C5A059] block mb-2">Optional Notes / Particulars</label>
                <input
                  type="text"
                  value={customRequestNotes}
                  onChange={(e) => setCustomRequestNotes(e.target.value)}
                  placeholder="e.g. Please update delivery address for next order"
                  className="w-full bg-[#0B0604] border border-[#C5A059]/30 px-4 py-2.5 text-xs text-cream focus:outline-none focus:border-[#C5A059]"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`https://wa.me/919061107915?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#C5A059] text-[#0B0604] hover:bg-[#D4AF37] font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center space-x-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Submit Via WhatsApp Concierge</span>
              </a>

              <a
                href={`mailto:privacy@thalf.store?subject=Privacy%20Request:%20${encodeURIComponent(requestType)}&body=${generateWhatsAppMessage()}`}
                className="px-6 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-[#FAF7F2] hover:text-[#C5A059] font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Submit Via Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRIVACY FAQS ACCORDION */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Frequently Asked Questions</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Privacy & Data Clarifications</h2>
        </div>

        <div className="space-y-3">
          {PRIVACY_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#C5A059]/25 bg-[#140C08] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  suppressHydrationWarning
                  className="w-full py-4 px-6 text-left flex items-center justify-between space-x-4 hover:bg-[#C5A059]/5 transition-colors"
                >
                  <span className="font-editorial text-base sm:text-lg text-cream font-medium">
                    {faq.question}
                  </span>
                  <span className="text-[#C5A059] flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-taupe leading-relaxed border-t border-[#C5A059]/15 font-light">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. CROSS-LINK POLICY FOOTER */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8">
        <div className="bg-[#160E0A] border border-[#C5A059]/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-editorial text-2xl text-cream font-light">Review All THALF Store Governance</h3>
            <p className="text-xs sm:text-sm text-taupe font-light">
              Explore our strict confectionery return terms, transit refund protocol, or cold-chain delivery logistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shipping-policy"
              className="px-5 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-cream hover:text-[#C5A059] transition-colors"
            >
              Shipping Policy &rarr;
            </Link>
            <Link
              href="/return-policy"
              className="px-5 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-cream hover:text-[#C5A059] transition-colors"
            >
              Return Policy &rarr;
            </Link>
            <Link
              href="/refund-policy"
              className="px-5 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-cream hover:text-[#C5A059] transition-colors"
            >
              Refund Policy &rarr;
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
