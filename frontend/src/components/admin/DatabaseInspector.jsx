import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, Layers, ShieldCheck, CheckCircle2, Download, Receipt } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { downloadOrderReceipt } from '../../utils/receiptDownloader';

export const DatabaseInspector = () => {
  const [activeTable, setActiveTable] = useState('orders'); // 'orders' | 'menu_items'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('foodieflow_admin_token') || 'foodieflow_admin_admin123_session';

  const fetchDbData = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, statsRes] = await Promise.all([
        fetch('/api/v1/admin/orders', { headers: { Authorization: token } }),
        fetch('/api/v1/menu'),
        fetch('/api/v1/admin/stats', { headers: { Authorization: token } }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (menuRes.ok) {
        const json = await menuRes.json();
        if (json.data) setMenuItems(json.data);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.warn('DB Inspector fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  return (
    <div className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#231C18] dark:text-[#F5EFEB] rounded-3xl border border-[#E2D9CC] dark:border-[#38312C] p-4 sm:p-7 shadow-xs space-y-5 overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E2D9CC] dark:border-[#38312C]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#D9532F]/15 dark:bg-[#E56B48]/20 border border-[#D9532F]/30 dark:border-[#E56B48]/30 flex items-center justify-center text-[#D9532F] dark:text-[#E56B48] shrink-0 shadow-2xs">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#231C18] dark:text-[#F5EFEB] truncate">
                SQLite Live Database Inspector
              </h3>
              <span className="text-[10px] font-mono bg-[#D48B28]/15 dark:bg-[#E5A642]/20 text-[#D48B28] dark:text-[#E5A642] border border-[#D48B28]/40 dark:border-[#E5A642]/40 px-2 py-0.5 rounded-md font-bold">
                foodieflow.db
              </span>
            </div>
            <p className="text-xs text-[#685D55] dark:text-[#A99F98] hidden sm:block">
              Embedded ACID storage engine persisting cafeteria food items and live student orders
            </p>
          </div>
        </div>

        <button
          onClick={fetchDbData}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Database Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-0.5">
            Total DB Rows
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#231C18] dark:text-[#F5EFEB] font-mono">
            {orders.length + menuItems.length}
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-0.5">
            Orders Table
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#D9532F] dark:text-[#E56B48] font-mono">
            {orders.length}
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-0.5">
            Menu Items
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#2E6F40] dark:text-[#3E8A54] font-mono">
            {menuItems.length}
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-0.5">
            Cumulative Revenue
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#D48B28] dark:text-[#E5A642] font-mono">
            {formatINR(stats?.totalRevenue || 0)}
          </span>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2D9CC] dark:border-[#38312C] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTable('orders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTable === 'orders'
              ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
              : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>TABLE: orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTable('menu_items')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTable === 'menu_items'
              ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2] shadow-xs'
              : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>TABLE: menu_items ({menuItems.length})</span>
        </button>
      </div>

      {/* Table Data Viewer */}
      <div className="bg-[#FAF5EC] dark:bg-[#2E2925] rounded-2xl border border-[#E2D9CC] dark:border-[#38312C] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          {activeTable === 'orders' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] uppercase text-[10px] tracking-wider border-b border-[#E2D9CC] dark:border-[#38312C] sticky top-0 font-bold">
                <tr>
                  <th className="p-3">tokenNumber</th>
                  <th className="p-3">orderId</th>
                  <th className="p-3 font-sans">customerName</th>
                  <th className="p-3">studentId</th>
                  <th className="p-3">amount (₹)</th>
                  <th className="p-3">orderStatus</th>
                  <th className="p-3">createdAt</th>
                  <th className="p-3 font-sans">receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC] dark:divide-[#38312C]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-[#685D55] dark:text-[#A99F98] font-sans text-xs">
                      No orders recorded in SQLite yet. Place an order from the student storefront!
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-[#E2D9CC]/30 dark:hover:bg-[#38312C]/40 transition-colors">
                      <td className="p-3 font-black text-[#D9532F] dark:text-[#E56B48]">{o.tokenNumber}</td>
                      <td className="p-3 text-[#685D55] dark:text-[#A99F98] text-[11px]">{o.orderId}</td>
                      <td className="p-3 text-[#231C18] dark:text-[#F5EFEB] font-sans font-bold">{o.customerName}</td>
                      <td className="p-3 text-[#685D55] dark:text-[#A99F98] font-semibold">{o.studentId}</td>
                      <td className="p-3 text-[#2E6F40] dark:text-[#3E8A54] font-bold">{formatINR(o.amount)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#F3EDE2] dark:bg-[#24201D] text-[10px] font-bold text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C]">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-[#685D55] dark:text-[#A99F98] text-[11px]">
                        {new Date(o.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-sans">
                          <button
                            onClick={() => downloadOrderReceipt(o.orderId, true)}
                            title="Download Official Tax Receipt HTML"
                            className="bg-[#D9532F]/10 dark:bg-[#E56B48]/15 hover:bg-[#D9532F]/20 dark:hover:bg-[#E56B48]/25 text-[#D9532F] dark:text-[#E56B48] border border-[#D9532F]/30 dark:border-[#E56B48]/30 px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-[#D9532F] dark:text-[#E56B48]" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => downloadOrderReceipt(o.orderId, false)}
                            title="Print or Save to PDF"
                            className="bg-[#F3EDE2] dark:bg-[#24201D] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C] px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-[#685D55] dark:text-[#A99F98]" />
                            <span>Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTable === 'menu_items' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#685D55] dark:text-[#A99F98] uppercase text-[10px] tracking-wider border-b border-[#E2D9CC] dark:border-[#38312C] sticky top-0 font-bold">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3 font-sans">title</th>
                  <th className="p-3">category</th>
                  <th className="p-3">price (₹)</th>
                  <th className="p-3">isVeg</th>
                  <th className="p-3">prepTime</th>
                  <th className="p-3">inStock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CC] dark:divide-[#38312C]">
                {menuItems.map((m) => (
                  <tr key={m.id} className="hover:bg-[#E2D9CC]/30 dark:hover:bg-[#38312C]/40 transition-colors">
                    <td className="p-3 text-[#685D55] dark:text-[#A99F98]">#{m.id}</td>
                    <td className="p-3 font-sans font-bold text-[#231C18] dark:text-[#F5EFEB]">{m.title}</td>
                    <td className="p-3 text-[#685D55] dark:text-[#A99F98]">{m.category}</td>
                    <td className="p-3 text-[#D9532F] dark:text-[#E56B48] font-bold">{formatINR(m.price)}</td>
                    <td className="p-3">
                      <span className={m.isVeg ? 'text-[#2E6F40] dark:text-[#3E8A54] font-bold' : 'text-[#B83226] dark:text-[#D9483B] font-bold'}>
                        {m.isVeg ? '1 (Veg)' : '0 (Non-Veg)'}
                      </span>
                    </td>
                    <td className="p-3 text-[#685D55] dark:text-[#A99F98]">{m.prepTimeMinutes}m</td>
                    <td className="p-3">
                      <span
                        className={
                          m.inStock
                            ? 'text-[#2E6F40] dark:text-[#3E8A54] bg-[#2E6F40]/10 dark:bg-[#3E8A54]/15 border border-[#2E6F40]/30 dark:border-[#3E8A54]/30 px-2 py-0.5 rounded-md font-bold'
                            : 'text-[#B83226] dark:text-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/15 border border-[#B83226]/30 dark:border-[#D9483B]/30 px-2 py-0.5 rounded-md font-bold'
                        }
                      >
                        {m.inStock ? '1 (In Stock)' : '0 (Sold Out)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
