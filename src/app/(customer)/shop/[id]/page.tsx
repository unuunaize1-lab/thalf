'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Check, ChevronRight, Info, ShieldAlert, Package, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found.');
        }
      } catch (err) {
        setError('Unable to load product detail. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center p-12 text-xs font-mono text-dark/50">
        Loading artisanal creation...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-dark">Product Not Found</h2>
        <p className="text-xs text-taupe">{error || 'This product is currently unavailable.'}</p>
        <Link href="/shop" className="px-6 py-3 bg-dark text-cream text-xs uppercase tracking-wider font-semibold hover:bg-gold hover:text-dark transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  
  // Format images
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'string' ? { url: img, alt: product.name } : img))
      : [{ url: '/images/hero-chocolate.png', alt: product.name }];

  // Inventory calculation
  const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
  const isOutOfStock = stockQty <= 0;

  // Price calculations
  const sellingPrice = Number(product.price);
  const comparePrice = product.comparePrice || product.compareAtPrice ? Number(product.comparePrice || product.compareAtPrice) : undefined;
  const hasDiscount = comparePrice !== undefined && comparePrice > sellingPrice;

  // Ingredients handling (string or array)
  let ingredientsList: string[] = [];
  const rawIngredients: any = product.ingredients;
  if (Array.isArray(rawIngredients) && rawIngredients.length > 0) {
    ingredientsList = rawIngredients.map((i: any) => String(i).trim()).filter(Boolean);
  } else if (typeof rawIngredients === 'string' && rawIngredients.trim()) {
    ingredientsList = rawIngredients
      .split(/[,;\n]+/)
      .map((i: string) => i.trim())
      .filter(Boolean);
  }

  // Check optional fields for conditional rendering
  const weightText = product.weight?.trim();
  const shelfLifeText = product.shelfLife?.trim();
  const storageText = product.storageInstructions?.trim();
  const allergenText = product.allergenInfo?.trim() || (Array.isArray(product.allergens) && product.allergens.length > 0 ? product.allergens.join(', ') : undefined);
  const shortDescText = product.shortDescription?.trim();

  const hasProductDetails = !!(weightText || shelfLifeText || storageText);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      productName: product.name,
      price: sellingPrice,
      quantity,
      image: images[activeImageIndex]?.url || images[0]?.url || '/images/hero-chocolate.png',
      sku: product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-cream text-dark min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-parchment py-3 px-4 sm:px-6 lg:px-8 text-[11px] text-taupe bg-champagne/40">
        <div className="mx-auto max-w-7xl flex items-center space-x-2">
          <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
          {categoryName && (
            <>
              <ChevronRight className="w-3 h-3 text-gold" />
              <Link href={`/shop?category=${encodeURIComponent(categoryName)}`} className="hover:text-gold transition-colors">{categoryName}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gold" />
          <span className="text-dark font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Image View */}
            <div className="relative aspect-[4/3] bg-dark/5 border border-parchment p-2 overflow-hidden group shadow-lux">
              <Image
                src={images[activeImageIndex]?.url || images[0]?.url || '/images/hero-chocolate.png'}
                alt={images[activeImageIndex]?.alt || product.name}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-gold text-dark text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-sm">
                  Special Offer
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 border transition-all ${
                      activeImageIndex === idx ? 'border-gold ring-1 ring-gold p-0.5 shadow-md' : 'border-parchment opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Add to Bag */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4 border-b border-parchment pb-8">
              {categoryName && (
                <span className="text-[10px] font-bold uppercase tracking-ultra text-gold border border-gold/40 px-2.5 py-0.5 inline-block">
                  {categoryName}
                </span>
              )}
              
              <h1 className="font-editorial text-4xl sm:text-5xl font-light text-dark leading-tight">
                {product.name}
              </h1>

              {/* Short Description / Tagline */}
              {shortDescText && (
                <p className="text-xs sm:text-sm font-medium text-dark/75 italic border-l-2 border-gold/60 pl-3 py-0.5">
                  &ldquo;{shortDescText}&rdquo;
                </p>
              )}

              {/* Price Display */}
              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-3xl font-editorial font-bold text-dark">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-lg font-mono text-taupe line-through">
                    ₹{comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Out of Stock Warning */}
            {isOutOfStock && (
              <div className="p-4 border border-red-800 bg-red-950/30 text-red-200 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] block">Currently Out of Stock</span>
                <p className="font-light mt-1">This product is currently unavailable. Please check back later.</p>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center border border-parchment ${isOutOfStock ? 'opacity-50' : 'bg-cream'}`}>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-sm text-taupe hover:text-dark hover:bg-parchment transition-colors disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-medium font-mono text-dark">{quantity}</span>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-3 text-sm text-taupe hover:text-dark hover:bg-parchment transition-colors disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 text-xs uppercase tracking-ultra font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux ${
                    isOutOfStock
                      ? 'bg-parchment text-taupe/60 cursor-not-allowed border border-parchment'
                      : 'bg-dark text-cream hover:bg-gold hover:text-dark'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag — ₹{(sellingPrice * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Sensory Profile */}
            {product.sensoryProfile && (
              <div className="p-4 border border-parchment bg-white/50 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Flavour Profile</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {[
                    { label: 'Intensity', value: product.sensoryProfile.intensity },
                    { label: 'Floral', value: product.sensoryProfile.floral },
                  ].map(
                    ({ label, value }) =>
                      value !== undefined && (
                        <div key={label}>
                          <div className="flex justify-between text-taupe mb-1 font-mono text-[11px]">
                            <span>{label}</span>
                            <span>{value}/10</span>
                          </div>
                          <div className="w-full h-1 bg-parchment">
                            <div className="h-full bg-gold" style={{ width: `${value * 10}%` }} />
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lower Information Sections Grid */}
        <div className="mt-16 border-t border-parchment pt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Description & Details */}
          <div className="space-y-8">
            {/* About This Chocolate */}
            {product.description && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-ultra text-gold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-2" /> About This Chocolate
                </h2>
                <div className="text-xs text-dark/80 font-light leading-relaxed whitespace-pre-line bg-champagne/20 p-5 border border-parchment">
                  {product.description}
                </div>
              </div>
            )}

            {/* Product Details (Weight, Shelf Life, Storage) */}
            {hasProductDetails && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-ultra text-gold flex items-center">
                  <Package className="w-3.5 h-3.5 mr-2" /> Product Details
                </h2>
                <div className="bg-champagne/20 border border-parchment p-5 space-y-3 text-xs">
                  {weightText && (
                    <div className="flex justify-between items-center border-b border-parchment/60 pb-2">
                      <span className="font-bold text-dark uppercase tracking-wider text-[10px]">Weight</span>
                      <span className="font-mono font-semibold text-dark">{weightText}</span>
                    </div>
                  )}
                  {shelfLifeText && (
                    <div className="flex justify-between items-center border-b border-parchment/60 pb-2">
                      <span className="font-bold text-dark uppercase tracking-wider text-[10px]">Shelf Life</span>
                      <span className="font-mono font-semibold text-dark">{shelfLifeText}</span>
                    </div>
                  )}
                  {storageText && (
                    <div className="pt-1 space-y-1">
                      <span className="font-bold text-dark uppercase tracking-wider text-[10px] block">Storage</span>
                      <p className="text-dark/80 font-light leading-normal">{storageText}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ingredients & Allergens */}
          <div className="space-y-8">
            {/* Ingredients */}
            {ingredientsList.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-ultra text-gold flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2" /> Ingredients
                </h2>
                <div className="bg-champagne/20 border border-parchment p-5">
                  <div className="flex flex-wrap gap-2">
                    {ingredientsList.map((item, idx) => (
                      <span key={idx} className="bg-cream border border-parchment px-3 py-1 text-xs text-dark/90 font-medium">
                        ✦ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Allergen Information */}
            {allergenText && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-ultra text-red-900 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2 text-red-700" /> Allergen Information
                </h2>
                <div className="bg-red-50 border border-red-200 text-red-900 p-5 space-y-1.5 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">Food Safety Notice</span>
                  <p className="text-xs font-medium leading-relaxed">{allergenText}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
