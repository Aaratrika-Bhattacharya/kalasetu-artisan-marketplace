import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<Props> = ({ onProceedToCheckout }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    totalArtisanShare,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const artisanSharePct = subtotal > 0 ? Math.round((totalArtisanShare / subtotal) * 100) : 85;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-clayborder">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-terracotta-600" />
              <h3 className="font-heritage font-bold text-lg text-stone-900">
                Your Heritage Cart
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <span className="text-4xl block">🏺</span>
                <p className="font-heritage font-semibold text-stone-800 text-base">
                  Your cart is empty
                </p>
                <p className="text-stone-500 text-xs max-w-xs mx-auto">
                  Discover authentic clay, terracotta, and ceramic masterpieces direct from master lineages.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-stone-50/80 rounded-xl p-3 border border-stone-200 flex space-x-3 text-xs"
                >
                  <img
                    src={
                      item.product.images?.[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.product.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-heritage font-bold text-stone-900 truncate text-xs">
                      {item.product.title}
                    </h4>
                    <div className="text-stone-500 text-[11px]">
                      ₹{item.product.retailPrice} each
                    </div>
                    <div className="text-emerald-700 font-semibold text-[11px] flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      ₹{item.product.artisanBasePrice * item.quantity} goes directly to artisan
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Direct Artisan Share Pill */}
              <div className="bg-emerald-100/70 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-950 font-medium">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Artisan Direct Payout:</span>
                </div>
                <span className="font-bold text-emerald-800 text-sm">
                  ₹{totalArtisanShare} ({artisanSharePct}%)
                </span>
              </div>

              {/* SafeTransit Guarantee */}
              <div className="flex items-center space-x-2 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  SafeTransit™ Bio-Composite Packaging included. 100% free replacement against damage.
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs font-semibold text-stone-600">Subtotal</span>
                <span className="font-heritage text-2xl font-bold text-stone-900">
                  ₹{subtotal}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 terracotta-glow"
              >
                <span>Proceed to SafeTransit™ Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
