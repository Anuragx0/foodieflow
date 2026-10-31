import React from 'react';
import { FoodCard } from './FoodCard';
import { useMenu } from '../../context/MenuContext';
import { Utensils, RotateCcw } from 'lucide-react';

export const MenuGrid = () => {
  const {
    filteredItems,
    loading,
    searchQuery,
    selectedCategory,
    vegOnly,
    setSelectedCategory,
    setSearchQuery,
    setVegOnly,
  } = useMenu();

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setVegOnly(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-[#F3EDE2] dark:bg-[#24201D] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] p-4 space-y-4 animate-pulse"
          >
            <div className="aspect-[16/10] bg-[#E2D9CC] dark:bg-[#38312C] rounded-xl w-full" />
            <div className="h-4 bg-[#E2D9CC] dark:bg-[#38312C] rounded w-3/4" />
            <div className="h-3 bg-[#E2D9CC] dark:bg-[#38312C] rounded w-full" />
            <div className="h-3 bg-[#E2D9CC] dark:bg-[#38312C] rounded w-1/2" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-5 bg-[#E2D9CC] dark:bg-[#38312C] rounded w-1/4" />
              <div className="h-8 bg-[#E2D9CC] dark:bg-[#38312C] rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-[#F3EDE2] dark:bg-[#24201D] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] my-6 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#D9532F]/10 dark:bg-[#E56B48]/15 text-[#D9532F] dark:text-[#E56B48] flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#231C18] dark:text-[#F5EFEB] mb-1">
          No cafeteria items found
        </h3>
        <p className="text-sm text-[#685D55] dark:text-[#A99F98] max-w-sm mx-auto mb-6">
          We couldn't find any dishes matching your current filters
          {searchQuery && ` for "${searchQuery}"`}.
        </p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 bg-[#D9532F] dark:bg-[#E56B48] hover:bg-[#C24522] dark:hover:bg-[#EE7A58] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <section className="py-4 sm:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
