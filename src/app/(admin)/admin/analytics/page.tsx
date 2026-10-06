'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Award, PieChart, RefreshCw } from 'lucide-react';

interface CategorySale {
  name: string;
  amount: number;
  percentage: number;
}

interface TopProduct {
  name: string;
  categoryName: string;
  units: number;
  revenue: number;
}

interface AnalyticsData {
  grossSales: number;
  averageOrderValue: number;
  completedOrders: number;
  totalOrders: number;
  conversionRate: string;
  categorySales: CategorySale[];
  topProducts: TopProduct[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/admin/analytics');
      const contentType = res.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        if (res.status === 401) {
          window.location.href = '/secret-admin?redirect=/admin/analytics';
          return;
        }
        throw new Error(`Server returned error status (${res.status})`);
      }

      const json = await res.json();
      if (res.ok && json.success && json.analytics) {
        setData(json.analytics);
      } else {
        setError(json.error || 'Failed to fetch revenue analytics.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to analytics server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Executive Intelligence</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Analytics & Revenue Intelligence
          </h1>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="p-2 border border-parchment text-dark hover:border-gold hover:text-gold transition-colors flex items-center space-x-2 text-xs uppercase font-bold"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-900">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Gross Sales */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Sales Revenue</span>
            <DollarSign className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">
            {loading ? '...' : `₹${(data?.grossSales || 0).toLocaleString()}`}
          </p>
          <span className="text-[9px] text-dark/50 font-bold block">From completed store orders</span>
        </div>

        {/* KPI 2: AOV */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">
            {loading ? '...' : `₹${(data?.averageOrderValue || 0).toLocaleString()}`}
          </p>
          <span className="text-[9px] text-dark/50 font-bold block">Per customer transaction</span>
        </div>

        {/* KPI 3: Completed Orders */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Orders</span>
            <ShoppingBag className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">
            {loading ? '...' : (data?.completedOrders || 0)}
          </p>
          <span className="text-[9px] text-dark/50 font-bold block">Out of {data?.totalOrders || 0} total orders</span>
        </div>

        {/* KPI 4: Conversion Rate */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Order Conversion Rate</span>
            <Users className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">
            {loading ? '...' : (data?.conversionRate || '0%')}
          </p>
          <span className="text-[9px] text-dark/50 font-bold block">Patrons with purchase activity</span>
        </div>
      </div>

      {/* Revenue Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Revenue Distribution */}
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-gold" /> Sales by Category
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-dark/50 font-serif italic py-6 text-center">Loading sales breakdown...</p>
          ) : !data?.categorySales || data.categorySales.length === 0 ? (
            <p className="text-xs text-dark/50 font-serif italic py-6 text-center">No category sales recorded yet.</p>
          ) : (
            <div className="space-y-5">
              {data.categorySales.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold text-dark mb-1">
                    <span>{cat.name}</span>
                    <span>₹{cat.amount.toLocaleString()} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-parchment overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Artisanal Creations */}
        <div className="bg-cream border border-parchment p-6 shadow-lux lg:col-span-2 space-y-6">
          <div className="border-b border-parchment pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
              <Award className="h-4 w-4 mr-2 text-gold" /> Top Revenue Generating Products
            </h2>
            <span className="text-[9px] font-bold uppercase text-gold">Live Database</span>
          </div>

          {loading ? (
            <p className="text-xs text-dark/50 font-serif italic py-8 text-center">Loading top products...</p>
          ) : !data?.topProducts || data.topProducts.length === 0 ? (
            <p className="text-xs text-dark/50 font-serif italic py-8 text-center">No product sales recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold">
                    <th className="py-2">Creation</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Units Sold</th>
                    <th className="py-2 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment/40">
                  {data.topProducts.map((prod, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-serif font-bold text-dark">{prod.name}</td>
                      <td className="py-3 text-dark/60">{prod.categoryName}</td>
                      <td className="py-3 font-semibold text-dark">{prod.units} units</td>
                      <td className="py-3 text-right font-serif font-bold text-gold">₹{prod.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
