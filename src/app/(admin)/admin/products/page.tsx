'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Star, 
  X,
  AlertTriangle,
  Package,
  FileText,
  UtensilsCrossed,
  Sparkles,
  Check
} from 'lucide-react';
import { ProductMediaGallery, GalleryItem } from '@/components/admin/product-media-gallery';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  category: string;
  collectionId?: string;
  collection?: string;
  price: number;
  compareAtPrice?: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  cacaoPercentage?: number;
  shortDescription?: string;
  description?: string;
  weight?: string;
  ingredients?: string;
  allergenInfo?: string;
  flavourProfile?: string;
  storageInstructions?: string;
  shelfLife?: string;
  stock: number;
  featured: boolean;
  image: string;
  galleryImages?: GalleryItem[];
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [productToArchive, setProductToArchive] = useState<ProductItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setServerError(null);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/v1/products?limit=100&status=ALL'),
        fetch('/api/v1/admin/categories'),
      ]);

      const prodData = prodRes.ok ? await prodRes.json().catch(() => ({})) : {};
      const catData = catRes.ok ? await catRes.json().catch(() => ({})) : {};

      if (catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories);
      }

      if (prodData.success && Array.isArray(prodData.products)) {
        const mapped: ProductItem[] = prodData.products.map((p: any) => {
          const rawImages = Array.isArray(p.images) ? p.images : [];
          const galleryList: GalleryItem[] = rawImages.map((img: any, idx: number) => ({
            id: typeof img === 'object' ? img.id || `img-${idx}` : `img-${idx}`,
            url: typeof img === 'object' ? img.url : img,
            publicId: typeof img === 'object' ? img.publicId : undefined,
            alt: typeof img === 'object' ? img.alt : p.name,
            isDefault: typeof img === 'object' ? !!img.isDefault : idx === 0,
            order: typeof img === 'object' ? img.order ?? idx : idx,
          }));

          const primaryImg = galleryList.find(img => img.isDefault)?.url || galleryList[0]?.url || '/images/hero-chocolate.png';

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            categoryId: p.categoryId,
            category: typeof p.category === 'object' ? p.category?.name || 'Chocolate' : p.category,
            collectionId: p.collectionId,
            collection: typeof p.collection === 'object' ? p.collection?.name : undefined,
            price: Number(p.price),
            compareAtPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
            status: p.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
            cacaoPercentage: p.cacaoPercentage,
            shortDescription: p.shortDescription,
            description: p.description,
            weight: p.weight,
            ingredients: p.ingredients,
            allergenInfo: p.allergenInfo,
            flavourProfile: p.flavourProfile,
            storageInstructions: p.storageInstructions,
            shelfLife: p.shelfLife,
            stock: p.inventory ? (p.inventory.stockQuantity - (p.inventory.reservedStock || 0)) : 0,
            featured: !!p.featured,
            image: primaryImg,
            galleryImages: galleryList,
          };
        });
        setProducts(mapped);
      }
    } catch (err: any) {
      setServerError('Failed to load admin products from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    price: '',
    compareAtPrice: '',
    stock: '25',
    shortDescription: '',
    description: '',
    weight: '100g',
    ingredients: '',
    allergenInfo: '',
    storageInstructions: 'Store in a cool, dry place between 15-18°C.',
    shelfLife: '6 Months',
    status: 'ACTIVE' as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
    featured: false,
    images: [] as GalleryItem[],
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setServerError(null);
    const defaultCatId = categories[0]?.id || '';
    setFormData({
      name: '',
      slug: '',
      sku: `THF-BAR-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: defaultCatId,
      price: '1850',
      compareAtPrice: '2100',
      stock: '25',
      shortDescription: '',
      description: '',
      weight: '100g',
      ingredients: '',
      allergenInfo: '',
      storageInstructions: 'Store in a cool, dry place between 15-18°C.',
      shelfLife: '6 Months',
      status: 'ACTIVE',
      featured: false,
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setServerError(null);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      stock: product.stock.toString(),
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      weight: product.weight || '100g',
      ingredients: product.ingredients || '',
      allergenInfo: product.allergenInfo || '',
      storageInstructions: product.storageInstructions || 'Store in a cool, dry place between 15-18°C.',
      shelfLife: product.shelfLife || '6 Months',
      status: product.status,
      featured: product.featured,
      images: product.galleryImages || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const catIdToUse = formData.categoryId || categories[0]?.id;

    if (!catIdToUse) {
      setServerError('Category is required. Please select or create a Category first.');
      return;
    }

    if (!formData.name.trim()) {
      setServerError('Product name is required.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setServerError('Selling price must be a valid positive number.');
      return;
    }

    const compareNum = formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined;
    if (compareNum !== undefined && compareNum <= priceNum) {
      setServerError('Compare Price must be higher than Selling Price.');
      return;
    }

    const generatedSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Payload preserves all existing optional fields from editingProduct if unedited
    const payload = {
      name: formData.name,
      sku: formData.sku,
      slug: generatedSlug,
      categoryId: catIdToUse,
      collectionId: editingProduct?.collectionId || undefined,
      shortDescription: formData.shortDescription || undefined,
      description: formData.description || formData.name,
      price: priceNum,
      comparePrice: compareNum,
      weight: formData.weight || undefined,
      ingredients: formData.ingredients || undefined,
      allergenInfo: formData.allergenInfo || undefined,
      flavourProfile: editingProduct?.flavourProfile || undefined,
      storageInstructions: formData.storageInstructions || undefined,
      shelfLife: formData.shelfLife || undefined,
      cacaoPercentage: editingProduct?.cacaoPercentage || undefined,
      initialStock: parseInt(formData.stock) || 0,
      status: formData.status,
      featured: formData.featured,
      images: formData.images.map((img, idx) => ({
        url: img.url,
        alt: img.alt || formData.name,
        isDefault: img.isDefault,
        order: img.order ?? idx,
      })),
    };

    try {
      setSubmitting(true);
      let res;
      if (editingProduct) {
        res = await fetch('/api/v1/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch('/api/v1/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setServerError(data.error || 'Failed to save product.');
        return;
      }

      setIsModalOpen(false);
      await fetchAdminData();
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveClick = (product: ProductItem) => {
    setProductToArchive(product);
  };

  const confirmArchiveProduct = async () => {
    if (!productToArchive) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/v1/admin/products?id=${productToArchive.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchAdminData();
      } else {
        setServerError(`Archive failed: ${data.error}`);
      }
    } catch (err: any) {
      setServerError(`Archive error: ${err.message}`);
    } finally {
      setIsArchiving(false);
      setProductToArchive(null);
    }
  };

  const toggleFeatured = async (product: ProductItem) => {
    try {
      const res = await fetch('/api/v1/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, featured: !product.featured }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdminData();
      } else {
        setServerError(`Failed to toggle featured status: ${data.error}`);
      }
    } catch (err) {
      setServerError('Failed to toggle featured status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Catalog Management</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">Products Catalog</h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-5 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
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

      {/* Filters Bar */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search by product name, SKU or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-dark/40" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-cream border border-parchment text-xs font-semibold uppercase tracking-wider text-dark focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-cream border border-parchment text-xs font-semibold uppercase tracking-wider text-dark focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Simplified Product Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4 w-16 text-center">Image</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark/40 font-sans text-xs">
                    Loading products catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark/40 font-sans text-xs">
                    No products match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-parchment/20 transition-colors">
                    {/* IMAGE */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-10 h-10 relative bg-dark/5 border border-parchment overflow-hidden mx-auto">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>

                    {/* PRODUCT */}
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-dark text-sm leading-tight">{p.name}</div>
                      <div className="text-[10px] text-dark/50 font-mono mt-0.5">SKU: {p.sku}</div>
                    </td>

                    {/* CATEGORY */}
                    <td className="py-3 px-4 font-sans font-medium text-dark/80">
                      {p.category}
                    </td>

                    {/* PRICE */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-gold">₹{p.price.toLocaleString('en-IN')}</div>
                      {p.compareAtPrice && (
                        <div className="text-[10px] text-dark/40 line-through">
                          ₹{p.compareAtPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="py-3 px-4">
                      <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-dark'}`}>
                        {p.stock} units
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider ${
                        p.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : p.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-zinc-200 text-zinc-700 border border-zinc-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* FEATURED */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`p-1.5 rounded transition-colors ${
                          p.featured ? 'text-gold hover:text-gold/80' : 'text-dark/20 hover:text-dark/40'
                        }`}
                        title={p.featured ? 'Featured on storefront' : 'Not featured'}
                      >
                        <Star className={`h-4 w-4 ${p.featured ? 'fill-gold' : ''}`} />
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-dark/60 hover:text-dark hover:bg-parchment/60 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveClick(p)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Archive Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified 4-Section Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border border-parchment w-full max-w-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Product Management</span>
              <h2 className="text-2xl font-serif font-black uppercase text-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>

            {serverError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-8">
              
              {/* SECTION 1 — PRODUCT */}
              <div className="bg-parchment/20 border border-parchment p-5 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center border-b border-parchment pb-2">
                  <Package className="h-4 w-4 mr-2 text-gold" /> SECTION 1 — PRODUCT
                </h3>

                {/* Media Gallery */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-dark/70">Product Images</label>
                  <ProductMediaGallery
                    productId={editingProduct?.id || ''}
                    images={formData.images}
                    onChange={(updated) => setFormData((prev) => ({ ...prev, images: updated }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Truffle Selection"
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Compare Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      placeholder="Optional original price"
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Initial Stock Units *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — DESCRIPTION */}
              <div className="bg-parchment/20 border border-parchment p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center border-b border-parchment pb-2">
                  <FileText className="h-4 w-4 mr-2 text-gold" /> SECTION 2 — DESCRIPTION
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief tagline for product cards..."
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Product Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed artisanal description..."
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              {/* SECTION 3 — FOOD INFORMATION */}
              <div className="bg-parchment/20 border border-parchment p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center border-b border-parchment pb-2">
                  <UtensilsCrossed className="h-4 w-4 mr-2 text-gold" /> SECTION 3 — FOOD INFORMATION
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 100g or 250g"
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Storage Instructions</label>
                    <input
                      type="text"
                      value={formData.storageInstructions}
                      onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                      placeholder="e.g. Store between 15-18°C"
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Shelf Life</label>
                    <input
                      type="text"
                      value={formData.shelfLife}
                      onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                      placeholder="e.g. 6 Months"
                      className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Ingredients</label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="e.g. Cacao mass, organic cane sugar, cocoa butter, roasted almonds"
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">Allergen Information</label>
                  <input
                    type="text"
                    value={formData.allergenInfo}
                    onChange={(e) => setFormData({ ...formData, allergenInfo: e.target.value })}
                    placeholder="e.g. Contains Tree Nuts (Almonds), Milk Solids. Processed in a facility handling soy."
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* SECTION 4 — PUBLISH */}
              <div className="bg-parchment/20 border border-parchment p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center border-b border-parchment pb-2">
                  <Sparkles className="h-4 w-4 mr-2 text-gold" /> SECTION 4 — PUBLISH
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Status Options */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-2">Publish Status</label>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-dark">
                        <input
                          type="radio"
                          name="status"
                          value="ACTIVE"
                          checked={formData.status === 'ACTIVE'}
                          onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                          className="accent-gold h-4 w-4"
                        />
                        <span>Active</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-dark">
                        <input
                          type="radio"
                          name="status"
                          value="DRAFT"
                          checked={formData.status === 'DRAFT'}
                          onChange={() => setFormData({ ...formData, status: 'DRAFT' })}
                          className="accent-gold h-4 w-4"
                        />
                        <span>Draft</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-dark">
                        <input
                          type="radio"
                          name="status"
                          value="ARCHIVED"
                          checked={formData.status === 'ARCHIVED'}
                          onChange={() => setFormData({ ...formData, status: 'ARCHIVED' })}
                          className="accent-gold h-4 w-4"
                        />
                        <span>Archived</span>
                      </label>
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-parchment">
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-2">Featured Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, featured: !prev.featured }))}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors flex items-center space-x-2 ${
                        formData.featured
                          ? 'bg-gold text-dark border-gold shadow-sm'
                          : 'bg-cream text-dark/70 border-parchment hover:bg-parchment/40'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${formData.featured ? 'fill-dark text-dark' : 'text-dark/40'}`} />
                      <span>Featured: {formData.featured ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-parchment">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      <ConfirmModal
        isOpen={!!productToArchive}
        title="Archive Product?"
        description={`Are you sure you want to archive '${productToArchive?.name}'?\nThis product will no longer appear on the customer storefront.`}
        confirmLabel="Archive Product"
        isProcessing={isArchiving}
        isDestructive={true}
        onConfirm={confirmArchiveProduct}
        onCancel={() => setProductToArchive(null)}
      />
    </div>
  );
}
