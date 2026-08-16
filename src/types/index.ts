export type UserRole = 'customer' | 'admin' | 'store_manager' | 'fulfillment_staff' | 'support_agent';

export interface SavedAddress {
  id: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  phone?: string;
  displayName: string;
  role: UserRole;
  birthDate?: any; // Firestore Timestamp
  loyaltyPoints: number;
  savedAddresses: SavedAddress[];
  createdAt: any;
  updatedAt: any;
}

export interface ProductImage {
  url: string;
  alt: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  price: number;
  comparePrice?: number;
  compareAtPrice?: number;
  sku: string;
  weight?: string;
  storageInstructions?: string;
  shelfLife?: string;
  allergenInfo?: string;
  status: 'draft' | 'active' | 'archived';
  category: string | { id?: string; name?: string; slug?: string };
  tags: string[];
  images: (ProductImage | string)[] | any;
  variants?: ProductVariant[];
  ingredients: string[];
  allergens: string[];
  cocoaOrigin: string;
  cacaoPercentage?: number;
  tastingNotes?: string[];
  sensoryProfile?: {
    intensity: number;
    sweetness: number;
    floral: number;
    nutty: number;
  };
  pairingNote?: string;
  inventory?: {
    stockQuantity: number;
    reservedStock?: number;
    reorderPoint?: number;
  };

  // Hamper Extensions
  isHamper?: boolean;
  hamperType?: string;
  pricingMode?: 'FIXED_PRICE' | 'QUOTE_REQUIRED';
  startingPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  allowChocolateSelection?: boolean;
  allowPersonalizedMessage?: boolean;
  allowCustomPackaging?: boolean;
  allowCustomRibbon?: boolean;
  allowCustomBranding?: boolean;
  allowCorporateBranding?: boolean;
  pricingTiers?: any[];
  createdAt: any;
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentCategoryId?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface CartItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Coupon {
  code: string;
  type: 'fixed' | 'percentage' | 'free_shipping';
  value: number;
  minOrderValue: number;
  usageLimit?: number;
  usageCount: number;
  expiryDate: any;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface PricingSummary {
  subtotal: number;
  itemDiscounts: number;
  couponDiscount: number;
  taxableAmount: number;
  shippingFee: number;
  giftWrapFee: number;
  total: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Omit<SavedAddress, 'id' | 'isDefault'>;
  items: OrderItem[];
  giftOptions?: {
    wrapRequested: boolean;
    message: string;
  };
  pricingSummary: PricingSummary;
  couponApplied?: {
    code: string;
    discountValue: number;
  };
  paymentDetails: {
    gateway: 'razorpay' | 'cod';
    transactionId?: string;
    paymentStatus: 'pending' | 'captured' | 'failed' | 'refunded';
    updatedAt: any;
  };
  fulfillmentDetails: {
    status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    courierName?: string;
    estimatedDeliveryDate?: any;
    actualDeliveryDate?: any;
    updatedAt: any;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerName: string;
  rating: number;
  text?: string;
  imageUrl?: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}
