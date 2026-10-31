import React from 'react';

/**
 * Standard Indian FSSAI-style Veg / Non-Veg Indicator
 */
export const DietaryBadge = ({ isVeg, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
        isVeg
          ? 'border-[#2E6F40] dark:border-[#3E8A54] bg-[#2E6F40]/10 dark:bg-[#3E8A54]/20'
          : 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/10 dark:bg-[#D9483B]/20'
      } ${className}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      {isVeg ? (
        <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] dark:bg-[#3E8A54]"></span>
      ) : (
        <span
          className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#B83226] dark:border-b-[#D9483B]"
          style={{ transform: 'translateY(-0.5px)' }}
        ></span>
      )}
    </div>
  );
};

export const SpicyBadge = ({ level, className = '' }) => {
  const raw = String(level || '').trim().toLowerCase();

  let label = 'Non-Spicy';
  let badgeClasses =
    'bg-[#2E6F40] dark:bg-[#3E8A54] text-white border-transparent';

  if (raw === 'mild') {
    label = 'Mild';
    badgeClasses =
      'bg-[#D48B28] dark:bg-[#E5A642] text-white dark:text-[#161311] border-transparent';
  } else if (raw === 'medium') {
    label = 'Medium';
    badgeClasses =
      'bg-[#D9532F] dark:bg-[#E56B48] text-white border-transparent';
  } else if (raw === 'spicy') {
    label = 'Spicy';
    badgeClasses =
      'bg-[#B83226] dark:bg-[#D9483B] text-white border-transparent';
  } else if (raw === 'hot' || raw === 'extra spicy' || raw === 'extra hot') {
    label = 'Extra Hot';
    badgeClasses =
      'bg-[#8F1D13] dark:bg-[#B83226] text-white border-transparent';
  } else {
    // None, 'none', '', 0, null, undefined
    label = 'Non-Spicy';
    badgeClasses =
      'bg-[#2E6F40] dark:bg-[#3E8A54] text-white border-transparent';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold shadow-2xs select-none ${badgeClasses} ${className}`}
      title={`Spiciness: ${label}`}
    >
      <span className="text-xs leading-none"></span>
      <span className="tracking-wide">{label}</span>
    </span>
  );
};
