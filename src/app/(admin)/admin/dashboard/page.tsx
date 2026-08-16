import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Overview</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">Dashboard</h1>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">Total Revenue</span>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-dark mt-4">—</p>
          <span className="text-[9px] text-dark/40 font-bold block mt-1">No data available</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">Active Orders</span>
            <ShoppingBag className="h-5 w-5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-dark mt-4">—</p>
          <span className="text-[9px] text-dark/40 font-bold block mt-1">No data available</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">Low Stock Items</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-dark mt-4">—</p>
          <span className="text-[9px] text-dark/40 font-bold block mt-1">No data available</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-cream border border-parchment p-6 shadow-lux">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">Pending Reviews</span>
            <MessageSquare className="h-5 w-5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-dark mt-4">—</p>
          <span className="text-[9px] text-dark/40 font-bold block mt-1">No data available</span>
        </div>

      </div>

      {/* Workspace Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="bg-cream border border-parchment p-6 shadow-lux lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-parchment pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-wider text-gold hover:text-dark flex items-center transition-colors">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment text-dark/50 uppercase text-[9px] font-bold">
                  <th className="py-3">Order ID</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment/40">
                <tr>
                  <td colSpan={4} className="py-6 text-center text-dark/40 font-serif italic">
                    No recent orders available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Inventory Alert Box */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
          <div className="border-b border-parchment pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark">Inventory Alerts</h2>
          </div>
          
          <div className="py-6 text-center text-dark/40 font-serif italic">
            No inventory alerts at this time
          </div>
        </div>

      </div>
    </div>
  );
}
