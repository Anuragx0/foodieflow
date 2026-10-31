import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { formatINR } from './utils/formatters';
import { Navbar } from './components/common/Navbar';
import { ThemeToggle } from './components/common/ThemeToggle';
import { CategoryFilter } from './components/menu/CategoryFilter';
import { MenuGrid } from './components/menu/MenuGrid';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderReceipt } from './components/checkout/OrderReceipt';
import { OrderTrackerModal } from './components/orders/OrderTrackerModal';
import { ActiveOrderBanner } from './components/orders/ActiveOrderBanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import {
  Utensils,
  Heart,
  Shield,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react';
import './App.css';

export function FoodieFlowApp() {
  const [currentView, setCurrentView] = useState('student'); // 'student' | 'kitchen'
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    () => !!localStorage.getItem('foodieflow_admin_token')
  );

  const { totalItemsCount, subtotal, openCart, isCartOpen } = useCart();

  // Check URL hash for direct links (e.g. #admin, #database)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#database') {
        const hasToken = !!localStorage.getItem('foodieflow_admin_token');
        if (hasToken) {
          setCurrentView('kitchen');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else {
        setCurrentView('student');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleAdminLoginSuccess = (token) => {
    setAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setCurrentView('kitchen');
    window.location.hash = '#admin';
  };

  const handleSelectView = (view) => {
    if (view === 'kitchen' && !adminAuthenticated) {
      setIsAdminLoginOpen(true);
      return;
    }
    setCurrentView(view);
    window.location.hash = view === 'student' ? '' : '#admin';
  };

  return (
    <div className="min-h-screen bg-[#FBF8F2] dark:bg-[#161311] flex flex-col font-sans text-[#231C18] dark:text-[#F5EFEB] antialiased selection:bg-[#D9532F] selection:text-white dark:selection:bg-[#E56B48] overflow-x-hidden transition-colors duration-200">
      {/* VIEW 1: KITCHEN STAFF (ADMIN & DB PORTAL) */}
      {currentView === 'kitchen' && (
        <AdminDashboard onLogout={() => handleSelectView('student')} />
      )}

      {/* VIEW 2: STUDENT STOREFRONT */}
      {currentView === 'student' && (
        <>
          <Navbar onStaffLoginClick={() => handleSelectView('kitchen')} />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryFilter />
            <MenuGrid />
          </main>

          <CartDrawer />
          <CheckoutModal />
          <OrderReceipt />
          <OrderTrackerModal />
          <ActiveOrderBanner />

          {/* Floating Mobile Sticky Tray Bar */}
          {totalItemsCount > 0 && !isCartOpen && (
            <div className="fixed bottom-4 inset-x-3 sm:hidden z-30 animate-fade-in">
              <button
                onClick={openCart}
                className="w-full bg-[#24201D]/95 hover:bg-[#24201D] text-[#F5EFEB] rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-[#38312C] backdrop-blur-md active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#D9532F] dark:bg-[#E56B48] text-white text-xs font-black flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                  <span className="text-xs font-bold text-[#F5EFEB]">
                    {totalItemsCount === 1 ? '1 item' : `${totalItemsCount} items`} • {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#D48B28] dark:text-[#E5A642] font-bold text-xs">
                  <span>View Tray</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-[#E2D9CC] dark:border-[#38312C] bg-[#F3EDE2] dark:bg-[#24201D] py-10 mt-auto transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs text-[#685D55] dark:text-[#A99F98]">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-[#231C18] dark:text-[#F5EFEB] font-extrabold text-base">
                    <div className="w-6 h-6 rounded-lg bg-[#D9532F] dark:bg-[#E56B48] text-white flex items-center justify-center shadow-xs">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <span>FoodieFlow</span>
                  </div>
                  <p className="max-w-md text-[#685D55] dark:text-[#A99F98] leading-relaxed">
                    Smart campus cafeteria ordering system engineered for high-concurrency peak rush hours.
                    Pre-order from your smartphone, pay with instant Razorpay UPI, and pick up your meal
                    by token number with zero line waiting.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#231C18] dark:text-[#F5EFEB] uppercase tracking-wider text-[11px]">
                    Cafeteria Timings
                  </h4>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D48B28] dark:text-[#E5A642]" />
                      Breakfast: 08:00 AM – 11:00 AM
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D48B28] dark:text-[#E5A642]" />
                      Lunch Rush: 12:00 PM – 03:30 PM
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D48B28] dark:text-[#E5A642]" />
                      Snacks & Tea: 04:00 PM – 07:30 PM
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#231C18] dark:text-[#F5EFEB] uppercase tracking-wider text-[11px]">
                    Full-Stack Stack
                  </h4>
                  <ul className="space-y-1 text-[#685D55] dark:text-[#A99F98]">
                    <li>• Frontend: React 19 + Tailwind v4</li>
                    <li>• Backend: FastAPI (Python Async)</li>
                    <li>• Database: Embedded SQLite3</li>
                    <li>• Payments: Razorpay Gateway</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E2D9CC] dark:border-[#38312C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#685D55] dark:text-[#A99F98]">
                <p>© 2026 FoodieFlow Cafeteria Platform. All rights reserved.</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="flex items-center gap-1">
                    Built with <Heart className="w-3 h-3 text-[#B83226] fill-[#B83226]" /> for campus students & faculty
                  </p>
                  <ThemeToggle showLabel={true} />
                  <button
                    type="button"
                    onClick={() => handleSelectView('kitchen')}
                    className="inline-flex items-center gap-1 text-[11px] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Staff Portal</span>
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MenuProvider>
        <CartProvider>
          <OrderProvider>
            <FoodieFlowApp />
          </OrderProvider>
        </CartProvider>
      </MenuProvider>
    </ThemeProvider>
  );
}
