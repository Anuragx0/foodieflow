import React from 'react';
import { ShoppingBag, UtensilsCrossed, Clock, Flame, Lock, Bell } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { formatINR } from '../../utils/formatters';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = ({ onStaffLoginClick }) => {
  const { totalItemsCount, subtotal, openCart } = useCart();
  const { orders, activeOrders, openTracker } = useOrders();

  const activeOrder = activeOrders[0];
  const activeStatus = activeOrder?.orderStatus || activeOrder?.status || 'PAID';
  const isReady = activeStatus === 'READY_FOR_PICKUP';

  return (
    <header className="sticky top-0 z-40 bg-[#F3EDE2]/95 dark:bg-[#24201D]/95 backdrop-blur-md border-b border-[#E2D9CC] dark:border-[#38312C] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#D9532F] to-[#D48B28] dark:from-[#E56B48] dark:to-[#E5A642] flex items-center justify-center text-white shadow-md shadow-[#D9532F]/20 shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-[#231C18] dark:text-[#F5EFEB] font-sans truncate">
                  Foodie<span className="text-[#D9532F] dark:text-[#E56B48]">Flow</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold bg-[#D48B28]/15 dark:bg-[#E5A642]/15 text-[#D48B28] dark:text-[#E5A642] border border-[#D48B28]/30 dark:border-[#E5A642]/30 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D9532F] fill-[#D9532F] dark:text-[#E56B48] dark:fill-[#E56B48]" />
                  <span>Cafeteria</span>
                </span>
              </div>
              <p className="text-xs text-[#685D55] dark:text-[#A99F98] hidden sm:block truncate">
                Express Cafeteria Ordering • Skip the Rush Hour Queue
              </p>
            </div>
          </div>

          {/* Rush Hour Status Pill (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#2E6F40]/10 dark:bg-[#3E8A54]/15 border border-[#2E6F40]/25 dark:border-[#3E8A54]/30 px-3 py-1.5 rounded-full text-xs font-medium text-[#2E6F40] dark:text-[#3E8A54] shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75 dark:bg-[#3E8A54]"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E6F40] dark:bg-[#3E8A54]"></span>
            </span>
            <span>Kitchen Active</span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1 text-[#2E6F40] dark:text-[#3E8A54]">
              <Clock className="w-3.5 h-3.5" />
              Avg Prep: 7-10 mins
            </span>
          </div>

          {/* Right Actions: De-cluttered on Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Only: Order Tracker Pill */}
            <button
              onClick={() => openTracker()}
              type="button"
              className={`hidden md:flex p-2 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer items-center gap-1.5 border font-semibold text-xs ${
                activeOrders.length > 0
                  ? isReady
                    ? 'bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 border-[#2E6F40] dark:border-[#3E8A54] text-[#2E6F40] dark:text-[#3E8A54] ring-2 ring-[#2E6F40]/20 animate-pulse'
                    : 'bg-[#D48B28]/15 dark:bg-[#E5A642]/20 border-[#D48B28] dark:border-[#E5A642] text-[#D48B28] dark:text-[#E5A642]'
                  : orders.length > 0
                  ? 'bg-[#FBF8F2] dark:bg-[#161311] hover:bg-[#F3EDE2] dark:hover:bg-[#24201D] border-[#E2D9CC] dark:border-[#38312C] text-[#231C18] dark:text-[#F5EFEB] shadow-2xs'
                  : 'text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] hover:bg-[#E2D9CC]/30 dark:hover:bg-[#38312C]/30 border-transparent'
              }`}
              title="Track Order Status & View Past Receipts"
            >
              {activeOrders.length > 0 ? (
                isReady ? (
                  <>
                    <Bell className="w-4 h-4 text-[#2E6F40] dark:text-[#3E8A54] animate-bounce" />
                    <span className="font-bold text-[#2E6F40] dark:text-[#3E8A54]">
                      {activeOrder.tokenNumber || 'Token'}: Ready!
                    </span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642] fill-[#D48B28]" />
                    <span className="font-bold text-[#D48B28] dark:text-[#E5A642]">
                      {activeOrder.tokenNumber || 'Token'}: Prep
                    </span>
                  </>
                )
              ) : (
                <>
                  <Clock className="w-4 h-4 text-[#685D55] dark:text-[#A99F98]" />
                  <span>My Orders</span>
                  {orders.length > 0 && (
                    <span className="bg-[#E2D9CC] dark:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Staff Access */}
            {onStaffLoginClick && (
              <button
                onClick={onStaffLoginClick}
                type="button"
                className="hidden sm:flex p-2 sm:px-2.5 sm:py-2 text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] hover:bg-[#E2D9CC]/30 dark:hover:bg-[#38312C]/30 rounded-xl transition-all cursor-pointer items-center gap-1"
                title="Kitchen & Admin Console"
              >
                <Lock className="w-3.5 h-3.5 text-[#685D55] dark:text-[#A99F98]" />
                <span className="text-xs font-semibold text-[#685D55] dark:text-[#A99F98] hidden sm:inline">Staff</span>
              </button>
            )}

            {/* Dark, Light & System Theme Toggle Button */}
            <ThemeToggle compact={true} />

            {/* Cart Button */}
            <button
              onClick={openCart}
              type="button"
              className="group relative flex items-center gap-1.5 sm:gap-2.5 bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#EE7A58] text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium shadow-md shadow-[#D9532F]/20 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#231C18] dark:bg-[#F5EFEB] text-white dark:text-[#161311] text-[10px] sm:text-[11px] font-black h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center border-2 border-[#F3EDE2] dark:border-[#24201D] shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-white/80 leading-none hidden sm:block">
                  My Tray
                </div>
                <div className="text-xs sm:text-sm font-black leading-tight tabular-nums">
                  {formatINR(subtotal)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
