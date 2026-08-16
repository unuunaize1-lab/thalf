'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Calculator, 
  Sliders, 
  Check, 
  X, 
  AlertCircle,
  Tag,
  DollarSign,
  Package
} from 'lucide-react';

interface TierInput {
  minQuantity: number;
  maxQuantity?: number | '';
  unitPrice: number;
  isActive?: boolean;
}

const HAMPER_TYPES = [
  'Birthday Hampers',
  'Wedding Hampers',
  'Personalized Hampers',
  'Custom Chocolate Hampers',
  'Custom Gift Hampers',
  'Corporate / Bulk Hampers',
];

export default function AdminHampersPage() {
  const [hampers, setHampers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    hamperType: 'Birthday Hampers',
    pricingMode: 'FIXED_PRICE', // FIXED_PRICE | QUOTE_REQUIRED
    price: 1499,
    comparePrice: 0,
    startingPrice: 0,
    minQuantity: 1,
    maxQuantity: '',
    status: 'ACTIVE',
    featured: false,
    images: ['/images/hero-chocolate.png'],

    // Internal Cost Components
    costChocolate: 0,
    costPackaging: 0,
    costPersonalization: 0,
    costAssembly: 0,
    costOther: 0,
    costDelivery: 0,
    margin: 0,
    suggestedSellingPrice: 0,

    // Customization Flags
    allowChocolateSelection: false,
    allowPersonalizedMessage: false,
    allowCustomPackaging: false,
    allowCustomRibbon: false,
    allowCustomBranding: false,
    allowCorporateBranding: false,
  });

  const [pricingTiers, setPricingTiers] = useState<TierInput[]>([]);

  // Fetch Hampers and Categories on Mount
  const fetchHampers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hampRes, catRes] = await Promise.all([
        fetch('/api/v1/admin/hampers'),
        fetch('/api/v1/admin/categories'),
      ]);

      const hampData = await hampRes.json();
      const catData = await catRes.json();

      if (hampData.success) {
        setHampers(hampData.hampers || []);
      }
      if (catData.success) {
        setCategories(catData.categories || []);
      }
    } catch (err: any) {
      setError('Failed to load hampers management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHampers();
  }, []);

  // Internal Cost Calculation helper
  const totalInternalCost = useMemo(() => {
    return (
      Number(formData.costChocolate || 0) +
      Number(formData.costPackaging || 0) +
      Number(formData.costPersonalization || 0) +
      Number(formData.costAssembly || 0) +
      Number(formData.costOther || 0) +
      Number(formData.costDelivery || 0)
    );
  }, [
    formData.costChocolate,
    formData.costPackaging,
    formData.costPersonalization,
    formData.costAssembly,
    formData.costOther,
    formData.costDelivery,
  ]);

  const computedSuggestedSellingPrice = useMemo(() => {
    return totalInternalCost + Number(formData.margin || 0);
  }, [totalInternalCost, formData.margin]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      sku: `HMP-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      shortDescription: '',
      categoryId: categories[0]?.id || '',
      hamperType: 'Birthday Hampers',
      pricingMode: 'FIXED_PRICE',
      price: 1499,
      comparePrice: 0,
      startingPrice: 0,
      minQuantity: 1,
      maxQuantity: '',
      status: 'ACTIVE',
      featured: false,
      images: ['/images/hero-chocolate.png'],

      costChocolate: 0,
      costPackaging: 0,
      costPersonalization: 0,
      costAssembly: 0,
      costOther: 0,
      costDelivery: 0,
      margin: 0,
      suggestedSellingPrice: 0,

      allowChocolateSelection: false,
      allowPersonalizedMessage: false,
      allowCustomPackaging: false,
      allowCustomRibbon: false,
      allowCustomBranding: false,
      allowCorporateBranding: false,
    });
    setPricingTiers([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hamper: any) => {
    setEditingId(hamper.id);
    setFormData({
      name: hamper.name || '',
      slug: hamper.slug || '',
      sku: hamper.sku || '',
      description: hamper.description || '',
      shortDescription: hamper.shortDescription || '',
      categoryId: hamper.categoryId || categories[0]?.id || '',
      hamperType: hamper.hamperType || 'Birthday Hampers',
      pricingMode: hamper.pricingMode || 'FIXED_PRICE',
      price: Number(hamper.price || 0),
      comparePrice: Number(hamper.comparePrice || 0),
      startingPrice: Number(hamper.startingPrice || 0),
      minQuantity: hamper.minQuantity || 1,
      maxQuantity: hamper.maxQuantity || '',
      status: hamper.status || 'ACTIVE',
      featured: Boolean(hamper.featured),
      images: Array.isArray(hamper.images) && hamper.images.length > 0
        ? hamper.images.map((img: any) => (typeof img === 'string' ? img : img.url))
        : ['/images/hero-chocolate.png'],

      costChocolate: Number(hamper.costChocolate || 0),
      costPackaging: Number(hamper.costPackaging || 0),
      costPersonalization: Number(hamper.costPersonalization || 0),
      costAssembly: Number(hamper.costAssembly || 0),
      costOther: Number(hamper.costOther || 0),
      costDelivery: Number(hamper.costDelivery || 0),
      margin: Number(hamper.margin || 0),
      suggestedSellingPrice: Number(hamper.suggestedSellingPrice || 0),

      allowChocolateSelection: Boolean(hamper.allowChocolateSelection),
      allowPersonalizedMessage: Boolean(hamper.allowPersonalizedMessage),
      allowCustomPackaging: Boolean(hamper.allowCustomPackaging),
      allowCustomRibbon: Boolean(hamper.allowCustomRibbon),
      allowCustomBranding: Boolean(hamper.allowCustomBranding),
      allowCorporateBranding: Boolean(hamper.allowCorporateBranding),
    });

    setPricingTiers(
      Array.isArray(hamper.pricingTiers)
        ? hamper.pricingTiers.map((t: any) => ({
            minQuantity: t.minQuantity,
            maxQuantity: t.maxQuantity ?? '',
            unitPrice: Number(t.unitPrice),
            isActive: t.isActive ?? true,
          }))
        : []
    );

    setIsModalOpen(true);
  };

  const handleAddTier = () => {
    setPricingTiers((prev) => [
      ...prev,
      { minQuantity: 10, maxQuantity: 49, unitPrice: 1299, isActive: true },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setPricingTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: string, value: any) => {
    setPricingTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      ...formData,
      slug: generatedSlug,
      price: Number(formData.price || 0),
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
      startingPrice: formData.startingPrice ? Number(formData.startingPrice) : undefined,
      minQuantity: Number(formData.minQuantity || 1),
      maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : undefined,

      costChocolate: Number(formData.costChocolate || 0),
      costPackaging: Number(formData.costPackaging || 0),
      costPersonalization: Number(formData.costPersonalization || 0),
      costAssembly: Number(formData.costAssembly || 0),
      costOther: Number(formData.costOther || 0),
      costDelivery: Number(formData.costDelivery || 0),
      margin: Number(formData.margin || 0),
      suggestedSellingPrice: computedSuggestedSellingPrice,

      pricingTiers: pricingTiers.map((t) => ({
        minQuantity: Number(t.minQuantity),
        maxQuantity: t.maxQuantity !== '' && t.maxQuantity !== undefined ? Number(t.maxQuantity) : undefined,
        unitPrice: Number(t.unitPrice),
        isActive: t.isActive ?? true,
      })),
    };

    try {
      const url = editingId ? `/api/v1/admin/hampers/${editingId}` : '/api/v1/admin/hampers';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save hamper configuration.');
      }

      setIsModalOpen(false);
      fetchHampers();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving hamper.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this hamper offering?')) return;

    try {
      const res = await fetch(`/api/v1/admin/hampers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete hamper.');
      }
      fetchHampers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filtered Hampers
  const filteredHampers = useMemo(() => {
    return hampers.filter((h) => {
      const matchesSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.sku.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'ALL' || h.hamperType === typeFilter;
      const matchesMode = modeFilter === 'ALL' || h.pricingMode === modeFilter;

      return matchesSearch && matchesType && matchesMode;
    });
  }, [hampers, search, typeFilter, modeFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-parchment pb-4">
        <div>
          <h1 className="font-serif text-2xl font-black uppercase tracking-wider text-dark flex items-center">
            <Gift className="h-6 w-6 mr-3 text-gold" /> Hampers & Pricing Architecture
          </h1>
          <p className="text-xs text-dark/70 font-sans mt-1">
            Manage custom & fixed hamper offerings, cost component margins, quantity pricing tiers, and customization toggles.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2.5 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md self-start md:self-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Hamper
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 p-4 text-red-800 text-xs font-bold uppercase tracking-wider flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-cream border border-parchment p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lux">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search hampers by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Hamper Types</option>
            {HAMPER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Pricing Modes</option>
            <option value="FIXED_PRICE">Fixed Price</option>
            <option value="QUOTE_REQUIRED">Quote Required</option>
          </select>
        </div>
      </div>

      {/* Hampers Data Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
            Loading Hamper Offerings...
          </div>
        ) : filteredHampers.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
            No hamper offerings found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment bg-parchment/30 text-[10px] uppercase font-bold tracking-wider text-dark/70">
                  <th className="p-4">Hamper Details</th>
                  <th className="p-4">Type / Category</th>
                  <th className="p-4">Pricing Mode</th>
                  <th className="p-4">Customer Price</th>
                  <th className="p-4">Cost / Margin Breakdown</th>
                  <th className="p-4">Quantity Tiers</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment">
                {filteredHampers.map((hamper) => {
                  const internalCost =
                    Number(hamper.costChocolate || 0) +
                    Number(hamper.costPackaging || 0) +
                    Number(hamper.costPersonalization || 0) +
                    Number(hamper.costAssembly || 0) +
                    Number(hamper.costOther || 0) +
                    Number(hamper.costDelivery || 0);

                  return (
                    <tr key={hamper.id} className="hover:bg-parchment/15 transition-colors">
                      <td className="p-4 font-semibold">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-dark/10 border border-parchment flex items-center justify-center font-serif text-dark font-black">
                            🎁
                          </div>
                          <div>
                            <div className="font-bold text-dark font-serif text-sm">{hamper.name}</div>
                            <div className="text-[10px] text-dark/50 tracking-wider">SKU: {hamper.sku}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-parchment/40 text-dark text-[10px] font-bold uppercase tracking-wider border border-parchment">
                          {hamper.hamperType || 'General Hamper'}
                        </span>
                      </td>

                      <td className="p-4">
                        {hamper.pricingMode === 'QUOTE_REQUIRED' ? (
                          <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                            Quote Required
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                            Fixed Price
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-dark">
                        {hamper.pricingMode === 'QUOTE_REQUIRED' ? (
                          hamper.startingPrice > 0 ? (
                            <span className="text-amber-800">Starting ₹{Number(hamper.startingPrice).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-dark/60 font-sans italic text-[11px]">Request Quote</span>
                          )
                        ) : (
                          <span>₹{Number(hamper.price).toLocaleString('en-IN')}</span>
                        )}
                      </td>

                      <td className="p-4 text-[10px] space-y-0.5">
                        <div className="text-dark/70">Cost: ₹{internalCost.toLocaleString('en-IN')}</div>
                        <div className="text-emerald-800 font-semibold">Margin: ₹{Number(hamper.margin || 0).toLocaleString('en-IN')}</div>
                      </td>

                      <td className="p-4">
                        <span className="text-[11px] font-semibold text-dark/80">
                          {Array.isArray(hamper.pricingTiers) ? hamper.pricingTiers.length : 0} Tiers Configured
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(hamper)}
                          className="p-1.5 bg-cream border border-parchment hover:border-gold text-dark transition-colors"
                          title="Edit Hamper Configuration"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hamper.id)}
                          className="p-1.5 bg-cream border border-parchment hover:border-red-500 text-red-600 transition-colors"
                          title="Archive Hamper"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT HAMPER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-cream border border-parchment w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-parchment pb-4">
              <h2 className="font-serif text-lg font-black uppercase tracking-wider text-dark flex items-center">
                <Gift className="h-5 w-5 mr-2 text-gold" />
                {editingId ? 'Edit Hamper Offering & Pricing' : 'Configure New Hamper Offering'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark/50 hover:text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: Basic Information */}
              <div className="space-y-4 bg-parchment/20 p-4 border border-parchment">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center">
                  <Package className="h-4 w-4 mr-1.5" /> 1. Hamper Identification & Category
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Hamper Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Hamper Type / Occasion Classification *
                    </label>
                    <select
                      value={formData.hamperType}
                      onChange={(e) => setFormData({ ...formData, hamperType: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                    >
                      {HAMPER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Product Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Hamper Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Pricing Mode & Customer Rates */}
              <div className="space-y-4 bg-parchment/20 p-4 border border-parchment">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center">
                  <Tag className="h-4 w-4 mr-1.5" /> 2. Customer Pricing Mode & Quantities
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Pricing Mode Selection *
                    </label>
                    <select
                      value={formData.pricingMode}
                      onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                    >
                      <option value="FIXED_PRICE">A. FIXED PRICE (Instant Purchase)</option>
                      <option value="QUOTE_REQUIRED">B. QUOTE REQUIRED (Enquiry Form)</option>
                    </select>
                  </div>

                  {formData.pricingMode === 'FIXED_PRICE' ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                        Fixed Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono font-bold focus:outline-none focus:border-gold"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                        Optional {`"Starting From"`} Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Leave 0 for Quote Only"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono font-bold focus:outline-none focus:border-gold"
                      />
                      <p className="text-[9px] text-dark/60 mt-1">
                        If set, customer sees {`"Starting from ₹X"`} instead of fake price.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono font-bold focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      Maximum Order Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Unlimited if blank"
                      value={formData.maxQuantity}
                      onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Internal Cost Components Calculator (Admin Only) */}
              <div className="space-y-4 bg-amber-50/50 p-4 border border-amber-200">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
                    <Calculator className="h-4 w-4 mr-1.5 text-amber-700" /> 3. Internal Cost Components Calculator (CONFIDENTIAL - Admin Only)
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5">
                    Never Exposed To Customers
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Chocolate Cost (₹)</label>
                    <input
                      type="number"
                      value={formData.costChocolate}
                      onChange={(e) => setFormData({ ...formData, costChocolate: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Packaging Cost (₹)</label>
                    <input
                      type="number"
                      value={formData.costPackaging}
                      onChange={(e) => setFormData({ ...formData, costPackaging: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Personalization (₹)</label>
                    <input
                      type="number"
                      value={formData.costPersonalization}
                      onChange={(e) => setFormData({ ...formData, costPersonalization: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Assembly Cost (₹)</label>
                    <input
                      type="number"
                      value={formData.costAssembly}
                      onChange={(e) => setFormData({ ...formData, costAssembly: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Other Cost (₹)</label>
                    <input
                      type="number"
                      value={formData.costOther}
                      onChange={(e) => setFormData({ ...formData, costOther: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Delivery Cost (₹)</label>
                    <input
                      type="number"
                      value={formData.costDelivery}
                      onChange={(e) => setFormData({ ...formData, costDelivery: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">Target Margin (₹)</label>
                    <input
                      type="number"
                      value={formData.margin}
                      onChange={(e) => setFormData({ ...formData, margin: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-cream border border-amber-400 text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="bg-amber-100 p-2 border border-amber-300 flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-amber-900">Total Internal Cost</span>
                    <span className="font-mono font-bold text-sm text-dark">₹{totalInternalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-200/60 border border-amber-300 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-950">
                    Suggested Selling Price (Total Cost + Margin):
                  </span>
                  <span className="font-mono font-black text-base text-amber-950">
                    ₹{computedSuggestedSellingPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* SECTION 4: Quantity Pricing Tiers */}
              <div className="space-y-4 bg-parchment/20 p-4 border border-parchment">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center">
                    <Layers className="h-4 w-4 mr-1.5" /> 4. Quantity Pricing Tiers
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center px-3 py-1 bg-dark text-cream text-[10px] font-bold uppercase tracking-wider hover:bg-dark/80"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Tier
                  </button>
                </div>

                {pricingTiers.length === 0 ? (
                  <p className="text-[11px] text-dark/50 italic">No volume quantity tiers added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-cream p-2 border border-parchment">
                        <div className="w-24">
                          <label className="block text-[9px] font-bold uppercase text-dark/60">Min Qty</label>
                          <input
                            type="number"
                            value={tier.minQuantity}
                            onChange={(e) => handleTierChange(idx, 'minQuantity', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-cream border border-parchment text-xs font-mono"
                          />
                        </div>

                        <div className="w-24">
                          <label className="block text-[9px] font-bold uppercase text-dark/60">Max Qty</label>
                          <input
                            type="number"
                            placeholder="Unlimited"
                            value={tier.maxQuantity}
                            onChange={(e) => handleTierChange(idx, 'maxQuantity', e.target.value)}
                            className="w-full px-2 py-1 bg-cream border border-parchment text-xs font-mono"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[9px] font-bold uppercase text-dark/60">Unit Price (₹)</label>
                          <input
                            type="number"
                            value={tier.unitPrice}
                            onChange={(e) => handleTierChange(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-cream border border-parchment text-xs font-mono font-bold text-emerald-900"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="mt-4 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: Customization Option Toggles */}
              <div className="space-y-3 bg-parchment/20 p-4 border border-parchment">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center">
                  <Sliders className="h-4 w-4 mr-1.5" /> 5. Customer Customization Toggles
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowChocolateSelection}
                      onChange={(e) => setFormData({ ...formData, allowChocolateSelection: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Chocolate Selection</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowPersonalizedMessage}
                      onChange={(e) => setFormData({ ...formData, allowPersonalizedMessage: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Personalized Message</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowCustomPackaging}
                      onChange={(e) => setFormData({ ...formData, allowCustomPackaging: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Custom Packaging</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowCustomRibbon}
                      onChange={(e) => setFormData({ ...formData, allowCustomRibbon: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Custom Ribbon</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowCustomBranding}
                      onChange={(e) => setFormData({ ...formData, allowCustomBranding: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Custom Branding</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-cream p-2 border border-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowCorporateBranding}
                      onChange={(e) => setFormData({ ...formData, allowCorporateBranding: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-semibold text-dark">Corporate Branding</span>
                  </label>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="flex justify-end space-x-3 border-t border-parchment pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-cream border border-parchment text-dark text-xs font-bold uppercase tracking-wider hover:bg-parchment/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Hamper' : 'Publish Hamper'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
