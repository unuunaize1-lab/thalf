import type { Metadata } from 'next';
import RefundPolicyClient from './refund-policy-client';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | THALF Artisanal Chocolates',
  description: 'Official Refund & Cancellation Policy for THALF Artisanal Chocolates. Guidelines on Razorpay payment gateway reversals, administrative refund timelines, 1-hour cancellation window, and atelier store credit vouchers.',
  keywords: [
    'THALF refund policy',
    'chocolate refund policy',
    'Razorpay refund timeline',
    'THALF order cancellation',
    'atelier store credit',
    'online chocolate refund India'
  ],
  openGraph: {
    title: 'Refund & Cancellation Policy | THALF Chocolates',
    description: 'Official refund and cancellation guidelines for THALF Artisanal Chocolates. Direct payment reversals, UPI/card timelines, and fair dispute resolution.',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicyClient />;
}
