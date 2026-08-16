'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, RefreshCw, CheckCircle2, ArrowUpRight, Plus, Minus, Search } from 'lucide-react';

interface InventoryRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  stockQuantity: number;
  reservedStock: number;
  reorderLevel: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAdminInventory() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/products?limit=50&status=ALL');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const mapped: InventoryRecord[] = data.products.map((p: any) => ({
            id: `inv-${p.id}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            category: typeof p.category === 'object' ? p.category?.name || 'Chocolate' : p.category,
            stockQuantity: p.inventory?.stockQuantity ?? 50,
            reservedStock: p.inventory?.reservedStock ?? 0,
            reorderLevel: p.inventory?.reorderPoint ?? 5,
          }));
          setInventory(mapped);
        }
      } catch (err) {
        setPageError('Failed to load admin inventory from server.');
      } finally {
        setLoading(false);
      }
    }
    loadAdminInventory();
  }, []);

  const filteredInventory = inventory.filter(i =>
    i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter(i => (i.stockQuantity - i.reservedStock) <= i.reorderLevel);

  const handleAdjustStock = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.stockQuantity + delta);
        return { ...item, stockQuantity: newQty };
      }
      return item;
    }));
  };

  const handleUpdateReorderLevel = (id: string, newLevel: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, reorderLevel: newLevel } : item));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Supply Chain</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Inventory Control
        </h1>
      </div>

      {pageError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{pageError}</span>
          </div>
          <button onClick={() => setPageError(null)} className="text-red-800 hover:text-red-900"><CheckCircle2 className="h-4 w-4" /></button>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 shadow-lux flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase text-red-900 tracking-wider">
              Stock Reorder Alert ({lowStockItems.length} Products Breached Threshold)
            </h3>
            <p className="text-xs text-red-700 mt-0.5">
              The following creations require batch replenishment to prevent stockouts:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.map(item => (
                <span key={item.id} className="text-[10px] font-bold bg-white text-red-800 border border-red-300 px-2 py-1">
                  {item.productName} (Available: {item.stockQuantity - item.reservedStock} units)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Total SKU Inventory</span>
          <p className="text-2xl font-serif font-bold text-dark mt-2">
            {inventory.reduce((acc, i) => acc + i.stockQuantity, 0)} Units
          </p>
        </div>

        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Active Reserved Stock</span>
          <p className="text-2xl font-serif font-bold text-gold mt-2">
            {inventory.reduce((acc, i) => acc + i.reservedStock, 0)} Reserved
          </p>
        </div>

        <div className="bg-cream border border-parchment p-5 shadow-lux">
          <span className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Low Stock Triggers</span>
          <p className="text-2xl font-serif font-bold text-red-600 mt-2">
            {lowStockItems.length} Alerts
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search inventory by title or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4">Creation Title / SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Total Stock</th>
                <th className="py-4 px-4">Reserved</th>
                <th className="py-4 px-4">Net Available</th>
                <th className="py-4 px-4">Reorder Threshold</th>
                <th className="py-4 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {filteredInventory.map(item => {
                const netAvailable = item.stockQuantity - item.reservedStock;
                const isLow = netAvailable <= item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-parchment/20 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-serif font-bold text-dark text-sm">{item.productName}</p>
                      <span className="font-mono text-[10px] text-dark/50">{item.sku}</span>
                    </td>

                    <td className="py-4 px-4 text-dark/70 font-semibold">{item.category}</td>

                    <td className="py-4 px-4 font-serif font-bold text-dark text-sm">{item.stockQuantity}</td>

                    <td className="py-4 px-4 font-bold text-gold">{item.reservedStock}</td>

                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isLow ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800'
                      }`}>
                        {netAvailable} Available
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min={1}
                        value={item.reorderLevel}
                        onChange={e => handleUpdateReorderLevel(item.id, parseInt(e.target.value) || 5)}
                        className="w-16 p-1 bg-cream border border-parchment text-xs font-mono text-center focus:border-gold"
                      />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleAdjustStock(item.id, -1)}
                          className="p-1 border border-parchment hover:bg-parchment text-dark/70 transition-colors"
                          title="Reduce 1 unit"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(item.id, +5)}
                          className="px-2 py-1 bg-gold text-dark text-[10px] font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-sm"
                          title="Add 5 units"
                        >
                          +5 Batch
                        </button>
                        <button
                          onClick={() => handleAdjustStock(item.id, +10)}
                          className="px-2 py-1 bg-dark text-cream text-[10px] font-bold uppercase tracking-wider hover:bg-cacao transition-colors shadow-sm"
                          title="Add 10 units"
                        >
                          +10 Batch
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
