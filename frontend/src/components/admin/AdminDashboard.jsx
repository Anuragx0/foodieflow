import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  BellRing,
  RotateCcw,
  LogOut,
  IndianRupee,
  ShoppingBag,
  Layers,
  Search,
  Filter,
  PackageCheck,
  AlertTriangle,
  Receipt,
  Download,
  Database,
  Plus,
  Edit3,
  Flame,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { downloadOrderReceipt } from '../../utils/receiptDownloader';
import { DatabaseInspector } from './DatabaseInspector';
import { DishModal } from './DishModal';
import { useMenu } from '../../context/MenuContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { SpicyBadge } from '../common/Badge';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'database'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeKitchenOrders: 0,
    readyForPickupOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');

  // Dish Add / Edit Modal state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Hook into student MenuContext so any staff menu modification syncs instantly to student storefront
  const { fetchMenu: refreshStudentMenu } = useMenu();

  const token =
    localStorage.getItem('foodieflow_admin_token') ||
    'foodieflow_admin_admin123_session';

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/admin/stats', {
        headers: { Authorization: token },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Failed to fetch stats', e);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === 'ALL'
          ? '/api/v1/admin/orders'
          : `/api/v1/admin/orders?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: token },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.warn('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/v1/menu');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMenuItems(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch menu items', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchMenuItems();

    // Auto-poll orders every 8 seconds for real-time kitchen board
    const interval = setInterval(() => {
      fetchStats();
      fetchOrders();
    }, 8000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleToggleStock = async (itemId, currentInStock) => {
    try {
      const res = await fetch(`/api/v1/admin/menu/${itemId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ inStock: !currentInStock }),
      });
      if (res.ok) {
        await fetchMenuItems();
        if (refreshStudentMenu) refreshStudentMenu();
      }
    } catch (e) {
      alert('Failed to update stock in database');
    }
  };

  const handleOpenAddDish = () => {
    setEditingItem(null);
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (item) => {
    setEditingItem(item);
    setIsDishModalOpen(true);
  };

  const handleDishSaveSuccess = async () => {
    await fetchMenuItems();
    if (refreshStudentMenu) refreshStudentMenu();
    fetchStats();
  };

  const filteredMenu = menuItems.filter(
    (item) =>
      !menuSearch ||
      item.title.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBF8F2] dark:bg-[#161311] text-[#231C18] dark:text-[#F5EFEB] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#F3EDE2]/95 dark:bg-[#24201D]/95 backdrop-blur-md border-b border-[#E2D9CC] dark:border-[#38312C] px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D9532F] to-[#D48B28] flex items-center justify-center text-[#FBF8F2] shadow-sm shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-[#231C18] dark:text-[#F5EFEB] tracking-tight truncate">
                Staff Portal & Kitchen Console
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border border-[#2E6F40]/30 dark:border-[#3E8A54]/40 px-2 py-0.5 rounded-full hidden xs:flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E6F40] dark:bg-[#3E8A54] animate-ping"></span>
                <span>Live Sync</span>
              </span>
            </div>
            <p className="text-xs text-[#685D55] dark:text-[#A99F98] hidden sm:block">
              Cafeteria Order Processing, Instant Menu Management & Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <button
            onClick={handleOpenAddDish}
            className="flex items-center gap-1.5 bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] active:scale-95 text-[#FBF8F2] text-xs font-bold px-3 sm:px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Food Item</span>
            <span className="sm:hidden">Add Dish</span>
          </button>

          <button
            onClick={() => {
              fetchStats();
              fetchOrders();
              fetchMenuItems();
            }}
            className="p-2 text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] hover:bg-[#FAF5EC] dark:hover:bg-[#2E2925] rounded-xl transition-colors cursor-pointer border border-[#E2D9CC] dark:border-[#38312C] bg-[#FAF5EC] dark:bg-[#2E2925]"
            title="Refresh Live Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#F3EDE2] dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48]" />
            <span className="hidden sm:inline">Student View</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-6 space-y-6">
        {/* KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#685D55] dark:text-[#A99F98] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                Today's Orders
              </span>
              <ShoppingBag className="w-4 h-4 text-[#685D55] dark:text-[#A99F98]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#231C18] dark:text-[#F5EFEB] font-mono">
              {stats.totalOrders}
            </div>
          </div>

          <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#685D55] dark:text-[#A99F98] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                Gross Revenue
              </span>
              <IndianRupee className="w-4 h-4 text-[#D9532F] dark:text-[#E56B48]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#D9532F] dark:text-[#E56B48] font-mono">
              {formatINR(stats.totalRevenue)}
            </div>
          </div>

          <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#685D55] dark:text-[#A99F98] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                Kitchen Preparing
              </span>
              <Flame className="w-4 h-4 text-[#D48B28] dark:text-[#E5A642]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#D48B28] dark:text-[#E5A642] font-mono">
              {stats.activeKitchenOrders}
            </div>
          </div>

          <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#685D55] dark:text-[#A99F98] mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
                Ready at Counter
              </span>
              <CheckCircle className="w-4 h-4 text-[#2E6F40] dark:text-[#3E8A54]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2E6F40] dark:text-[#3E8A54] font-mono">
              {stats.readyForPickupOrders}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E2D9CC] dark:border-[#38312C] pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
                : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#FAF5EC] dark:hover:bg-[#2E2925]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kitchen Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
                : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#FAF5EC] dark:hover:bg-[#2E2925]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Menu & Food Catalog ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
                : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#FAF5EC] dark:hover:bg-[#2E2925]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Live SQLite Database</span>
          </button>
        </div>

        {/* TAB 1: KITCHEN ORDER BOARD */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#231C18] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
                        : 'bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#FAF5EC] dark:hover:bg-[#2E2925]'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                )
              )}
            </div>

            {/* Orders Grid */}
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#F3EDE2] dark:bg-[#24201D] rounded-3xl border border-[#E2D9CC] dark:border-[#38312C] shadow-xs">
                <ChefHat className="w-12 h-12 text-[#685D55]/50 dark:text-[#A99F98]/50 mx-auto mb-2" />
                <h4 className="text-base font-bold text-[#231C18] dark:text-[#F5EFEB]">
                  No orders found in this status
                </h4>
                <p className="text-xs text-[#685D55] dark:text-[#A99F98] mt-1">
                  New orders from students will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => {
                  const statusBadges = {
                    PAID: 'bg-[#D48B28]/10 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] border-[#D48B28]/30 dark:border-[#E5A642]/40',
                    PREPARING: 'bg-[#D9532F]/10 dark:bg-[#E56B48]/20 text-[#D9532F] dark:text-[#E56B48] border-[#D9532F]/30 dark:border-[#E56B48]/40',
                    READY_FOR_PICKUP: 'bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border-[#2E6F40]/40 dark:border-[#3E8A54]/40 ring-2 ring-[#2E6F40]/20 dark:ring-[#3E8A54]/20',
                    COMPLETED: 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C]',
                  };

                  return (
                    <div
                      key={order.orderId}
                      className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#D48B28]/50 dark:hover:border-[#E5A642]/50 hover:shadow-md transition-all shadow-xs"
                    >
                      <div>
                        {/* Header: Token & Status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl sm:text-3xl font-black font-mono text-[#231C18] dark:text-[#F5EFEB] tracking-tight">
                            {order.tokenNumber}
                          </div>
                          <span
                            className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                              statusBadges[order.orderStatus] || statusBadges.PAID
                            }`}
                          >
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Customer Information (Compulsory User Details) */}
                        <div className="bg-[#FAF5EC] dark:bg-[#2E2925] rounded-xl p-3 border border-[#E2D9CC] dark:border-[#38312C] text-xs text-[#685D55] dark:text-[#A99F98] space-y-1 mb-3">
                          <div className="font-bold text-[#231C18] dark:text-[#F5EFEB] text-sm">
                            {order.customerName}
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-[#231C18] dark:text-[#F5EFEB]">ID: {order.studentId}</span>
                            <span className="font-mono text-[#231C18] dark:text-[#F5EFEB]">📞 {order.phone}</span>
                          </div>
                          {order.notes && (
                            <div className="text-[#D48B28] dark:text-[#E5A642] text-[11px] font-semibold bg-[#D48B28]/10 dark:bg-[#E5A642]/15 p-2 rounded-lg border border-[#D48B28]/30 dark:border-[#E5A642]/30 mt-1">
                              Note: {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="border-t border-[#E2D9CC] dark:border-[#38312C] pt-3 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-1">
                            Dishes Ordered:
                          </span>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-[#231C18] dark:text-[#F5EFEB]"
                            >
                              <span className="font-medium">
                                <strong className="text-[#D9532F] dark:text-[#E56B48] font-mono mr-1">
                                  {item.quantity}x
                                </strong>
                                {item.title}
                              </span>
                              <span className="text-[#685D55] dark:text-[#A99F98] font-mono text-[11px]">
                                {formatINR(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total & Kitchen Action Controls */}
                      <div className="pt-3 border-t border-[#E2D9CC] dark:border-[#38312C] flex flex-col gap-2.5">
                        <div className="flex justify-between text-xs font-bold text-[#685D55] dark:text-[#A99F98]">
                          <span>Total Paid:</span>
                          <span className="text-[#D9532F] dark:text-[#E56B48] font-mono text-sm">
                            {formatINR(order.amount)}
                          </span>
                        </div>

                        {/* Receipt Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => downloadOrderReceipt(order.orderId, true)}
                            title="Download Official Tax Receipt HTML"
                            className="flex items-center justify-center gap-1 bg-[#D9532F]/10 dark:bg-[#E56B48]/15 hover:bg-[#D9532F]/20 dark:hover:bg-[#E56B48]/25 text-[#D9532F] dark:text-[#E56B48] font-semibold py-1.5 px-2 rounded-xl text-[11px] transition-all cursor-pointer border border-[#D9532F]/30 dark:border-[#E56B48]/30"
                          >
                            <Download className="w-3 h-3 text-[#D9532F] dark:text-[#E56B48]" />
                            <span>Download Receipt</span>
                          </button>
                          <button
                            onClick={() => downloadOrderReceipt(order.orderId, false)}
                            title="Open printable tax receipt in new tab"
                            className="flex items-center justify-center gap-1 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#F3EDE2] dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] font-semibold py-1.5 px-2 rounded-xl text-[11px] transition-all cursor-pointer border border-[#E2D9CC] dark:border-[#38312C]"
                          >
                            <Receipt className="w-3 h-3 text-[#685D55] dark:text-[#A99F98]" />
                            <span>Print Receipt</span>
                          </button>
                        </div>

                        {/* Kitchen Workflow Buttons */}
                        {order.orderStatus === 'PAID' && (
                          <button
                            onClick={() =>
                              handleStatusChange(order.orderId, 'PREPARING')
                            }
                            className="w-full bg-[#D48B28] hover:bg-[#B8751E] dark:bg-[#E5A642] dark:hover:bg-[#D48B28] text-[#FBF8F2] dark:text-[#161311] font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Start Preparing</span>
                          </button>
                        )}

                        {order.orderStatus === 'PREPARING' && (
                          <button
                            onClick={() =>
                              handleStatusChange(order.orderId, 'READY_FOR_PICKUP')
                            }
                            className="w-full bg-[#2E6F40] hover:bg-[#255C34] dark:bg-[#3E8A54] dark:hover:bg-[#2E6F40] active:scale-98 text-[#FBF8F2] font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs animate-pulse"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Mark Ready for Pickup!</span>
                          </button>
                        )}

                        {order.orderStatus === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() =>
                              handleStatusChange(order.orderId, 'COMPLETED')
                            }
                            className="w-full bg-[#231C18] hover:bg-[#38312C] dark:bg-[#38312C] dark:hover:bg-[#4A413B] active:scale-98 text-[#FBF8F2] font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-[#2E6F40] dark:text-[#3E8A54]" />
                            <span>Handover & Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT & FOOD CATALOG */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dishes by name or category..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl text-xs text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/20 focus:border-[#D9532F] shadow-2xs"
                />
              </div>

              <button
                onClick={handleOpenAddDish}
                className="bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] active:scale-95 text-[#FBF8F2] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food or Beverage to Menu</span>
              </button>
            </div>

            {/* Menu Items Table */}
            <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] uppercase tracking-wider font-bold border-b border-[#E2D9CC] dark:border-[#38312C]">
                    <tr>
                      <th className="p-4">Dish</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Dietary</th>
                      <th className="p-4">Prep & Calories</th>
                      <th className="p-4 text-center">Kitchen Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D9CC] dark:divide-[#38312C]">
                    {filteredMenu.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-[#685D55] dark:text-[#A99F98]">
                          No menu items found. Click "+ Add Food Item" to add your first dish!
                        </td>
                      </tr>
                    ) : (
                      filteredMenu.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF5EC]/60 dark:hover:bg-[#2E2925]/60 transition-colors">
                          <td className="p-4 font-bold text-[#231C18] dark:text-[#F5EFEB]">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-11 h-11 rounded-xl object-cover border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs bg-[#FAF5EC] dark:bg-[#2E2925] shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div>
                                <div className="text-sm font-bold text-[#231C18] dark:text-[#F5EFEB] flex items-center gap-1.5">
                                  <span>{item.title}</span>
                                  <SpicyBadge level={item.spicyLevel} />
                                </div>
                                <p className="text-[11px] text-[#685D55] dark:text-[#A99F98] line-clamp-1 max-w-xs font-normal">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C]">
                              {item.category}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-[#D9532F] dark:text-[#E56B48] font-bold text-sm">
                            {formatINR(item.price)}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                item.isVeg
                                  ? 'bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border border-[#2E6F40]/30 dark:border-[#3E8A54]/40'
                                  : 'bg-[#B83226]/10 dark:bg-[#D9483B]/20 text-[#B83226] dark:text-[#D9483B] border border-[#B83226]/30 dark:border-[#D9483B]/40'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? 'bg-[#2E6F40] dark:bg-[#3E8A54]' : 'bg-[#B83226] dark:bg-[#D9483B]'
                                }`}
                              ></span>
                              <span>{item.isVeg ? 'VEG' : 'NON-VEG'}</span>
                            </span>
                          </td>

                          <td className="p-4 text-[#685D55] dark:text-[#A99F98]">
                            <div className="font-mono text-xs font-semibold text-[#231C18] dark:text-[#F5EFEB]">
                              {item.prepTimeMinutes || 8} mins
                            </div>
                            <div className="text-[11px] text-[#685D55] dark:text-[#A99F98]">
                              {item.calories ? `${item.calories} kcal` : '350 kcal'}
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStock(item.id, item.inStock)}
                              title="Click to toggle stock availability"
                              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                                item.inStock
                                  ? 'bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border border-[#2E6F40]/30 dark:border-[#3E8A54]/40 hover:bg-[#2E6F40]/20 dark:hover:bg-[#3E8A54]/30'
                                  : 'bg-[#B83226]/10 dark:bg-[#D9483B]/20 text-[#B83226] dark:text-[#D9483B] border border-[#B83226]/30 dark:border-[#D9483B]/40 hover:bg-[#B83226]/20 dark:hover:bg-[#D9483B]/30'
                              }`}
                            >
                              {item.inStock ? '✓ IN STOCK' : '✕ SOLD OUT'}
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenEditDish(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] text-[#231C18] dark:text-[#F5EFEB] hover:text-[#D9532F] dark:hover:text-[#E56B48] hover:border-[#D9532F]/40 dark:hover:border-[#E56B48]/40 hover:bg-[#D9532F]/10 dark:hover:bg-[#E56B48]/15 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Dish</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE SQLITE DATABASE INSPECTOR */}
        {activeTab === 'database' && (
          <div className="space-y-4 animate-fade-in">
            <DatabaseInspector />
          </div>
        )}
      </div>

      {/* Dish Add / Edit Modal */}
      <DishModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        itemToEdit={editingItem}
        onSaveSuccess={handleDishSaveSuccess}
      />
    </div>
  );
};
