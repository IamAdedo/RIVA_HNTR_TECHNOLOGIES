import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  condition: 'NEW' | 'UK_USED_GRADE_A' | 'UK_USED_GRADE_B' | 'SECOND_HAND';
  price: number;
  stock_quantity: number;
  specs?: {
    ram?: string;
    storage?: string;
    processor?: string;
    battery_health?: string;
  };
  images: string[];
  quantity: number;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  delivery_address: string;
}

interface CartState {
  items: CartItem[];
  guestInfo: GuestInfo;
  whatsAppMessage: string;
  addToCart: (product: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  setGuestInfo: (info: Partial<GuestInfo>) => void;
  setWhatsAppMessage: (msg: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestInfo: {
        name: '',
        email: '',
        phone: '',
        delivery_address: '',
      },
      whatsAppMessage: '',
      addToCart: (product, qty = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const newQty = existingItem.quantity + qty;
          if (newQty > product.stock_quantity) {
            alert(`Cannot add more. Only ${product.stock_quantity} item(s) in stock.`);
            return;
          }
          set({
            items: currentItems.map((item) =>
              item.id === product.id ? { ...item, quantity: newQty } : item
            ),
          });
        } else {
          if (qty > product.stock_quantity) {
            alert(`Cannot add more. Only ${product.stock_quantity} item(s) in stock.`);
            return;
          }
          set({ items: [...currentItems, { ...product, quantity: qty }] });
        }
      },
      removeFromCart: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, qty) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;

        if (qty > item.stock_quantity) {
          alert(`Only ${item.stock_quantity} items available in stock.`);
          return;
        }
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }

        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      setGuestInfo: (info) =>
        set((state) => ({
          guestInfo: { ...state.guestInfo, ...info },
        })),
      setWhatsAppMessage: (msg) => set({ whatsAppMessage: msg }),
    }),
    {
      name: 'riva-cart-storage',
    }
  )
);
