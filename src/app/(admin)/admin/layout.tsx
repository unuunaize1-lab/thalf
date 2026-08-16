'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ClipboardList, 
  Package, 
  Users, 
  Ticket, 
  MessageSquare, 
  BarChart3, 
  FileSpreadsheet, 
  Image, 
  Megaphone, 
  Settings, 
  ShieldAlert, 
  History,
  Menu,
  X,
  LogOut,
  Gift
} from 'lucide-react';

const adminModules = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Hampers Catalog', href: '/admin/hampers', icon: Gift },
  { name: 'Quote Requests', href: '/admin/hampers/quotes', icon: ClipboardList },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileSpreadsheet },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Client Gallery', href: '/admin/gallery', icon: Image },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldAlert },
  { name: 'Audit Logs', href: '/admin/logs', icon: History },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determine the storefront URL based on current hostname
  const storefrontUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    const host = window.location.hostname;
    if (host.startsWith('admin.')) {
      // Production admin subdomain → link to apex domain
      const apex = host.replace(/^admin\./, '');
      return `${window.location.protocol}//${apex}`;
    }
    return '/'; // localhost — same origin
  }, []);

  React.useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !['ADMIN', 'SUPER_ADMIN', 'CONCIERGE'].includes(data.user?.role)) {
          window.location.href = '/login?redirect=' + encodeURIComponent(pathname);
        }
      })
      .catch(() => {
        window.location.href = '/login?redirect=' + encodeURIComponent(pathname);
      });
  }, [pathname]);

  return (
    <div className="flex h-screen bg-cream text-dark-slate overflow-hidden">
      
      {/* 1. Mobile Sidebar Backdrop & Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar content */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-dark pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-cream" />
              </button>
            </div>
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center px-4 mb-6">
              <a href={storefrontUrl} className="flex flex-col">
                <span className="font-serif text-lg font-black uppercase tracking-[0.2em] text-cream">THALF</span>
                <span className="text-[6px] font-bold uppercase tracking-[0.3em] text-gold">Management Console</span>
              </a>
            </div>
            {/* Navigation links */}
            <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
              {adminModules.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-none transition-colors duration-150 ${
                      isActive 
                        ? 'bg-gold text-dark' 
                        : 'text-parchment/70 hover:bg-cacao hover:text-cream'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 2. Desktop Sidebar Menu */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col bg-dark border-r border-parchment/10">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center px-6 mb-8">
            <a href={storefrontUrl} className="flex flex-col">
              <span className="font-serif text-xl font-black uppercase tracking-[0.2em] text-cream">THALF</span>
              <span className="text-[7px] font-bold uppercase tracking-[0.35em] text-gold mt-0.5">Management Console</span>
            </a>
          </div>
          {/* Navigation links */}
          <nav className="flex-grow space-y-1 px-4">
            {adminModules.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider rounded-none transition-all duration-200 ${
                    isActive 
                      ? 'bg-gold text-dark' 
                      : 'text-parchment/65 hover:bg-cacao/40 hover:text-cream'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-dark' : 'text-parchment/40 group-hover:text-cream'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* Footer of Sidebar */}
          <div className="flex-shrink-0 flex border-t border-parchment/10 p-4">
            <a
              href={storefrontUrl}
              className="group flex w-full items-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-parchment/60 hover:text-cream transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-parchment/40 group-hover:text-cream" />
              Exit to Store
            </a>
          </div>
        </div>
      </div>

      {/* 3. Main Page Shell */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header toolbar */}
        <header className="flex h-16 items-center justify-between border-b border-parchment/40 bg-cream/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2 text-dark hover:text-gold lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dark/75">Administrator</span>
              <div className="h-8 w-8 rounded-full bg-dark text-cream flex items-center justify-center font-serif font-black text-xs border border-gold/40">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
