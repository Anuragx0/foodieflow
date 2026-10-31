import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DietaryBadge } from '../common/Badge';
import { formatINR } from '../../utils/formatters';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-xl border border-[#E2D9CC] dark:border-[#38312C] hover:border-[#D48B28]/40 dark:hover:border-[#E5A642]/40 transition-all">
      {/* Thumbnail */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-16 h-16 rounded-lg object-cover bg-[#E2D9CC] dark:bg-[#38312C] shrink-0"
      />

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <DietaryBadge isVeg={item.isVeg} className="w-4 h-4 scale-85 shrink-0" />
          <h4 className="text-sm font-bold text-[#231C18] dark:text-[#F5EFEB] truncate">
            {item.title}
          </h4>
        </div>
        <p className="text-xs text-[#685D55] dark:text-[#A99F98] font-medium">
          {formatINR(item.price)} each
        </p>

        {/* Quantity Controls & Item Subtotal */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-5 h-5 rounded flex items-center justify-center text-[#685D55] dark:text-[#A99F98] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-[#231C18] dark:text-[#F5EFEB] min-w-[16px] text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-5 h-5 rounded flex items-center justify-center text-[#685D55] dark:text-[#A99F98] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-xs font-extrabold text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
            {formatINR(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="p-1.5 text-[#685D55] hover:text-[#B83226] hover:bg-[#B83226]/10 dark:text-[#A99F98] dark:hover:text-[#D9483B] dark:hover:bg-[#D9483B]/10 rounded-lg transition-colors cursor-pointer"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
