import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CartDrawer from '@/components/layout/cart-drawer';
import QuickViewModal from '@/components/shop/quick-view-modal';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <CartDrawer />
      <QuickViewModal />
      <Footer />
    </>
  );
}
