/**
 * Format currency in Indian Rupees (INR)
 * @param {number} amount
 * @returns {string}
 */
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format preparation time
 * @param {number} minutes
 * @returns {string}
 */
export const formatPrepTime = (minutes) => {
  return `${minutes} mins`;
};
