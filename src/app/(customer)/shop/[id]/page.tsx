'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Check, ChevronRight, Info, ShieldAlert, Package, Sparkles, Truck } from 'lucide-react';
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
  const { addItem, openCart } = useCartStore();

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
      <div className="bg-[#100805] min-h-screen flex items-center justify-center p-12 text-xs font-mono text-[#B9AA99]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#B88A42] border-t-transparent rounded-full animate-spin" />
          <span>Curating artisanal creation...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#100805] min-h-screen flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-3xl font-editorial font-light text-[#F4EBDD]">Creation Not Found</h2>
        <p className="text-xs text-[#B9AA99]">{error || 'This artisanal creation is currently unavailable.'}</p>
        <Link 
          href="/shop" 
          className="px-6 py-3 bg-[#B88A42] text-[#100805] text-xs uppercase tracking-widest font-semibold hover:bg-[#D09A4E] transition-colors"
        >
          Return to Collection
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
    if (typeof openCart === 'function') openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-[#100805] text-[#F4EBDD] min-h-screen pb-24 selection:bg-[#B88A42] selection:text-[#100805]">
      {/* 1. Breadcrumb */}
      <div className="border-b border-[#B88A42]/20 py-3.5 px-4 sm:px-6 lg:px-8 text-[11px] text-[#B9AA99] bg-[#0E0604]">
        <div className="mx-auto max-w-7xl flex items-center space-x-2">
          <Link href="/shop" className="hover:text-[#B88A42] transition-colors">Collection</Link>
          {categoryName && (
            <>
              <ChevronRight className="w-3 h-3 text-[#B88A42]" />
              <Link href={`/shop?category=${encodeURIComponent(categoryName)}`} className="hover:text-[#B88A42] transition-colors">{categoryName}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-[#B88A42]" />
          <span className="text-[#F4EBDD] font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* 2. Main Product Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Image View */}
            <div className="relative aspect-[4/3] bg-gradient-to-b from-[#170B07] to-[#0D0503] border border-[#B88A42]/25 overflow-hidden group shadow-2xl flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(184,138,66,0.15),transparent_65%)] pointer-events-none" />
              <Image
                src={images[activeImageIndex]?.url || images[0]?.url || '/images/hero-chocolate.png'}
                alt={images[activeImageIndex]?.alt || product.name}
                fill
                priority
                className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-4"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#B88A42] text-[#100805] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-md">
                  Signature Offer
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
                    className={`relative w-20 h-20 border transition-all bg-[#170B07] ${
                      activeImageIndex === idx ? 'border-[#B88A42] ring-1 ring-[#B88A42] shadow-[0_0_12px_rgba(184,138,66,0.3)]' : 'border-[#B88A42]/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || product.name} fill className="object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Add to Bag */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4 border-b border-[#B88A42]/20 pb-8">
              {categoryName && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] border border-[#B88A42]/40 px-2.5 py-1 inline-block bg-[#170B07]">
                  {categoryName}
                </span>
              )}
              
              <h1 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD] leading-tight">
                {product.name}
              </h1>

              {/* Short Description / Tagline */}
              {shortDescText && (
                <p className="text-xs sm:text-sm font-light text-[#B9AA99] italic border-l-2 border-[#B88A42] pl-3 py-1">
                  &ldquo;{shortDescText}&rdquo;
                </p>
              )}

              {/* Price Display */}
              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-3xl sm:text-4xl font-editorial font-bold text-[#F4EBDD]">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-lg font-mono text-[#B9AA99]/60 line-through">
                    ₹{comparePrice?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Out of Stock Warning */}
            {isOutOfStock && (
              <div className="p-4 border border-red-800/60 bg-red-950/40 text-red-200 text-xs">
                <span className="font-bold uppercase tracking-widest text-[10px] block">Currently Out of Stock</span>
                <p className="font-light mt-1">This artisanal creation is freshly tempering. Please check back shortly.</p>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center border border-[#B88A42]/30 ${isOutOfStock ? 'opacity-40' : 'bg-[#170B07]'}`}>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    suppressHydrationWarning
                    className="px-4 py-3 text-sm text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-medium font-mono text-[#F4EBDD]">{quantity}</span>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(quantity + 1)}
                    suppressHydrationWarning
                    className="px-4 py-3 text-sm text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  suppressHydrationWarning
                  className={`flex-1 py-4 text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
                    isOutOfStock
                      ? 'bg-[#211109] text-[#B9AA99]/40 cursor-not-allowed border border-[#B88A42]/20'
                      : 'bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] hover:shadow-[0_0_20px_rgba(184,138,66,0.35)]'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <>
                      <Check className="w-4 h-4 text-[#100805]" />
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

              {/* Delivery Timeline Notice */}
              <div className="p-3.5 border border-[#B88A42]/20 bg-[#170B07] flex items-center justify-between text-xs shadow-md">
                <div className="flex items-center space-x-2 text-[#F4EBDD]">
                  <Truck className="w-4 h-4 text-[#B88A42] flex-shrink-0" />
                  <span className="font-semibold text-[11px] uppercase tracking-wider">Express Dispatch</span>
                </div>
                <div className="text-[11px] font-mono text-[#B9AA99] flex items-center space-x-3">
                  <span><strong className="text-[#F4EBDD]">3 Days</strong> in Kerala</span>
                  <span className="text-[#B88A42]/40">|</span>
                  <span><strong className="text-[#F4EBDD]">5-6 Days</strong> Outside</span>
                </div>
              </div>
            </div>

            {/* Optional Sensory Profile */}
            {product.sensoryProfile && (
              <div className="p-4 border border-[#B88A42]/20 bg-[#170B07] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">Tasting Notes & Profile</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {[
                    { label: 'Cocoa Intensity', value: product.sensoryProfile.intensity },
                    { label: 'Floral & Sweetness', value: product.sensoryProfile.floral },
                  ].map(
                    ({ label, value }) =>
                      value !== undefined && (
                        <div key={label}>
                          <div className="flex justify-between text-[#B9AA99] mb-1 font-mono text-[11px]">
                            <span>{label}</span>
                            <span className="text-[#F4EBDD]">{value}/10</span>
                          </div>
                          <div className="w-full h-1 bg-[#211109]">
                            <div className="h-full bg-[#B88A42]" style={{ width: `${value * 10}%` }} />
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
        <div className="mt-20 border-t border-[#B88A42]/20 pt-14 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Description & Details */}
          <div className="space-y-8">
            {product.description && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42] flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-2" /> About This Chocolate
                </h2>
                <div className="text-xs text-[#B9AA99] font-light leading-relaxed whitespace-pre-line bg-[#170B07] p-5 border border-[#B88A42]/20">
                  {product.description}
                </div>
              </div>
            )}

            {/* Product Details (Weight, Shelf Life, Storage) */}
            {hasProductDetails && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42] flex items-center">
                  <Package className="w-3.5 h-3.5 mr-2" /> Artisanal Specifications
                </h2>
                <div className="bg-[#170B07] border border-[#B88A42]/20 p-5 space-y-3 text-xs">
                  {weightText && (
                    <div className="flex justify-between items-center border-b border-[#B88A42]/20 pb-2">
                      <span className="text-[#B9AA99] uppercase tracking-wider text-[10px]">Net Weight</span>
                      <span className="font-mono font-semibold text-[#F4EBDD]">{weightText}</span>
                    </div>
                  )}
                  {shelfLifeText && (
                    <div className="flex justify-between items-center border-b border-[#B88A42]/20 pb-2">
                      <span className="text-[#B9AA99] uppercase tracking-wider text-[10px]">Shelf Life</span>
                      <span className="font-mono font-semibold text-[#F4EBDD]">{shelfLifeText}</span>
                    </div>
                  )}
                  {storageText && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[#B9AA99] uppercase tracking-wider text-[10px] block">Recommended Storage</span>
                      <p className="text-[#F4EBDD] font-light leading-normal">{storageText}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ingredients & Allergens */}
          <div className="space-y-8">
            {ingredientsList.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42] flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2" /> Pure Ingredients
                </h2>
                <div className="bg-[#170B07] border border-[#B88A42]/20 p-5">
                  <div className="flex flex-wrap gap-2">
                    {ingredientsList.map((item, idx) => (
                      <span key={idx} className="bg-[#211109] border border-[#B88A42]/30 px-3 py-1.5 text-xs text-[#F4EBDD] font-medium">
                        ✦ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {allergenText && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#D09A4E] flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2 text-[#D09A4E]" /> Allergen Information
                </h2>
                <div className="bg-[#24130C] border border-[#B88A42]/30 text-[#F4EBDD] p-5 space-y-1.5 shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D09A4E] block">Food Advisory</span>
                  <p className="text-xs font-light leading-relaxed text-[#B9AA99]">{allergenText}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
