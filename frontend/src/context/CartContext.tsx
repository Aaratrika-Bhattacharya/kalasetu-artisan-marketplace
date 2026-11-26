import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAvailable } from '../services/catalog';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalArtisanShare: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kalasetu_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('kalasetu_cart', JSON.stringify(items)); } catch { /* Cart remains usable in memory. */ }
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    if (!isAvailable(product) || !Number.isSafeInteger(quantity) || quantity < 1) return;
    const limit = product.isMadeToOrder ? Number.MAX_SAFE_INTEGER : product.stockQuantity;
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, product, quantity: Math.min(item.quantity + quantity, limit) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, limit) }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return;
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.isMadeToOrder ? quantity : Math.max(1, item.product.stockQuantity)) } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.retailPrice * item.quantity,
    0
  );

  const totalArtisanShare = items.reduce(
    (sum, item) => sum + item.product.artisanBasePrice * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalArtisanShare,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
