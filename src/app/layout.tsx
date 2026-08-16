import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import QueryProvider from '@/providers/query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'THALF | Haute Confectionery & Bespoke Cacao Atelier',
  description: 'Genuinely handmade, single-origin Wayanad cacao chocolates presented with supreme editorial luxury and artisanal restraint.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased selection:bg-[#C5A059] selection:text-white`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1F1610] font-sans">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
