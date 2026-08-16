import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  quickViewProduct: Product | null;
  
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setQuickViewProduct: (product: Product | null) => void;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      quickViewProduct: null,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setQuickViewProduct: (product) => set({ quickViewProduct: product }),

      addItem: (item) => set((state) => {
        const existingIdx = state.items.findIndex(
          i => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existingIdx !== -1) {
          const newItems = [...state.items];
          newItems[existingIdx].quantity = Math.min(10, newItems[existingIdx].quantity + item.quantity);
          return { items: newItems, isCartOpen: true };
        }

        return { items: [...state.items, item], isCartOpen: true };
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          i => !(i.productId === productId && i.variantId === variantId)
        )
      })),

      updateQuantity: (productId, quantity, variantId) => set((state) => {
        const newItems = state.items.map(i => {
          if (i.productId === productId && i.variantId === variantId) {
            return { ...i, quantity: Math.max(1, Math.min(10, quantity)) };
          }
          return i;
        });
        return { items: newItems };
      }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'thalf-cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
