import React from 'react';
import { CheckCircle2, Clock, MapPin, Receipt, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { formatINR } from '../../utils/formatters';
import { downloadOrderReceipt } from '../../utils/receiptDownloader';

export const OrderReceipt = () => {
  const { completedOrder, clearCompletedOrder } = useCart();
  const { openTracker } = useOrders();

  if (!completedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#161311]/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#F3EDE2] dark:bg-[#24201D] rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2D9CC] dark:border-[#38312C] my-auto animate-fade-in transition-colors duration-200">
        {/* Success Header Banner */}
        <div className="bg-gradient-to-r from-[#2E6F40] to-[#3E8A54] text-[#F5EFEB] p-4 sm:p-6 text-center relative shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#F5EFEB]" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black">
            Order Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-[#F5EFEB]/90 mt-0.5">
            Sent to Cafeteria Kitchen. Please show your token at the counter.
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Highlighted Token Pill */}
          <div className="bg-[#D48B28]/10 dark:bg-[#E5A642]/10 border-2 border-dashed border-[#D48B28]/50 dark:border-[#E5A642]/50 rounded-2xl p-4 sm:p-5 text-center">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D48B28] dark:text-[#E5A642] block mb-1">
              Pickup Token Number
            </span>
            <div className="text-3xl sm:text-5xl font-black text-[#231C18] dark:text-[#F5EFEB] tracking-tight font-mono">
              {completedOrder.tokenNumber}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#D48B28] dark:text-[#E5A642] font-semibold mt-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D48B28] dark:text-[#E5A642]" />
              <span>
                Estimated Prep: ~{completedOrder.estimatedWaitMinutes || 10} minutes
              </span>
            </div>
          </div>

          {/* Kitchen Status Tracker */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
              Live Preparation Tracker
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border border-[#2E6F40]/40 dark:border-[#3E8A54]/40 rounded-xl p-2.5">
                <div className="w-2 h-2 rounded-full bg-[#2E6F40] dark:bg-[#3E8A54] mx-auto mb-1"></div>
                1. Order Placed
              </div>
              <div className="bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] border border-[#D48B28]/40 dark:border-[#E5A642]/40 rounded-xl p-2.5 relative">
                <span className="animate-ping absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-[#D48B28] opacity-75"></span>
                <div className="w-2 h-2 rounded-full bg-[#D48B28] dark:bg-[#E5A642] mx-auto mb-1"></div>
                2. Kitchen Prep
              </div>
              <div className="bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl p-2.5">
                <div className="w-2 h-2 rounded-full bg-[#E2D9CC] dark:bg-[#38312C] mx-auto mb-1"></div>
                3. Ready for Pickup
              </div>
            </div>
          </div>

          {/* Order Summary Details */}
          <div className="bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl p-4 space-y-3 text-xs border border-[#E2D9CC] dark:border-[#38312C]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D9CC] dark:border-[#38312C]">
              <span className="font-semibold text-[#685D55] dark:text-[#A99F98]">Student Name</span>
              <span className="font-bold text-[#231C18] dark:text-[#F5EFEB]">
                {completedOrder.customerName} ({completedOrder.studentId})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D9CC] dark:border-[#38312C]">
              <span className="font-semibold text-[#685D55] dark:text-[#A99F98]">Pickup Counter</span>
              <span className="font-bold text-[#231C18] dark:text-[#F5EFEB] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48]" />
                Counter #2 (Express Pickup)
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D9CC] dark:border-[#38312C]">
              <span className="font-semibold text-[#685D55] dark:text-[#A99F98]">Order Reference</span>
              <span className="font-mono text-[#685D55] dark:text-[#A99F98]">
                {completedOrder.orderId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-black pt-1 text-[#231C18] dark:text-[#F5EFEB]">
              <span>Total Paid via Razorpay</span>
              <span className="text-[#D9532F] dark:text-[#E56B48] tabular-nums">
                {formatINR(completedOrder.amount)}
              </span>
            </div>
          </div>

          {/* Receipt Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => downloadOrderReceipt(completedOrder.orderId, true)}
              className="flex items-center justify-center gap-1.5 bg-[#D9532F]/10 dark:bg-[#E56B48]/15 hover:bg-[#D9532F]/20 dark:hover:bg-[#E56B48]/25 text-[#D9532F] dark:text-[#E56B48] border border-[#D9532F]/30 dark:border-[#E56B48]/30 font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48]" />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={() => downloadOrderReceipt(completedOrder.orderId, false)}
              className="flex items-center justify-center gap-1.5 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer"
            >
              <span>Print / PDF</span>
            </button>
          </div>

          {/* Primary Action: Live Tracker */}
          <button
            onClick={() => {
              const ordId = completedOrder.orderId;
              clearCompletedOrder();
              openTracker(ordId);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D9532F] to-[#D48B28] hover:from-[#C24522] hover:to-[#B8731F] dark:from-[#E56B48] dark:to-[#E5A642] text-[#FBF8F2] font-black py-3.5 px-4 rounded-xl shadow-lg shadow-[#D9532F]/20 dark:shadow-[#E56B48]/20 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Track Live Kitchen Preparation</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Action Button */}
          <button
            onClick={clearCompletedOrder}
            className="w-full flex items-center justify-center gap-2 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#685D55] dark:text-[#A99F98] border border-[#E2D9CC] dark:border-[#38312C] font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs"
          >
            <span>Back to Menu / Order More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
