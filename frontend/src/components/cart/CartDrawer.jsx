import React, { useEffect } from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { formatINR } from '../../utils/formatters';

export const CartDrawer = () => {
  const { isCartOpen, closeCart, items, totalItemsCount, grandTotal, openCheckout } =
    useCart();

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto justify-end">
        <div className="w-full sm:w-[420px] max-w-full bg-[#F3EDE2] dark:bg-[#24201D] text-[#231C18] dark:text-[#F5EFEB] shadow-2xl flex flex-col border-l border-[#E2D9CC] dark:border-[#38312C] animate-slide-in-right">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between bg-[#F3EDE2] dark:bg-[#24201D]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D9532F]/15 dark:bg-[#E56B48]/20 text-[#D9532F] dark:text-[#E56B48] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#231C18] dark:text-[#F5EFEB] leading-tight">
                  Your Cafeteria Tray
                </h2>
                <span className="text-xs text-[#685D55] dark:text-[#A99F98]">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-[#685D55] hover:text-[#231C18] dark:text-[#A99F98] dark:hover:text-[#F5EFEB] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C]/60 rounded-lg transition-colors cursor-pointer"
              title="Close tray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#D9532F]/10 dark:bg-[#E56B48]/15 text-[#D9532F] dark:text-[#E56B48] flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#231C18] dark:text-[#F5EFEB] mb-1">
                  Your food tray is empty
                </h3>
                <p className="text-xs text-[#685D55] dark:text-[#A99F98] max-w-xs mb-6">
                  Add delicious wraps, hot bowls, snacks, or chilled beverages to get started.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] text-[#FBF8F2] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Explore Cafeteria Menu
                </button>
              </div>
            ) : (
              items.map((item) => <CartItem key={item.id} item={item} />)
            )}
          </div>

          {/* Cart Summary & Checkout Button */}
          {items.length > 0 && (
            <div>
              <CartSummary />
              <div className="p-4 sm:p-5 pt-0 bg-[#F3EDE2] dark:bg-[#24201D]">
                <button
                  onClick={openCheckout}
                  type="button"
                  className="w-full flex items-center justify-between bg-gradient-to-r from-[#D9532F] to-[#D48B28] hover:from-[#C24522] hover:to-[#B8731F] dark:from-[#E56B48] dark:to-[#E5A642] text-[#FBF8F2] font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-[#D9532F]/20 dark:shadow-[#E56B48]/20 transition-all active:scale-98 cursor-pointer"
                >
                  <span className="text-sm">Proceed to Checkout</span>
                  <div className="flex items-center gap-1.5 text-sm tabular-nums">
                    <span>{formatINR(grandTotal)}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
