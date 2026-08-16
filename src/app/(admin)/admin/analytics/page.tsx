'use client';

import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Award, PieChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Executive Intelligence</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Analytics & Revenue Intelligence
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Sales Revenue</span>
            <DollarSign className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">₹4,85,200</p>
          <div className="flex items-center text-xs font-bold text-green-700">
            <ArrowUpRight className="h-4 w-4 mr-1" /> +18.4% vs last month
          </div>
        </div>

        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">₹3,240</p>
          <div className="flex items-center text-xs font-bold text-green-700">
            <ArrowUpRight className="h-4 w-4 mr-1" /> +6.2% vs last month
          </div>
        </div>

        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Orders</span>
            <ShoppingBag className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">150</p>
          <div className="flex items-center text-xs font-bold text-green-700">
            <ArrowUpRight className="h-4 w-4 mr-1" /> +12 orders vs last month
          </div>
        </div>

        <div className="bg-cream border border-parchment p-6 shadow-lux space-y-3">
          <div className="flex items-center justify-between text-dark/60">
            <span className="text-[10px] font-bold uppercase tracking-wider">Store Conversion Rate</span>
            <Users className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-serif font-bold text-dark">3.85%</p>
          <div className="flex items-center text-xs font-bold text-green-700">
            <ArrowUpRight className="h-4 w-4 mr-1" /> +0.4% industry baseline
          </div>
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

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-dark mb-1">
                <span>Dark Chocolate Bars</span>
                <span>₹2,10,000 (43%)</span>
              </div>
              <div className="w-full h-2 bg-parchment overflow-hidden">
                <div className="h-full bg-gold w-[43%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-dark mb-1">
                <span>Truffles & Pralines</span>
                <span>₹1,45,000 (30%)</span>
              </div>
              <div className="w-full h-2 bg-parchment overflow-hidden">
                <div className="h-full bg-cacao w-[30%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-dark mb-1">
                <span>Assortments & Collections</span>
                <span>₹98,000 (20%)</span>
              </div>
              <div className="w-full h-2 bg-parchment overflow-hidden">
                <div className="h-full bg-gold-light border border-gold w-[20%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-dark mb-1">
                <span>Sugar-Free & Vegan</span>
                <span>₹32,200 (7%)</span>
              </div>
              <div className="w-full h-2 bg-parchment overflow-hidden">
                <div className="h-full bg-dark/40 w-[7%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Artisanal Creations */}
        <div className="bg-cream border border-parchment p-6 shadow-lux lg:col-span-2 space-y-6">
          <div className="border-b border-parchment pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
              <Award className="h-4 w-4 mr-2 text-gold" /> Top Revenue Generating Products
            </h2>
            <span className="text-[9px] font-bold uppercase text-gold">This Quarter</span>
          </div>

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
              <tr>
                <td className="py-3 font-serif font-bold text-dark">Grand Presentation Selection</td>
                <td className="py-3 text-dark/60">Assortments & Collections</td>
                <td className="py-3 font-semibold text-dark">28 units</td>
                <td className="py-3 text-right font-serif font-bold text-gold">₹1,91,800</td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-dark">Artisan Truffles Selection</td>
                <td className="py-3 text-dark/60">Truffles & Pralines</td>
                <td className="py-3 font-semibold text-dark">42 units</td>
                <td className="py-3 text-right font-serif font-bold text-gold">₹1,44,900</td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-dark">Signature Dark Collection</td>
                <td className="py-3 text-dark/60">Dark Chocolate</td>
                <td className="py-3 font-semibold text-dark">54 units</td>
                <td className="py-3 text-right font-serif font-bold text-gold">₹89,100</td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-dark">Obsidian 85% Dark Bar</td>
                <td className="py-3 text-dark/60">Dark Chocolate</td>
                <td className="py-3 font-semibold text-dark">34 units</td>
                <td className="py-3 text-right font-serif font-bold text-gold">₹59,500</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
