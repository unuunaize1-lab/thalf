import type { Metadata } from 'next';
import ReturnPolicyClient from './return-policy-client';

export const metadata: Metadata = {
  title: 'Strict Return Policy | THALF Artisanal Chocolates',
  description: 'Official Return & Exchange Policy for THALF Artisanal Chocolates. Due to food safety standards and the perishable nature of luxury chocolate, all sales are final once delivered. Learn about transit damage protection, melting guarantees, and zero return shipping.',
  keywords: [
    'THALF return policy',
    'chocolate return policy',
    'no return policy perishable food',
    'melted chocolate policy',
    'zero return shipping',
    'artisanal chocolate return policy India'
  ],
  openGraph: {
    title: 'Strict Return & Exchange Policy | THALF Chocolates',
    description: 'Official return and exchange guidelines for THALF Artisanal Chocolates. Strict no-return policy for perishable confectionery with 100% transit damage protection.',
    type: 'website',
  },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
