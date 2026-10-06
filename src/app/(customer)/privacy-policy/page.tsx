import type { Metadata } from 'next';
import PrivacyPolicyClient from './privacy-policy-client';

export const metadata: Metadata = {
  title: 'Privacy Policy | THALF Artisanal Chocolates',
  description: 'Official Privacy Policy for THALF Artisanal Chocolates in accordance with the Digital Personal Data Protection Act (DPDP Act, 2023) and Information Technology Act, 2000. Learn how we safeguard your personal information, handle secure Razorpay payments, and protect patron confidentiality.',
  keywords: [
    'THALF privacy policy',
    'chocolate store privacy policy',
    'data protection policy India',
    'DPDP Act compliance',
    'secure payment privacy Razorpay',
    'customer data privacy Kerala'
  ],
  openGraph: {
    title: 'Privacy Policy & Patron Data Protection | THALF Chocolates',
    description: 'Our commitment to safeguarding patron confidentiality, secure encrypted transactions, and full DPDP Act compliance.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
