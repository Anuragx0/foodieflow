import React, { useState } from 'react';
import { Clock, Bell, Flame, ArrowRight, ChevronDown, ChevronUp, MapPin, CheckCircle2 } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';

export const ActiveOrderBanner = () => {
  const {
    activeOrders,
    completedOrders,
    openTracker,
  } = useOrders();

  const { totalItemsCount } = useCart();
  const [isMinimized, setIsMinimized] = useState(false);

  // If no active orders currently awaiting preparation or pickup, do not render banner
  if (!activeOrders || activeOrders.length === 0) return null;

  const currentOrder = activeOrders[0];
  const orderStatus = currentOrder?.orderStatus || currentOrder?.status || 'PAID';
  const isReady = orderStatus === 'READY_FOR_PICKUP';
  const isPrep = orderStatus === 'PREPARING';
  const tokenDisplay =
    currentOrder.tokenNumber ||
    (currentOrder.orderId ? currentOrder.orderId.slice(-6).toUpperCase() : 'TOKEN');

  // Position smartly so it doesn't overlap the floating mobile cart tray
  const bottomPosition = totalItemsCount > 0
    ? 'bottom-20 sm:bottom-6'
    : 'bottom-3 sm:bottom-6';

  return (
    <aside
      aria-label="Live Cafeteria Order Tracking"
      className={`fixed ${bottomPosition} left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-35 animate-fade-in transition-all duration-300`}
    >
      <div
        className={`rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-200 overflow-hidden ${
          isReady
            ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] border-[#2E6F40] dark:border-[#3E8A54] shadow-[#2E6F40]/35 ring-2 ring-[#2E6F40]/40 animate-pulse'
            : 'bg-[#24201D]/95 text-[#F5EFEB] border-[#38312C] shadow-[#161311]/60'
        }`}
      >
        {/* Minimized Docked Pill View (Ensures persistent visibility until meal is picked up) */}
        {isMinimized ? (
          <div className="p-2.5 px-3.5 flex items-center justify-between gap-2.5">
            <button
              onClick={() => openTracker(currentOrder.orderId)}
              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isReady ? 'bg-[#FBF8F2] text-[#2E6F40]' : 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2]'
                }`}
              >
                {isReady ? (
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                ) : isPrep ? (
                  <Flame className="w-3.5 h-3.5 text-[#E5A642] fill-[#E5A642]" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="font-mono font-black text-xs tracking-tight truncate">
                {tokenDisplay}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-white/20 shrink-0">
                {isReady ? 'READY!' : isPrep ? 'COOKING' : 'PLACED'}
              </span>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => openTracker(currentOrder.orderId)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/20 hover:bg-white/30 text-[#F5EFEB] transition-all cursor-pointer"
              >
                Track
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 text-white/70 hover:text-white rounded-lg cursor-pointer"
                title="Expand live order details"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Banner View */
          <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
            {/* Left: Status Icon + Token + Info */}
            <button
              onClick={() => openTracker(currentOrder.orderId)}
              className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isReady
                    ? 'bg-[#FBF8F2] text-[#2E6F40] shadow-inner'
                    : 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
                }`}
              >
                {isReady ? (
                  <Bell className="w-5 h-5 animate-bounce" />
                ) : isPrep ? (
                  <Flame className="w-5 h-5 text-[#E5A642] fill-[#E5A642]" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-sm sm:text-base tracking-tight">
                    {tokenDisplay}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-white/20">
                    {isReady
                      ? 'READY FOR PICKUP!'
                      : isPrep
                      ? 'COOKING IN KITCHEN'
                      : 'ORDER PLACED'}
                  </span>
                </div>
                <p className="text-xs text-[#F5EFEB]/90 truncate mt-0.5 flex items-center gap-1">
                  {isReady ? (
                    <>
                      <MapPin className="w-3 h-3 text-[#E5A642] shrink-0 inline" />
                      <span>Proceed to Counter #2 to collect meal</span>
                    </>
                  ) : isPrep ? (
                    'Chef preparing dishes in cafeteria kitchen'
                  ) : (
                    'Queued in kitchen order board'
                  )}
                </p>
              </div>
            </button>

            {/* Right: Track Action & Minimize Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => openTracker(currentOrder.orderId)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                  isReady
                    ? 'bg-[#FBF8F2] text-[#2E6F40] hover:bg-[#F3EDE2] shadow-xs'
                    : 'bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] text-[#FBF8F2] shadow-xs'
                }`}
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Collapse to compact bottom tracker until meal pickup"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
