import { CartItem, Coupon, PricingSummary } from '../types';

export const PRICING_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  defaultShippingFee: 150,     // Shipping in INR
  freeShippingThreshold: 1500, // Orders above ₹1500 get free shipping
};

/**
 * Format helper for currency values based on configuration.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(PRICING_CONFIG.locale, {
    style: 'currency',
    currency: PRICING_CONFIG.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Core Pricing Engine. Computes subtotals, item-level discounts, coupon offsets,
 * shipping, and outputs final payable sums.
 */
export const PricingEngine = {
  /**
   * Calculate summary values from cart items, coupons, and shipping settings.
   */
  calculateOrder(
    items: CartItem[],
    coupon?: Coupon | null,
    options?: {
      customShippingFee?: number;
    }
  ): PricingSummary {
    // 1. Calculate item-level subtotals
    let subtotal = 0;
    const itemDiscounts = 0;

    for (const item of items) {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      // Item-level discounts (e.g. promotional slash price offsets) can be added here.
      // Currently, product price in cart is already resolved, but we track compare-at offsets if needed.
    }

    // 2. Validate and apply coupon discount
    let couponDiscount = 0;
    let couponIsValid = false;

    if (coupon && coupon.status === 'active') {
      const now = new Date();
      const expiry = new Date(coupon.expiryDate);

      // Check threshold and expiry date validity
      if (subtotal >= coupon.minOrderValue && expiry > now) {
        couponIsValid = true;
        
        if (coupon.type === 'percentage') {
          couponDiscount = Math.round((subtotal - itemDiscounts) * (coupon.value / 100));
        } else if (coupon.type === 'fixed') {
          couponDiscount = Math.min(coupon.value, subtotal - itemDiscounts);
        }
      }
    }

    // 3. Compute taxable amount (subtotal - item discounts - coupon discount)
    const taxableAmount = Math.max(0, subtotal - itemDiscounts - couponDiscount);

    // 4. Future Tax Module Hook (Disabled in Phase 1)
    // Note: GST/VAT is not calculated for Phase 1.
    // In Phase 2, this function can return a computed tax object (e.g. 18% GST).
    const gstAmount = this.calculateFutureTax(taxableAmount); 

    // 5. Calculate shipping charges
    let shippingFee = 0;
    if (options?.customShippingFee !== undefined) {
      shippingFee = options.customShippingFee;
    } else {
      // Free shipping threshold rule
      const thresholdAmount = subtotal - itemDiscounts - couponDiscount;
      if (thresholdAmount < PRICING_CONFIG.freeShippingThreshold && items.length > 0) {
        // If coupon type is free shipping, bypass fee
        if (coupon && coupon.type === 'free_shipping' && couponIsValid) {
          shippingFee = 0;
        } else {
          shippingFee = PRICING_CONFIG.defaultShippingFee;
        }
      }
    }

    // 6. Gift wrap is not offered; fee is always 0
    const giftWrapFee = 0;

    // 7. Sum final payable amount
    const total = taxableAmount + gstAmount + shippingFee;

    return {
      subtotal,
      itemDiscounts,
      couponDiscount,
      taxableAmount,
      shippingFee,
      giftWrapFee,
      total,
    };
  },

  /**
   * Placeholder hook for tax calculations, ensuring simple refactoring.
   * Returns 0 for Phase 1 as requested.
   */
  calculateFutureTax(_taxableAmount: number): number {
    // Phase 1: Taxes are disabled
    return 0;

    // Phase 2 refactoring implementation example:
    // const gstRate = 0.18; // 18% confectionery rate
    // return Math.round(taxableAmount * gstRate);
  },
};
