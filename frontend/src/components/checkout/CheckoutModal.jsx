import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  CreditCard,
  Clock,
  MessageSquare,
  AlertCircle,
  Phone,
  Hash,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { formatINR } from '../../utils/formatters';
import { apiUrl } from '../../utils/api';
import { RazorpayPaymentModal } from './RazorpayPaymentModal';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    items,
    subtotal,
    tax,
    grandTotal,
    estimatedPrepMinutes,
    clearCart,
    setCompletedOrder,
  } = useCart();
  const { addOrder } = useOrders();

  // Pure empty user fields - no hardcoded test case data
  const [formData, setFormData] = useState({
    customerName: '',
    studentId: '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentRzpData, setCurrentRzpData] = useState(null);

  if (!isCheckoutOpen && !showPaymentModal) return null;

  // Real-time compulsory field validation
  const validateField = (name, value) => {
    let error = '';
    const cleanVal = (value || '').trim();

    if (name === 'customerName') {
      if (!cleanVal) {
        error = 'Full Name is compulsory for pickup';
      } else if (cleanVal.length < 2) {
        error = 'Full Name must be at least 2 characters';
      }
    } else if (name === 'studentId') {
      if (!cleanVal) {
        error = 'Roll / Student ID is compulsory';
      } else if (cleanVal.length < 2) {
        error = 'Student ID must be at least 2 characters';
      }
    } else if (name === 'phone') {
      const digitsOnly = cleanVal.replace(/[\s\-\+]/g, '');
      if (!digitsOnly) {
        error = '10-digit Mobile Number is compulsory for SMS / pickup';
      } else if (!/^[0-9]{10}$/.test(digitsOnly)) {
        error = 'Must be a valid 10-digit mobile number';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Verify all compulsory fields before initiating payment
    const newErrors = {
      customerName: validateField('customerName', formData.customerName),
      studentId: validateField('studentId', formData.studentId),
      phone: validateField('phone', formData.phone),
    };

    setTouched({
      customerName: true,
      studentId: true,
      phone: true,
    });

    if (newErrors.customerName || newErrors.studentId || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on FastAPI backend
      const orderPayload = {
        customerName: formData.customerName.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        phone: formData.phone.trim().replace(/[\s\-\+]/g, ''),
        notes: formData.notes.trim(),
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await fetch(apiUrl('/api/v1/orders/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Could not create order on server');
      }

      const order = await orderRes.json();
      const internalOrderId = order.orderId;

      // 2. Generate Razorpay Order
      const rzpRes = await fetch(apiUrl('/api/v1/payments/create-razorpay-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: internalOrderId }),
      });

      if (!rzpRes.ok) {
        throw new Error('Failed to create Razorpay payment order');
      }

      const rzpData = await rzpRes.json();

      // 3. Open dedicated Razorpay Payment Page
      setCurrentOrder(order);
      setCurrentRzpData(rzpData);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.message || 'Please check your order details.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (confirmedOrder) => {
    addOrder(confirmedOrder);
    clearCart();
    setShowPaymentModal(false);
    closeCheckout();
    setCompletedOrder(confirmedOrder);
  };

  if (showPaymentModal && currentOrder && currentRzpData) {
    return (
      <RazorpayPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={currentOrder}
        rzpOrderData={currentRzpData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (!isCheckoutOpen) return null;

  const hasErrors =
    (touched.customerName && errors.customerName) ||
    (touched.studentId && errors.studentId) ||
    (touched.phone && errors.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#161311]/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#F3EDE2] dark:bg-[#24201D] rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2D9CC] dark:border-[#38312C] my-auto animate-fade-in transition-colors duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between bg-[#F3EDE2] dark:bg-[#24201D] shrink-0">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9532F] dark:text-[#E56B48] block">
              Express Cafeteria Checkout
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#231C18] dark:text-[#F5EFEB]">
              Student & Order Details
            </h2>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 text-[#685D55] hover:text-[#231C18] dark:text-[#A99F98] dark:hover:text-[#F5EFEB] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C]/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCheckout} noValidate className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[78vh]">
          {/* Rush Hour Notice */}
          <div className="flex items-center gap-2 p-3 bg-[#D48B28]/10 dark:bg-[#E5A642]/10 border border-[#D48B28]/30 dark:border-[#E5A642]/30 rounded-xl text-[#D48B28] dark:text-[#E5A642] text-xs">
            <Clock className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642] shrink-0" />
            <span>
              Peak hour queue active. Est. preparation window: <strong>~{estimatedPrepMinutes} mins</strong>.
            </span>
          </div>

          {/* Validation Banner if user tried to submit with missing info */}
          {hasErrors && (
            <div className="flex items-center gap-2 p-2.5 bg-[#B83226]/10 dark:bg-[#D9483B]/10 border border-[#B83226]/30 dark:border-[#D9483B]/30 rounded-xl text-[#B83226] dark:text-[#D9483B] text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-[#B83226] dark:text-[#D9483B] shrink-0" />
              <span>Please fill in all compulsory order details marked with * below.</span>
            </div>
          )}

          {/* 1. Student Full Name (Compulsory) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB]">
                Full Name <span className="text-[#B83226] dark:text-[#D9483B] font-black">*</span>
              </label>
              <span className="text-[10px] font-bold text-[#B83226] dark:text-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/15 border border-[#B83226]/20 dark:border-[#D9483B]/30 px-1.5 py-0.2 rounded-md">
                Compulsory
              </span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  touched.customerName && errors.customerName
                    ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10 focus:ring-[#B83226]/20 focus:border-[#B83226]'
                    : 'border-[#E2D9CC] dark:border-[#38312C] focus:ring-[#D9532F]/25 dark:focus:ring-[#E56B48]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]'
                }`}
              />
            </div>
            {touched.customerName && errors.customerName && (
              <p className="text-[11px] text-[#B83226] dark:text-[#D9483B] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#B83226] dark:text-[#D9483B]" />
                {errors.customerName}
              </p>
            )}
          </div>

          {/* 2. Roll No & Phone (Both Compulsory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student / Roll ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB]">
                  Roll / Student ID <span className="text-[#B83226] dark:text-[#D9483B] font-black">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#B83226] dark:text-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/15 border border-[#B83226]/20 dark:border-[#D9483B]/30 px-1.5 py-0.2 rounded-md">
                  Compulsory
                </span>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. CS-2024-102"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 text-sm font-mono uppercase transition-all focus:outline-hidden focus:ring-2 ${
                    touched.studentId && errors.studentId
                      ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10 focus:ring-[#B83226]/20 focus:border-[#B83226]'
                      : 'border-[#E2D9CC] dark:border-[#38312C] focus:ring-[#D9532F]/25 dark:focus:ring-[#E56B48]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]'
                  }`}
                />
              </div>
              {touched.studentId && errors.studentId && (
                <p className="text-[11px] text-[#B83226] dark:text-[#D9483B] font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#B83226] dark:text-[#D9483B]" />
                  {errors.studentId}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB]">
                  Mobile Number <span className="text-[#B83226] dark:text-[#D9483B] font-black">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#B83226] dark:text-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/15 border border-[#B83226]/20 dark:border-[#D9483B]/30 px-1.5 py-0.2 rounded-md">
                  Compulsory
                </span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit number"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 text-sm font-mono transition-all focus:outline-hidden focus:ring-2 ${
                    touched.phone && errors.phone
                      ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10 focus:ring-[#B83226]/20 focus:border-[#B83226]'
                      : 'border-[#E2D9CC] dark:border-[#38312C] focus:ring-[#D9532F]/25 dark:focus:ring-[#E56B48]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-[#B83226] dark:text-[#D9483B] font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#B83226] dark:text-[#D9483B]" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* 3. Special Kitchen Notes (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                Kitchen Instructions
              </label>
              <span className="text-[10px] font-medium text-[#685D55] dark:text-[#A99F98]">
                Optional
              </span>
            </div>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-3" />
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Less spicy, keep chutney separate, extra napkins..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 dark:focus:ring-[#E56B48]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]"
              />
            </div>
          </div>

          {/* Order Financial Summary Box */}
          <div className="bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#685D55] dark:text-[#A99F98]">
              <span>Tray Items ({items.length})</span>
              <span className="font-semibold text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
                {formatINR(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-[#685D55] dark:text-[#A99F98]">
              <span>Cafeteria GST & Packaging (5%)</span>
              <span className="font-semibold text-[#231C18] dark:text-[#F5EFEB] tabular-nums">
                {formatINR(tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#231C18] dark:text-[#F5EFEB] pt-2 border-t border-[#E2D9CC] dark:border-[#38312C]">
              <span>Total Payable</span>
              <span className="text-[#D9532F] dark:text-[#E56B48] tabular-nums">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] text-[#FBF8F2] font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#D9532F]/20 dark:shadow-[#E56B48]/20 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {submitting ? 'Verifying & Creating Order...' : `Proceed to Pay ${formatINR(grandTotal)}`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#685D55] dark:text-[#A99F98] mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F40] dark:text-[#3E8A54]" />
              <span>Compulsory details ensure accurate token callout at Counter #2</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
