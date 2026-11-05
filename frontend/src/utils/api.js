/**
 * FoodieFlow API configuration helper.
 * Reads VITE_API_URL from frontend environment variables (.env).
 * If VITE_API_URL is empty, defaults to relative paths (ideal for local Vite proxy or CloudFront /api routing).
 * If VITE_API_URL is set (e.g. 'https://api.foodieflow.campus.edu'), prefixes endpoints for cross-domain deployment.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

