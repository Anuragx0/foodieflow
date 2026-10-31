import React from 'react';
import { Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';

export const CartSummary = () => {
  const { subtotal, tax, grandTotal, estimatedPrepMinutes, clearCart, items } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="border-t border-[#E2D9CC] dark:border-[#38312C] bg-[#F3EDE2] dark:bg-[#24201D] p-4 sm:p-5 space-y-3">
      {/* Rush Hour Pickup ETA */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#D48B28]/10 dark:bg-[#E5A642]/10 border border-[#D48B28]/30 dark:border-[#E5A642]/30 text-[#D48B28] dark:text-[#E5A642] text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642]" />
          Est. Kitchen Wait:
        </span>
        <span className="font-extrabold text-[#D48B28] dark:text-[#E5A642]">
          ~{estimatedPrepMinutes} mins
        </span>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-1.5 text-xs text-[#685D55] dark:text-[#A99F98]">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-semibold text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
            {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            Cafeteria GST & Eco-Packaging (5%)
          </span>
          <span className="font-semibold text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
            {formatINR(tax)}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-[#E2D9CC] dark:border-[#38312C] text-sm font-extrabold text-[#231C18] dark:text-[#F5EFEB]">
          <span>Total Payable</span>
          <span className="text-base text-[#D9532F] dark:text-[#E56B48] tabular-nums">
            {formatINR(grandTotal)}
          </span>
        </div>
      </div>

      {/* Trust & Clear Cart Row */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-[#685D55] dark:text-[#A99F98]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F40] dark:text-[#3E8A54]" />
          Razorpay Verified Checkout
        </span>
        <button
          onClick={clearCart}
          className="flex items-center gap-1 hover:text-[#B83226] dark:hover:text-[#D9483B] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Clear Tray
        </button>
      </div>
    </div>
  );
};
