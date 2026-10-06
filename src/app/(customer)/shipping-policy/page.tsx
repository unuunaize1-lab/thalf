import type { Metadata } from 'next';
import ShippingPolicyClient from './shipping-policy-client';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | THALF Artisanal Chocolates',
  description: 'Official Shipping & Delivery Policy for THALF Artisanal Chocolates. Discover our cold-chain thermal packaging, dispatch schedules (Monday–Thursday), flat shipping rates for Kerala (₹80) and Rest of India (₹100), and transit guarantees.',
  keywords: [
    'THALF shipping policy',
    'chocolate delivery India',
    'cold chain chocolate shipping',
    'temperature controlled chocolate delivery',
    'Kerala chocolate delivery',
    'artisanal chocolate courier'
  ],
  openGraph: {
    title: 'Shipping & Cold-Chain Delivery Policy | THALF Chocolates',
    description: 'Specialized thermal-insulated chocolate delivery across Kerala and India with live tracking and melting protection.',
    type: 'website',
  },
};

export default function ShippingPolicyPage() {
  return <ShippingPolicyClient />;
}
