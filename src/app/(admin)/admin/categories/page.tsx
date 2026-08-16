'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Search, X, AlertTriangle, Calendar, Image as ImageIcon, Check } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  productCount: number;
  productIds?: string[];
  type: 'category' | 'collection';
}

interface ProductSimple {
  id: string;
  name: string;
  sku: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductSimple[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    bannerImage: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    productIds: [] as string[],
    type: 'category' as 'category' | 'collection',
  });

  const loadTaxonomy = useCallback(async () => {
    try {
      const [catRes, colRes, prodRes] = await Promise.all([
        fetch('/api/v1/admin/categories'),
        fetch('/api/v1/admin/collections'),
        fetch('/api/v1/admin/products?take=100'),
      ]);

      const catData = catRes.ok ? await catRes.json().catch(() => ({})) : {};
      const colData = colRes.ok ? await colRes.json().catch(() => ({})) : {};
      const prodData = prodRes.ok ? await prodRes.json().catch(() => ({})) : {};

      const list: CategoryItem[] = [];

      if (catData.success && Array.isArray(catData.categories)) {
        catData.categories.forEach((c: any) => {
          list.push({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            productCount: c.productCount || 0,
            type: 'category',
          });
        });
      }

      if (colData.success && Array.isArray(colData.collections)) {
        colData.collections.forEach((col: any) => {
          list.push({
            id: col.id,
            name: col.name,
            slug: col.slug,
            description: col.description || '',
            bannerImage: col.bannerImage || '',
            startDate: col.startDate ? new Date(col.startDate).toISOString().slice(0, 16) : '',
            endDate: col.endDate ? new Date(col.endDate).toISOString().slice(0, 16) : '',
            isActive: col.isActive !== undefined ? col.isActive : true,
            isFeatured: col.isFeatured || false,
            displayOrder: col.displayOrder || 0,
            productCount: col.productCount || 0,
            productIds: Array.isArray(col.products) ? col.products.map((p: any) => p.id) : [],
            type: 'collection',
          });
        });
      }

      if (prodData.success && Array.isArray(prodData.products)) {
        setAvailableProducts(prodData.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
        })));
      }

      setCategories(list);
    } catch (err) {
      console.error('[AdminCategoriesPage] Error loading taxonomy:', err);
      setServerError('Failed to load categories & collections from server.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadTaxonomy();
      }
    };
    init();
    return () => { isMounted = false; };
  }, [loadTaxonomy]);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setServerError(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      bannerImage: '',
      startDate: '',
      endDate: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
      productIds: [],
      type: 'collection',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setServerError(null);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      bannerImage: cat.bannerImage || '',
      startDate: cat.startDate || '',
      endDate: cat.endDate || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      isFeatured: cat.isFeatured || false,
      displayOrder: cat.displayOrder || 0,
      productIds: cat.productIds || [],
      type: cat.type,
    });
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => {
      const exists = prev.productIds.includes(productId);
      if (exists) {
        return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
      } else {
        return { ...prev, productIds: [...prev.productIds, productId] };
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!formData.name) return;

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const endpoint = formData.type === 'category' ? '/api/v1/admin/categories' : '/api/v1/admin/collections';

    const payload: any = {
      name: formData.name,
      slug,
      description: formData.description,
    };

    if (formData.type === 'collection') {
      payload.bannerImage = formData.bannerImage || null;
      payload.startDate = formData.startDate ? new Date(formData.startDate).toISOString() : null;
      payload.endDate = formData.endDate ? new Date(formData.endDate).toISOString() : null;
      payload.isActive = formData.isActive;
      payload.isFeatured = formData.isFeatured;
      payload.displayOrder = Number(formData.displayOrder || 0);
      payload.productIds = formData.productIds;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingCategory) {
        payload.id = editingCategory.id;
        res = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setServerError(data.error || 'Failed to save item.');
        return;
      }

      setIsModalOpen(false);
      await loadTaxonomy();
    } catch (err: unknown) {
      const error = err as Error;
      setServerError(error.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat: CategoryItem) => {
    setCategoryToDelete(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setServerError(null);
    const endpoint = categoryToDelete.type === 'category'
      ? `/api/v1/admin/categories?id=${categoryToDelete.id}`
      : `/api/v1/admin/collections?id=${categoryToDelete.id}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadTaxonomy();
      } else {
        setServerError(`Delete failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setServerError(`Delete error: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  const getSeasonalStatus = (cat: CategoryItem) => {
    if (cat.type !== 'collection') return null;
    if (cat.isActive === false) {
      return { label: 'Disabled', color: 'bg-zinc-200 text-zinc-700 border-zinc-300' };
    }
    const now = new Date();
    const start = cat.startDate ? new Date(cat.startDate) : null;
    const end = cat.endDate ? new Date(cat.endDate) : null;

    if (start && now < start) {
      return { label: `Upcoming (Starts ${start.toLocaleDateString()})`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (end && now > end) {
      return { label: `Expired (Ended ${end.toLocaleDateString()})`, color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    return { label: 'Active Period', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Taxonomy & Festival Specials</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Categories & Collections
          </h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-5 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Category / Festival Collection
        </button>
      </div>

      {!isModalOpen && serverError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{serverError}</span>
          </div>
          <button onClick={() => setServerError(null)} className="text-red-800 hover:text-red-900"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search categories & festival collections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-[10px] font-bold uppercase text-dark/60">
          Showing {filteredCategories.length} items
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((c) => {
          const seasonStatus = getSeasonalStatus(c);
          return (
            <div key={c.id} className="bg-cream border border-parchment p-6 shadow-lux flex flex-col justify-between relative group">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                    c.type === 'collection' ? 'bg-gold-light text-dark border-gold' : 'bg-parchment text-dark/80 border-parchment'
                  }`}>
                    {c.type === 'collection' ? 'Festival Collection' : 'Standard Category'}
                  </span>
                  {seasonStatus && (
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${seasonStatus.color}`}>
                      {seasonStatus.label}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-dark">{c.name}</h3>
                  <p className="text-[10px] font-mono text-dark/50 mt-0.5">/{c.slug}</p>
                </div>

                <p className="text-xs text-dark/70 line-clamp-2 font-sans">{c.description || 'No description provided.'}</p>

                {c.type === 'collection' && (c.startDate || c.endDate) && (
                  <div className="text-[10px] font-mono text-dark/70 bg-parchment/30 p-2 border border-parchment/60 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gold" />
                      <span>Start: {c.startDate ? new Date(c.startDate).toLocaleString() : 'Immediate'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gold" />
                      <span>End: {c.endDate ? new Date(c.endDate).toLocaleString() : 'No expiry'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-parchment/40 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-dark/60">
                  {c.productCount} Linked Products
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 text-dark/60 hover:text-dark hover:bg-parchment/60 transition-colors"
                    title="Edit Collection"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border border-parchment w-full max-w-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Festival Specials Config</span>
              <h2 className="text-xl font-serif font-black uppercase text-dark">
                {editingCategory ? `Edit ${formData.type === 'collection' ? 'Festival Collection' : 'Category'}` : `Create ${formData.type === 'collection' ? 'Festival Collection' : 'Category'}`}
              </h2>
            </div>

            {serverError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Diwali Artisanal Special 2026"
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. diwali-artisanal-special-2026"
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Taxonomy Type</label>
                <select
                  disabled={!!editingCategory}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold disabled:opacity-50"
                >
                  <option value="collection">Curated Festival Collection</option>
                  <option value="category">Standard Category</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for customer catalog page header..."
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {formData.type === 'collection' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                      <ImageIcon className="inline-block h-3 w-3 mr-1 text-gold" />
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.bannerImage}
                      onChange={e => setFormData({ ...formData, bannerImage: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Start Date & Time (Seasonal Visibility)</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                      />
                      <span className="text-[9px] text-dark/50 mt-0.5 block">Leave empty for immediate launch</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">End Date & Time (Auto-Hide)</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                      />
                      <span className="text-[9px] text-dark/50 mt-0.5 block">Leave empty for perpetual collection</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-parchment/60">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        className="accent-gold h-4 w-4"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-dark">Active Status</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="accent-gold h-4 w-4"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-dark">Featured Collection</span>
                    </label>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Display Order</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.displayOrder}
                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-parchment">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-2">
                      Link Festival Products ({formData.productIds.length} Selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-parchment p-2 space-y-1 text-xs bg-parchment/20">
                      {availableProducts.length === 0 ? (
                        <p className="text-[11px] text-dark/50 italic p-2">No products found in store inventory.</p>
                      ) : (
                        availableProducts.map(prod => {
                          const isSelected = formData.productIds.includes(prod.id);
                          return (
                            <div
                              key={prod.id}
                              onClick={() => toggleProductSelection(prod.id)}
                              className={`p-2 flex items-center justify-between cursor-pointer border transition-colors ${
                                isSelected ? 'bg-gold/20 border-gold text-dark' : 'bg-cream border-parchment text-dark/80 hover:bg-parchment/40'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 border flex items-center justify-center ${isSelected ? 'bg-gold border-gold text-dark' : 'border-dark/40'}`}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <span className="font-medium text-xs">{prod.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-dark/50">{prod.sku}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-parchment">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!categoryToDelete}
        title={`Delete ${categoryToDelete?.type === 'category' ? 'Category' : 'Collection'}`}
        description={`Are you sure you want to delete '${categoryToDelete?.name}'?\nThis action cannot be undone.`}
        confirmLabel="Delete"
        isProcessing={isDeleting}
        isDestructive={true}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
