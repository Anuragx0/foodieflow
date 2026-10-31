import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  PackageCheck,
  Receipt,
  Search,
  ArrowRight,
  MapPin,
  Flame,
  History,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { formatINR } from '../../utils/formatters';
import { downloadOrderReceipt } from '../../utils/receiptDownloader';

export const OrderTrackerModal = () => {
  const {
    orders,
    activeOrders,
    completedOrders,
    selectedOrder,
    setSelectedOrderId,
    isTrackerOpen,
    closeTracker,
    lookupOrder,
    removeOrder,
    fetchOrderStatus,
    updateOrderStatus,
  } = useOrders();

  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history' | 'lookup'
  const [lookupInput, setLookupInput] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!isTrackerOpen) return null;

  // Helper to extract clean order progress status
  const getOrderStatus = (ord) => {
    if (!ord) return 'PAID';
    if (ord.orderStatus) return ord.orderStatus;
    if (ord.status && ord.status !== 'success') return ord.status;
    return 'PAID';
  };

  // Determine active step (1 to 4)
  const getStepNumber = (status) => {
    switch (status) {
      case 'PAID':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStatus = getOrderStatus(selectedOrder);
  const currentStep = getStepNumber(currentStatus);

  const handleRefresh = async () => {
    if (!selectedOrder) return;
    setRefreshing(true);
    try {
      const updated = await fetchOrderStatus(selectedOrder.orderId);
      if (updated) {
        updateOrderStatus(selectedOrder.orderId, updated);
      }
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    try {
      await lookupOrder(lookupInput.trim());
      setActiveTab('live');
      setLookupInput('');
    } catch (err) {
      setLookupError(err.message || 'Order not found. Please check the token number.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#161311]/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#231C18] dark:text-[#F5EFEB] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2D9CC] dark:border-[#38312C] my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between bg-[#F3EDE2] dark:bg-[#24201D] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] flex items-center justify-center shadow-md shadow-[#D9532F]/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#231C18] dark:text-[#F5EFEB]">
                  Order Status & Tracker
                </h2>
                {activeOrders.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] px-2 py-0.5 rounded-full border border-[#D48B28]/40 dark:border-[#E5A642]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D48B28] dark:bg-[#E5A642] animate-ping"></span>
                    {activeOrders.length} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#685D55] dark:text-[#A99F98]">
                Track live kitchen preparation & view pickup history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedOrder && activeTab === 'live' && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh Status"
                className="p-2 text-[#685D55] hover:text-[#D9532F] dark:text-[#A99F98] dark:hover:text-[#E56B48] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D9532F] dark:text-[#E56B48]' : ''}`} />
              </button>
            )}
            <button
              onClick={closeTracker}
              className="p-2 text-[#685D55] hover:text-[#231C18] dark:text-[#A99F98] dark:hover:text-[#F5EFEB] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2D9CC] dark:border-[#38312C] bg-[#F3EDE2] dark:bg-[#24201D] px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-[#D9532F] dark:border-[#E56B48] text-[#D9532F] dark:text-[#E56B48]'
                : 'border-transparent text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Tracker</span>
            {activeOrders.length > 0 && (
              <span className="bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#D9532F] dark:border-[#E56B48] text-[#D9532F] dark:text-[#E56B48]'
                : 'border-transparent text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Order History</span>
            <span className="bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'border-[#D9532F] dark:border-[#E56B48] text-[#D9532F] dark:text-[#E56B48]'
                : 'border-transparent text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track by Token</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-5">
          {/* ================= TAB 1: LIVE TRACKER ================= */}
          {activeTab === 'live' && (
            <>
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Multiple Active Orders Switcher */}
                  {orders.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <span className="text-[#685D55] dark:text-[#A99F98] font-bold text-[11px] shrink-0">Orders:</span>
                      {orders.map((ord) => {
                        const isCurrent = ord.orderId === selectedOrder.orderId;
                        const ordStatus = getOrderStatus(ord);
                        const isDone = ordStatus === 'COMPLETED';
                        return (
                          <button
                            key={ord.orderId}
                            onClick={() => setSelectedOrderId(ord.orderId)}
                            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isCurrent
                                ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] border-[#D9532F] dark:border-[#E56B48] shadow-xs'
                                : isDone
                                ? 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C]'
                                : 'bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] border-[#D48B28]/40 dark:border-[#E5A642]/40 hover:bg-[#D48B28]/25'
                            }`}
                          >
                            <span>{ord.tokenNumber || ord.orderId.slice(-6)}</span>
                            {isDone ? (
                              <span className="text-[10px] opacity-80">(Picked Up)</span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D48B28] dark:bg-[#E5A642] animate-ping"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Token & Counter Hero Card */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 border-2 text-center transition-all ${
                      currentStatus === 'READY_FOR_PICKUP'
                        ? 'bg-[#2E6F40]/10 dark:bg-[#3E8A54]/15 border-[#2E6F40]/50 dark:border-[#3E8A54]/50 shadow-md shadow-[#2E6F40]/10'
                        : currentStatus === 'COMPLETED'
                        ? 'bg-[#FAF5EC] dark:bg-[#2E2925] border-[#E2D9CC] dark:border-[#38312C]'
                        : 'bg-[#FAF5EC] dark:bg-[#2E2925] border-[#E2D9CC] dark:border-[#38312C]'
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#685D55] dark:text-[#A99F98] block mb-0.5">
                      Cafeteria Pickup Token
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-[#231C18] dark:text-[#F5EFEB] tracking-tight font-mono">
                      {selectedOrder.tokenNumber || (selectedOrder.orderId ? selectedOrder.orderId.slice(-6).toUpperCase() : '')}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-2 text-xs font-semibold text-[#231C18] dark:text-[#F5EFEB]">
                      <span className="flex items-center gap-1 bg-[#F3EDE2] dark:bg-[#24201D] px-2.5 py-1 rounded-full border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48]" />
                        Counter #2 (Express Pickup)
                      </span>
                      <span className="text-[#685D55] dark:text-[#A99F98]">•</span>
                      <span className="text-[#685D55] dark:text-[#A99F98] font-mono text-[11px]">
                        Ref: {selectedOrder.orderId}
                      </span>
                    </div>

                    {/* Dynamic High-Contrast Status Message */}
                    <div className="mt-3">
                      {currentStatus === 'PAID' && (
                        <div className="inline-flex items-center gap-2 bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] border border-[#D48B28]/40 dark:border-[#E5A642]/40 px-3 py-1.5 rounded-xl text-xs font-bold">
                          <Clock className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642]" />
                          <span>Order Confirmed • Queued for Kitchen Chef</span>
                        </div>
                      )}
                      {currentStatus === 'PREPARING' && (
                        <div className="inline-flex items-center gap-2 bg-[#D48B28]/20 dark:bg-[#E5A642]/25 text-[#D48B28] dark:text-[#E5A642] border border-[#D48B28]/50 dark:border-[#E5A642]/50 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                          <Flame className="w-4 h-4 text-[#D48B28] fill-[#D48B28] dark:text-[#E5A642] dark:fill-[#E5A642]" />
                          <span>Chef is Cooking Your Meal • Est. ~5-8 mins</span>
                        </div>
                      )}
                      {currentStatus === 'READY_FOR_PICKUP' && (
                        <div className="inline-flex items-center gap-2 bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#2E6F40]/30 animate-bounce">
                          <Bell className="w-4 h-4" />
                          <span>DING! FOOD IS READY AT COUNTER #2!</span>
                        </div>
                      )}
                      {currentStatus === 'COMPLETED' && (
                        <div className="inline-flex items-center gap-2 bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border border-[#2E6F40]/40 dark:border-[#3E8A54]/40 px-3 py-1.5 rounded-xl text-xs font-bold">
                          <PackageCheck className="w-4 h-4 text-[#2E6F40] dark:text-[#3E8A54]" />
                          <span>Order Picked Up • Enjoy Your Meal!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Visual Progress Stepper */}
                  <div className="bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl p-4 sm:p-5 border border-[#E2D9CC] dark:border-[#38312C] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#231C18] dark:text-[#F5EFEB]">
                      <span>Preparation Progress</span>
                      <span className="text-[#D9532F] dark:text-[#E56B48]">
                        Step {currentStep} of 4 ({Math.round((currentStep / 4) * 100)}%)
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-[#E2D9CC] dark:bg-[#38312C] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D9532F] to-[#2E6F40] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      ></div>
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-4 gap-1 pt-1 text-center">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 1
                              ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] shadow-xs'
                              : 'bg-[#E2D9CC] dark:bg-[#38312C] text-[#685D55] dark:text-[#A99F98]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#231C18] dark:text-[#F5EFEB] mt-1">
                          1. Placed
                        </span>
                        <span className="text-[9px] text-[#685D55] dark:text-[#A99F98] hidden sm:block">
                          Paid & Queued
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep > 2
                              ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB]'
                              : currentStep === 2
                              ? 'bg-[#D48B28] dark:bg-[#E5A642] text-[#F5EFEB] ring-4 ring-[#D48B28]/25 animate-pulse'
                              : 'bg-[#E2D9CC] dark:bg-[#38312C] text-[#685D55] dark:text-[#A99F98]'
                          }`}
                        >
                          {currentStep > 2 ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <ChefHat className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#231C18] dark:text-[#F5EFEB] mt-1">
                          2. Preparing
                        </span>
                        <span className="text-[9px] text-[#685D55] dark:text-[#A99F98] hidden sm:block">
                          In Kitchen
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep > 3
                              ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB]'
                              : currentStep === 3
                              ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] ring-4 ring-[#2E6F40]/30 animate-bounce'
                              : 'bg-[#E2D9CC] dark:bg-[#38312C] text-[#685D55] dark:text-[#A99F98]'
                          }`}
                        >
                          {currentStep > 3 ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#231C18] dark:text-[#F5EFEB] mt-1">
                          3. Ready
                        </span>
                        <span className="text-[9px] text-[#685D55] dark:text-[#A99F98] hidden sm:block">
                          At Counter #2
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep === 4
                              ? 'bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] ring-4 ring-[#2E6F40]/30'
                              : 'bg-[#E2D9CC] dark:bg-[#38312C] text-[#685D55] dark:text-[#A99F98]'
                          }`}
                        >
                          <PackageCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#231C18] dark:text-[#F5EFEB] mt-1">
                          4. Picked Up
                        </span>
                        <span className="text-[9px] text-[#685D55] dark:text-[#A99F98] hidden sm:block">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl p-4 border border-[#E2D9CC] dark:border-[#38312C] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#231C18] dark:text-[#F5EFEB] pb-2 border-b border-[#E2D9CC] dark:border-[#38312C]">
                      <span>Ordered Dishes</span>
                      <span className="text-[#685D55] dark:text-[#A99F98]">
                        {selectedOrder.customerName} ({selectedOrder.studentId})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-[#231C18] dark:text-[#F5EFEB]"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#D9532F]/15 dark:bg-[#E56B48]/20 text-[#D9532F] dark:text-[#E56B48] font-bold text-[11px] flex items-center justify-center">
                                {item.quantity}×
                              </span>
                              <span className="font-semibold">
                                {item.menuItemName || item.name || 'Cafeteria Dish'}
                              </span>
                            </span>
                            <span className="font-bold tabular-nums text-[#231C18] dark:text-[#F5EFEB]">
                              {formatINR((item.price || 0) * (item.quantity || 1))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#685D55] dark:text-[#A99F98] italic">Dishes loaded with order reference</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between text-sm font-black text-[#231C18] dark:text-[#F5EFEB]">
                      <span>Total Paid via Razorpay</span>
                      <span className="text-[#D9532F] dark:text-[#E56B48] tabular-nums">
                        {formatINR(selectedOrder.amount || selectedOrder.grandTotal || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Download Receipt & Print */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => downloadOrderReceipt(selectedOrder.orderId, true)}
                      className="flex items-center justify-center gap-1.5 bg-[#D9532F]/10 dark:bg-[#E56B48]/15 hover:bg-[#D9532F]/20 dark:hover:bg-[#E56B48]/25 text-[#D9532F] dark:text-[#E56B48] border border-[#D9532F]/30 dark:border-[#E56B48]/30 font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48]" />
                      <span>Download Receipt</span>
                    </button>

                    <button
                      onClick={() => downloadOrderReceipt(selectedOrder.orderId, false)}
                      className="flex items-center justify-center gap-1.5 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer border border-[#E2D9CC] dark:border-[#38312C]"
                    >
                      <span>🖨️ Print / View PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state when no order is currently selected */
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#D9532F]/10 dark:bg-[#E56B48]/15 text-[#D9532F] dark:text-[#E56B48] flex items-center justify-center mx-auto">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#231C18] dark:text-[#F5EFEB]">
                    No Active Order Selected
                  </h3>
                  <p className="text-xs text-[#685D55] dark:text-[#A99F98] max-w-sm mx-auto">
                    You have no active orders in preparation right now. Look up a token or view your past orders history below.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('lookup')}
                      className="bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] text-[#FBF8F2] text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Track with Token
                    </button>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setActiveTab('history')}
                        className="bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] border border-[#E2D9CC] dark:border-[#38312C] transition-colors cursor-pointer"
                      >
                        View Past Orders ({orders.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= TAB 2: ORDER HISTORY & PICKUPS ================= */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                    Your Orders On This Device
                  </h3>
                  <p className="text-[11px] text-[#685D55] dark:text-[#A99F98]">
                    Retained permanently so you can verify token & re-download receipts anytime
                  </p>
                </div>
                <span className="text-xs font-bold text-[#231C18] dark:text-[#F5EFEB] bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] px-2 py-0.5 rounded-full">
                  {orders.length} total
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl p-6 border border-[#E2D9CC] dark:border-[#38312C]">
                  <History className="w-8 h-8 text-[#685D55] dark:text-[#A99F98] mx-auto" />
                  <p className="text-xs font-bold text-[#231C18] dark:text-[#F5EFEB]">No order history recorded yet</p>
                  <p className="text-[11px] text-[#685D55] dark:text-[#A99F98]">
                    Orders placed on FoodieFlow are automatically saved here for quick pickup reference.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((order) => {
                    const ordStatus = getOrderStatus(order);
                    const isDone = ordStatus === 'COMPLETED';
                    const isReady = ordStatus === 'READY_FOR_PICKUP';
                    const isPrep = ordStatus === 'PREPARING';

                    return (
                      <div
                        key={order.orderId}
                        className={`rounded-2xl p-3.5 border transition-all ${
                          selectedOrder?.orderId === order.orderId
                            ? 'border-[#D9532F] dark:border-[#E56B48] bg-[#FAF5EC] dark:bg-[#2E2925] ring-2 ring-[#D9532F]/25 dark:ring-[#E56B48]/25'
                            : 'border-[#E2D9CC] dark:border-[#38312C] bg-[#FAF5EC] dark:bg-[#2E2925] hover:border-[#D48B28]/40 dark:hover:border-[#E5A642]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-[#231C18] dark:text-[#F5EFEB] font-mono">
                                {order.tokenNumber || (order.orderId ? order.orderId.slice(-6).toUpperCase() : '')}
                              </span>
                              {/* Status Badge */}
                              {isDone && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] px-2 py-0.5 rounded-full border border-[#2E6F40]/40 dark:border-[#3E8A54]/40">
                                  <CheckCircle2 className="w-3 h-3 text-[#2E6F40] dark:text-[#3E8A54]" />
                                  <span>Picked Up</span>
                                </span>
                              )}
                              {isReady && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#2E6F40] dark:bg-[#3E8A54] text-[#F5EFEB] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                                  <Bell className="w-3 h-3" />
                                  <span>Ready at Counter #2!</span>
                                </span>
                              )}
                              {isPrep && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] px-2 py-0.5 rounded-full border border-[#D48B28]/40 dark:border-[#E5A642]/40">
                                  <Flame className="w-3 h-3 text-[#D48B28] dark:text-[#E5A642]" />
                                  <span>Kitchen Preparing</span>
                                </span>
                              )}
                              {ordStatus === 'PAID' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#D48B28]/10 dark:bg-[#E5A642]/15 text-[#D48B28] dark:text-[#E5A642] px-2 py-0.5 rounded-full border border-[#D48B28]/30 dark:border-[#E5A642]/30">
                                  <Clock className="w-3 h-3 text-[#D48B28] dark:text-[#E5A642]" />
                                  <span>Order Placed</span>
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#685D55] dark:text-[#A99F98] mt-0.5">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : 'Just now'} • Ref: {order.orderId}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-black text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
                              {formatINR(order.amount || order.grandTotal || 0)}
                            </div>
                            <span className="text-[10px] text-[#685D55] dark:text-[#A99F98] font-medium">
                              {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>

                        {/* Order Action Buttons */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E2D9CC] dark:border-[#38312C] text-xs">
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.orderId);
                              setActiveTab('live');
                            }}
                            className="font-bold text-[#D9532F] dark:text-[#E56B48] hover:text-[#C24522] dark:hover:text-[#F5EFEB] flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Live Stepper</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => downloadOrderReceipt(order.orderId, true)}
                              className="text-[#231C18] dark:text-[#F5EFEB] bg-[#F3EDE2] dark:bg-[#24201D] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer text-[11px] border border-[#E2D9CC] dark:border-[#38312C]"
                            >
                              <Receipt className="w-3 h-3 text-[#685D55] dark:text-[#A99F98]" />
                              <span>Receipt</span>
                            </button>
                            <button
                              onClick={() => removeOrder(order.orderId)}
                              title="Remove from history"
                              className="text-[#685D55] hover:text-[#B83226] dark:text-[#A99F98] dark:hover:text-[#D9483B] p-1 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: TRACK BY TOKEN ================= */}
          {activeTab === 'lookup' && (
            <div className="space-y-4">
              <div className="bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 text-xs text-[#231C18] dark:text-[#F5EFEB] space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[#D48B28] dark:text-[#E5A642]">
                  <Sparkles className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642]" />
                  Ordered from another phone or kiosk?
                </span>
                <p className="text-[#685D55] dark:text-[#A99F98]">
                  Enter your Token Number or Order ID (e.g. from your order receipt) to sync live kitchen status to this screen.
                </p>
              </div>

              <form onSubmit={handleLookup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1">
                    Token Number or Order ID
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lookupInput}
                      onChange={(e) => setLookupInput(e.target.value)}
                      placeholder="Enter Token Number or Order ID..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl text-sm font-semibold text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-none focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] uppercase placeholder:normal-case font-mono"
                      required
                    />
                  </div>
                </div>

                {lookupError && (
                  <div className="text-xs text-[#B83226] dark:text-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/15 border border-[#B83226]/30 dark:border-[#D9483B]/30 rounded-xl p-2.5">
                    {lookupError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] text-[#FBF8F2] font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 text-xs sm:text-sm"
                >
                  {lookupLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking Cafeteria Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find & Track Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
