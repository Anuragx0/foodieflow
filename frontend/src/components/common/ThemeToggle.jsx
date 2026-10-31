import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ compact = false, showLabel = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean & warm daylight view',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes at night',
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      description: 'Syncs with device settings',
    },
  ];

  // Active icon to show on the main button
  const ActiveIcon =
    theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle theme (Light, Dark, System)"
        className={`flex items-center gap-1.5 p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
          resolvedTheme === 'dark'
            ? 'bg-[#24201D] hover:bg-[#2E2925] text-[#F5EFEB] border-[#38312C]'
            : 'bg-[#F3EDE2] hover:bg-[#FAF5EC] text-[#231C18] border-[#E2D9CC] shadow-2xs'
        } active:scale-95`}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
      >
        <ActiveIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            resolvedTheme === 'dark' ? 'text-[#E5A642]' : 'text-[#D9532F]'
          }`}
        />
        {showLabel && (
          <span className="text-xs font-semibold capitalize hidden sm:inline">
            {theme}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border py-1.5 z-50 animate-fade-in backdrop-blur-md ${
            resolvedTheme === 'dark'
              ? 'bg-[#24201D]/95 border-[#38312C] text-[#F5EFEB] shadow-2xl'
              : 'bg-[#F3EDE2]/95 border-[#E2D9CC] text-[#231C18] shadow-xl'
          }`}
        >
          <div className="px-3 py-1.5 border-b border-[#E2D9CC] dark:border-[#38312C]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98]">
              Appearance
            </span>
          </div>

          <div className="p-1 space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? resolvedTheme === 'dark'
                        ? 'bg-[#E56B48]/20 text-[#E56B48] font-bold'
                        : 'bg-[#D9532F]/15 text-[#D9532F] font-bold'
                      : resolvedTheme === 'dark'
                      ? 'hover:bg-[#38312C]/60 text-[#F5EFEB]'
                      : 'hover:bg-[#E2D9CC]/50 text-[#231C18]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? 'text-[#D9532F] dark:text-[#E56B48]'
                          : 'text-[#685D55] dark:text-[#A99F98]'
                      }`}
                    />
                    <span>{opt.label}</span>
                    {opt.id === 'system' && (
                      <span className="text-[9px] font-normal text-[#685D55] dark:text-[#A99F98]">
                        (Default)
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#D9532F] dark:text-[#E56B48] stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
