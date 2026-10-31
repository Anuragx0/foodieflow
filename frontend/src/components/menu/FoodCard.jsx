import React from 'react';
import { Plus, Minus, Clock, Star, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DietaryBadge, SpicyBadge } from '../common/Badge';
import { formatINR, formatPrepTime } from '../../utils/formatters';

export const FoodCard = ({ item }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  return (
    <div className="group bg-[#F3EDE2] dark:bg-[#24201D] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] shadow-xs hover:shadow-xl dark:hover:shadow-[#161311]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Food Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E2D9CC]/50 dark:bg-[#38312C]/50">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <DietaryBadge isVeg={item.isVeg} className="shadow-md" />
        </div>
        {/* Dedicated High-Contrast Spiciness Row */}
          <div className="absolute top-2.5 left-10 z-10 flex items-center gap-2 pt-1 pb-0.5">
            <SpicyBadge level={item.spicyLevel} />
          </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#24201D]/85 backdrop-blur-xs text-[11px] font-medium text-[#F5EFEB] border border-[#38312C]/60 shadow-xs">
            <Clock className="w-3 h-3 text-[#D48B28] dark:text-[#E5A642]" />
            {formatPrepTime(item.prepTimeMinutes)}
          </span>
        </div>

        {/* Caloric subtle footer pill */}
        {item.calories && (
          <div className="absolute bottom-2 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3EDE2]/90 dark:bg-[#24201D]/90 backdrop-blur-xs text-[10px] font-bold text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC]/60 dark:border-[#38312C]/60 shadow-xs">
              <Flame className="w-3 h-3 text-[#D9532F] dark:text-[#E56B48]" />
              {item.calories} kcal
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header Row: Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[#D9532F] dark:text-[#E56B48] uppercase tracking-wider text-[10px]">
              {item.category}
            </span>
            <span className="flex items-center gap-1 font-bold text-[#231C18] dark:text-[#F5EFEB] shrink-0">
              <Star className="w-3.5 h-3.5 text-[#D48B28] dark:text-[#E5A642] fill-[#D48B28] dark:fill-[#E5A642]" />
              {item.rating}
              <span className="font-normal text-[#685D55] dark:text-[#A99F98] text-[10px]">
                ({item.reviewsCount})
              </span>
            </span>
          </div>

          {/* Dish Title */}
          <h3 className="font-extrabold text-[#231C18] dark:text-[#F5EFEB] text-base leading-snug line-clamp-1 group-hover:text-[#D9532F] dark:group-hover:text-[#E56B48] transition-colors">
            {item.title}
          </h3>

          {/* Short Appetizing Description */}
          <p className="text-xs text-[#685D55] dark:text-[#A99F98] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer: Price & Add / Counter Controls */}
        <div className="pt-2 border-t border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#685D55] dark:text-[#A99F98] block leading-none">Price</span>
            <span className="text-lg font-black text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
              {formatINR(item.price)}
            </span>
          </div>

          {/* Interactive Stepper, Add Button, or Sold Out state */}
          {!item.inStock ? (
            <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-xl bg-[#E2D9CC]/40 dark:bg-[#38312C]/40 text-[#685D55] dark:text-[#A99F98] border border-[#E2D9CC] dark:border-[#38312C] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Sold Out
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(item)}
              type="button"
              className="inline-flex items-center gap-1 bg-[#D9532F]/10 dark:bg-[#E56B48]/15 hover:bg-[#D9532F] dark:hover:bg-[#E56B48] text-[#D9532F] dark:text-[#E56B48] hover:text-white dark:hover:text-white border border-[#D9532F]/30 dark:border-[#E56B48]/40 hover:border-[#D9532F] dark:hover:border-[#E56B48] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs min-h-[34px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#24201D] text-[#F5EFEB] p-1 rounded-xl shadow-xs border border-[#38312C] animate-fade-in">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-[#38312C] hover:bg-[#4D443D] flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-xs font-extrabold px-1 min-w-[18px] text-center tabular-nums text-[#F5EFEB]">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#EE7A58] flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
