import React from 'react';
import { Search, X, Sparkles, Leaf } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';

export const CategoryFilter = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    vegOnly,
    setVegOnly,
    filteredItems,
  } = useMenu();

  return (
    <div className="space-y-3.5 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Hero Banner / Campus Rush Message */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D9532F] via-[#D48B28] to-[#D9532F] dark:from-[#E56B48] dark:via-[#E5A642] dark:to-[#E56B48] text-white p-4 sm:p-7 shadow-lg shadow-[#D9532F]/15">
        <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3 h-3 text-[#F5EFEB]" />
            Live Cafeteria Express
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            Order in Seconds, Pick Up Fresh.
          </h1>
          <p className="text-white/90 text-xs sm:text-base leading-relaxed max-w-xl">
            Hot meals, quick bites, and chilled beverages ready when you reach the counter. Skip the lines.
          </p>
        </div>
        {/* Subtle background glow */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Search Bar & Dietary Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search burgers, biryani, wraps, shakes..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] bg-[#F3EDE2] dark:bg-[#24201D] text-xs sm:text-sm text-[#231C18] dark:text-[#F5EFEB] placeholder-[#685D55]/70 dark:placeholder-[#A99F98]/70 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 dark:focus:ring-[#E56B48]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#685D55] hover:text-[#231C18] dark:text-[#A99F98] dark:hover:text-[#F5EFEB] p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Veg-Only Toggle */}
        <button
          type="button"
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none shrink-0 ${
            vegOnly
              ? 'bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border-[#2E6F40]/30 dark:border-[#3E8A54]/40 shadow-xs'
              : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:border-[#D48B28] dark:hover:border-[#E5A642]'
          }`}
        >
          <Leaf className={`w-3.5 h-3.5 ${vegOnly ? 'text-[#2E6F40] fill-[#2E6F40] dark:text-[#3E8A54] dark:fill-[#3E8A54]' : 'text-[#685D55] dark:text-[#A99F98]'}`} />
          <span>Veg Only</span>
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
              vegOnly ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-white' : 'bg-[#E2D9CC] dark:bg-[#38312C] text-[#685D55] dark:text-[#A99F98]'
            }`}
          >
            {vegOnly ? '✓' : ''}
          </span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth -mx-1 px-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#D9532F] dark:bg-[#E56B48] text-white shadow-xs'
                  : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:border-[#D48B28] dark:hover:border-[#E5A642]'
              }`}
            >
              {cat}
            </button>
          );
        })}
        <span className="text-xs text-[#685D55] dark:text-[#A99F98] ml-auto whitespace-nowrap hidden lg:block">
          Showing <span className="font-bold text-[#231C18] dark:text-[#F5EFEB]">{filteredItems.length}</span> items
        </span>
      </div>
    </div>
  );
};
