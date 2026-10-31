import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('foodieflow_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.detail || 'Invalid Cafeteria Admin PIN');
      }
    } catch {
      setError('Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#231C18] dark:text-[#F5EFEB] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#E2D9CC] dark:border-[#38312C] animate-fade-in">
        <div className="bg-[#F3EDE2] dark:bg-[#24201D] text-[#231C18] dark:text-[#F5EFEB] p-6 text-center relative border-b border-[#E2D9CC] dark:border-[#38312C]">
          <div className="w-12 h-12 rounded-2xl bg-[#D9532F]/15 dark:bg-[#E56B48]/20 border border-[#D9532F]/30 dark:border-[#E56B48]/30 flex items-center justify-center text-[#D9532F] dark:text-[#E56B48] mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-[#231C18] dark:text-[#F5EFEB]">
            Kitchen Staff Access
          </h3>
          <p className="text-xs text-[#685D55] dark:text-[#A99F98] mt-1">
            Restricted to Cafeteria Staff & Kitchen Managers
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
              Enter Admin Security PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (Default: admin123)"
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] bg-[#FAF5EC] dark:bg-[#2E2925] text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 text-sm font-mono tracking-widest focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]"
              />
            </div>
            {error && (
              <p className="text-xs text-[#B83226] dark:text-[#D9483B] font-semibold mt-1.5">{error}</p>
            )}
            <p className="text-[11px] text-[#685D55] dark:text-[#A99F98] mt-1.5">
              Default system PIN: <code className="bg-[#E2D9CC]/50 dark:bg-[#38312C] px-1 py-0.5 rounded font-mono text-[#231C18] dark:text-[#F5EFEB]">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] disabled:opacity-50 text-[#FBF8F2] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <span>{loading ? 'Verifying PIN...' : 'Unlock Kitchen Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
