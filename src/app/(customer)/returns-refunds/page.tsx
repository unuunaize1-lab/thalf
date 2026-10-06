import type { Metadata } from 'next';
import ReturnsRefundsClient from './returns-refunds-client';

export const metadata: Metadata = {
  title: 'Refund Policy & Strict No-Return Policy | THALF Artisanal Chocolates',
  description: 'Read the comprehensive Refund Policy and Return Policy for THALF Artisanal Chocolates. Due to food safety regulations and the perishable nature of luxury chocolate, all sales are final once delivered. Learn about transit damage protection, melting guarantees, and refund timelines.',
  keywords: [
    'THALF refund policy',
    'THALF return policy',
    'chocolate return policy',
    'no return policy perishable food',
    'melted chocolate policy',
    'THALF replacement guarantee',
    'luxury chocolate return policy India'
  ],
  openGraph: {
    title: 'Refund Policy & Strict No-Return Policy | THALF Chocolates',
    description: 'Official return and refund guidelines for THALF Artisanal Chocolates. Strict no-return policy for perishable confectionery with 100% transit damage protection.',
    type: 'website',
  },
};

export default function ReturnsRefundsPolicyPage() {
  return <ReturnsRefundsClient />;
}
