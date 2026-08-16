'use client';

import React, { useState } from 'react';
import { Search, User, Mail, Phone, ShoppingBag, ShieldCheck, MapPin, Eye, X } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  role: 'CUSTOMER' | 'ADMIN' | 'CONCIERGE';
  defaultCity: string;
  recentOrders: { orderNumber: string; date: string; amount: number; status: string }[];
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'usr-001',
    name: 'Sara Al-Rashidi',
    email: 'sara.rashidi@example.com',
    phone: '+91 98765 43210',
    totalOrders: 6,
    totalSpent: 18400,
    joinedDate: '2025-11-12',
    role: 'CUSTOMER',
    defaultCity: 'Mumbai',
    recentOrders: [
      { orderNumber: 'THF-2026-9812', date: '2026-08-03', amount: 2450, status: 'PENDING' },
      { orderNumber: 'THF-2026-9102', date: '2026-06-18', amount: 4500, status: 'DELIVERED' },
    ],
  },
  {
    id: 'usr-002',
    name: 'Khalid Mansour',
    email: 'khalid.m@example.com',
    phone: '+91 91234 56789',
    totalOrders: 4,
    totalSpent: 12900,
    joinedDate: '2026-01-05',
    role: 'CUSTOMER',
    defaultCity: 'Hyderabad',
    recentOrders: [
      { orderNumber: 'THF-2026-9811', date: '2026-08-02', amount: 4800, status: 'PACKED' },
    ],
  },
  {
    id: 'usr-003',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 99887 76655',
    totalOrders: 11,
    totalSpent: 42500,
    joinedDate: '2025-08-20',
    role: 'CUSTOMER',
    defaultCity: 'Gurugram',
    recentOrders: [
      { orderNumber: 'THF-2026-9810', date: '2026-08-02', amount: 6850, status: 'SHIPPED' },
    ],
  },
  {
    id: 'usr-004',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 97654 32109',
    totalOrders: 3,
    totalSpent: 7800,
    joinedDate: '2026-03-14',
    role: 'CUSTOMER',
    defaultCity: 'Kolkata',
    recentOrders: [
      { orderNumber: 'THF-2026-9809', date: '2026-08-01', amount: 3900, status: 'DELIVERED' },
    ],
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Patron Network</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Customer Directory
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Registered Patrons</span>
          <p className="text-2xl font-serif font-bold text-dark mt-2">{customers.length}</p>
        </div>

        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Average Lifetime Value</span>
          <p className="text-2xl font-serif font-bold text-gold mt-2">
            ₹{Math.round(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length).toLocaleString()}
          </p>
        </div>

        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Total Cumulative Orders</span>
          <p className="text-2xl font-serif font-bold text-dark mt-2">
            {customers.reduce((acc, c) => acc + c.totalOrders, 0)} Orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search customer by name, email, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4">Patron Name</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Total Orders</th>
                <th className="py-4 px-4">Lifetime Spend</th>
                <th className="py-4 px-4">Member Since</th>
                <th className="py-4 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="py-4 px-4 font-serif font-bold text-dark text-sm">
                    {c.name}
                  </td>

                  <td className="py-4 px-4">
                    <p className="text-xs text-dark">{c.email}</p>
                    <span className="text-[10px] text-dark/50 block">{c.phone}</span>
                  </td>

                  <td className="py-4 px-4 font-semibold text-dark/70">{c.defaultCity}</td>

                  <td className="py-4 px-4 font-bold text-dark">{c.totalOrders} Orders</td>

                  <td className="py-4 px-4 font-serif font-bold text-dark text-sm">
                    ₹{c.totalSpent.toLocaleString()}
                  </td>

                  <td className="py-4 px-4 text-dark/60 text-[10px] font-mono">{c.joinedDate}</td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="p-1.5 text-dark hover:text-gold hover:bg-parchment/60 transition-colors"
                      title="View Customer Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border-l border-parchment w-full max-w-md h-full p-6 shadow-2xl space-y-6 overflow-y-auto relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Patron Profile</span>
              <h2 className="text-2xl font-serif font-black uppercase text-dark mt-1">
                {selectedCustomer.name}
              </h2>
            </div>

            <div className="space-y-3 bg-parchment/30 p-4 border border-parchment">
              <p className="text-xs text-dark font-semibold flex items-center"><Mail className="h-3.5 w-3.5 mr-2 text-gold" /> {selectedCustomer.email}</p>
              <p className="text-xs text-dark font-semibold flex items-center"><Phone className="h-3.5 w-3.5 mr-2 text-gold" /> {selectedCustomer.phone}</p>
              <p className="text-xs text-dark font-semibold flex items-center"><MapPin className="h-3.5 w-3.5 mr-2 text-gold" /> Primary City: {selectedCustomer.defaultCity}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cream border border-parchment p-3 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-dark/50">Total Spent</span>
                <p className="text-lg font-serif font-bold text-dark mt-1">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-cream border border-parchment p-3 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-dark/50">Orders Placed</span>
                <p className="text-lg font-serif font-bold text-dark mt-1">{selectedCustomer.totalOrders}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark mb-3">Order History</h3>
              <div className="space-y-2">
                {selectedCustomer.recentOrders.map((ord, idx) => (
                  <div key={idx} className="bg-cream border border-parchment p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-dark block">{ord.orderNumber}</span>
                      <span className="text-[9px] text-dark/40">{ord.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-dark block">₹{ord.amount.toLocaleString()}</span>
                      <span className="text-[9px] font-bold uppercase text-gold">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
