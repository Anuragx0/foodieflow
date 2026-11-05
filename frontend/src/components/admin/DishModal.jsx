import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Flame,
  Clock,
  Sparkles,
  Utensils,
  Leaf,
  Beef,
} from 'lucide-react';
import { apiUrl } from '../../utils/api';

const POPULAR_CATEGORIES = [
  'All-Day Meals',
  'Quick Bites',
  'South Indian',
  'North Indian',
  'Beverages',
  'Desserts',
  'Chinese',
  'Sandwiches & Rolls',
  'Healthy & Salads',
];

const PRESET_IMAGES = [
  {
    name: 'Masala Dosa',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Biryani Bowl',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Paneer Butter Masala',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Veg Burger & Fries',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cold Coffee Frappé',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Samosa Platter',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hakka Noodles',
    url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Caesar Salad',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mango Lassi',
    url: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&auto=format&fit=crop&q=80',
  },
];

export const DishModal = ({ isOpen, onClose, itemToEdit, onSaveSuccess }) => {
  const isEditing = Boolean(itemToEdit && itemToEdit.id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'All-Day Meals',
    description: '',
    price: '',
    isVeg: true,
    prepTimeMinutes: 10,
    calories: 350,
    spicyLevel: 'Medium',
    inStock: true,
    imageUrl: PRESET_IMAGES[0].url,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [apiError, setApiError] = useState(null);

  const token =
    localStorage.getItem('foodieflow_admin_token') ||
    'foodieflow_admin_admin123_session';

  // Populate form if editing
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setApiError(null);
      setDeleteConfirm(false);
      if (itemToEdit) {
        setFormData({
          title: itemToEdit.title || '',
          category: itemToEdit.category || 'All-Day Meals',
          description: itemToEdit.description || '',
          price: itemToEdit.price !== undefined ? itemToEdit.price : '',
          isVeg: itemToEdit.isVeg !== undefined ? Boolean(itemToEdit.isVeg) : true,
          prepTimeMinutes: itemToEdit.prepTimeMinutes || 10,
          calories: itemToEdit.calories || 350,
          spicyLevel: itemToEdit.spicyLevel || 'Medium',
          inStock: itemToEdit.inStock !== undefined ? Boolean(itemToEdit.inStock) : true,
          imageUrl: itemToEdit.imageUrl || PRESET_IMAGES[0].url,
        });
      } else {
        setFormData({
          title: '',
          category: 'All-Day Meals',
          description: '',
          price: '',
          isVeg: true,
          prepTimeMinutes: 10,
          calories: 350,
          spicyLevel: 'Medium',
          inStock: true,
          imageUrl: PRESET_IMAGES[0].url,
        });
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      errs.title = 'Dish title must be at least 2 characters';
    }
    if (!formData.category.trim()) {
      errs.category = 'Category is required';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      errs.description = 'Please write a brief dish description or ingredients list';
    }
    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Please enter a valid price greater than ₹0';
    }
    const numPrep = parseInt(formData.prepTimeMinutes, 10);
    if (isNaN(numPrep) || numPrep < 1) {
      errs.prepTimeMinutes = 'Prep time must be at least 1 minute';
    }
    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Please provide or select a dish photo URL';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setApiError(null);

      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: 'INR',
        imageUrl: formData.imageUrl.trim(),
        isVeg: Boolean(formData.isVeg),
        prepTimeMinutes: parseInt(formData.prepTimeMinutes, 10),
        calories: formData.calories ? parseInt(formData.calories, 10) : 350,
        inStock: Boolean(formData.inStock),
        spicyLevel: formData.spicyLevel,
      };

      const url = isEditing
        ? `/api/v1/admin/menu/items/${itemToEdit.id}`
        : '/api/v1/admin/menu/items';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(apiUrl(url), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.detail || 'Failed to save menu item');
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setApiError(err.message || 'Network error occurred while saving dish');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    try {
      setSubmitting(true);
      setApiError(null);
      const res = await fetch(apiUrl(`/api/v1/admin/menu/items/${itemToEdit.id}`), {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.detail || 'Failed to delete dish');
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to delete dish');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#161311]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-[#F3EDE2] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312C] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-[#E2D9CC] dark:border-[#38312C] flex items-center justify-between bg-[#F3EDE2] dark:bg-[#24201D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9532F] dark:bg-[#E56B48] flex items-center justify-center text-[#FBF8F2] shadow-xs">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#231C18] dark:text-[#F5EFEB]">
                {isEditing ? 'Update Menu Item' : 'Add New Dish to Menu'}
              </h3>
              <p className="text-xs text-[#685D55] dark:text-[#A99F98]">
                {isEditing
                  ? `Editing #${itemToEdit.id} • Updates live on student screens instantly`
                  : 'Add a new meal, snack, or beverage to the cafeteria database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {apiError && (
            <div className="p-3.5 bg-[#B83226]/10 dark:bg-[#D9483B]/10 border border-[#B83226]/30 dark:border-[#D9483B]/30 rounded-2xl flex items-center gap-2.5 text-xs text-[#B83226] dark:text-[#D9483B] font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-[#B83226] dark:text-[#D9483B] shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Dish Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Dish Name <span className="text-[#B83226] dark:text-[#D9483B]">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Masala Dosa, Paneer Wrap..."
                className={`w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border rounded-xl text-sm font-semibold text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] ${
                  errors.title ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10' : 'border-[#E2D9CC] dark:border-[#38312C]'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] font-semibold text-[#B83226] dark:text-[#D9483B] mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Category <span className="text-[#B83226] dark:text-[#D9483B]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="categories-list"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Select or type category..."
                  className={`w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border rounded-xl text-sm font-semibold text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] ${
                    errors.category ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10' : 'border-[#E2D9CC] dark:border-[#38312C]'
                  }`}
                />
                <datalist id="categories-list">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              {errors.category && (
                <p className="text-[11px] font-semibold text-[#B83226] dark:text-[#D9483B] mt-1">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] mr-1">
              Suggestions:
            </span>
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  formData.category === cat
                    ? 'bg-[#D9532F] dark:bg-[#E56B48] text-[#FBF8F2]'
                    : 'bg-[#FAF5EC] dark:bg-[#2E2925] hover:bg-[#E2D9CC]/50 dark:hover:bg-[#38312C] text-[#231C18] dark:text-[#F5EFEB] border border-[#E2D9CC] dark:border-[#38312C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price, Dietary (Veg/Non-Veg), Stock Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Price (INR ₹) <span className="text-[#B83226] dark:text-[#D9483B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#685D55] dark:text-[#A99F98] font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="80"
                  className={`w-full pl-8 pr-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border rounded-xl text-sm font-bold font-mono text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] ${
                    errors.price ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10' : 'border-[#E2D9CC] dark:border-[#38312C]'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-[11px] font-semibold text-[#B83226] dark:text-[#D9483B] mt-1">
                  {errors.price}
                </p>
              )}
            </div>

            {/* Veg / Non-Veg Toggle Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVeg: true })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.isVeg
                      ? 'bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border-[#2E6F40] dark:border-[#3E8A54] ring-2 ring-[#2E6F40]/25 shadow-xs'
                      : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/40 dark:hover:bg-[#38312C]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E6F40] dark:bg-[#3E8A54]"></span>
                  <span>Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVeg: false })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !formData.isVeg
                      ? 'bg-[#B83226]/15 dark:bg-[#D9483B]/20 text-[#B83226] dark:text-[#D9483B] border-[#B83226] dark:border-[#D9483B] ring-2 ring-[#B83226]/25 shadow-xs'
                      : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/40 dark:hover:bg-[#38312C]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83226] dark:bg-[#D9483B]"></span>
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* Stock Availability */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Kitchen Stock
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inStock: true })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    formData.inStock
                      ? 'bg-[#2E6F40]/15 dark:bg-[#3E8A54]/20 text-[#2E6F40] dark:text-[#3E8A54] border-[#2E6F40] dark:border-[#3E8A54] ring-2 ring-[#2E6F40]/25 shadow-xs'
                      : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/40 dark:hover:bg-[#38312C]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inStock: false })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    !formData.inStock
                      ? 'bg-[#B83226]/15 dark:bg-[#D9483B]/20 text-[#B83226] dark:text-[#D9483B] border-[#B83226] dark:border-[#D9483B] ring-2 ring-[#B83226]/25 shadow-xs'
                      : 'bg-[#FAF5EC] dark:bg-[#2E2925] text-[#685D55] dark:text-[#A99F98] border-[#E2D9CC] dark:border-[#38312C] hover:bg-[#E2D9CC]/40 dark:hover:bg-[#38312C]'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Sold Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prep Time, Calories, Spicy Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Prep Time (Mins)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#685D55] dark:text-[#A99F98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.prepTimeMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, prepTimeMinutes: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl text-sm font-semibold font-mono text-[#231C18] dark:text-[#F5EFEB] focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: e.target.value })
                }
                placeholder="350"
                className="w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl text-sm font-semibold font-mono text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
                Spiciness
              </label>
              <select
                value={formData.spicyLevel}
                onChange={(e) =>
                  setFormData({ ...formData, spicyLevel: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] rounded-xl text-sm font-semibold text-[#231C18] dark:text-[#F5EFEB] focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48]"
              >
                <option value="None">None (Mildest)</option>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
                <option value="Hot">Extra Hot</option>
              </select>
            </div>
          </div>

          {/* Dish Description & Ingredients */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB] mb-1.5">
              Description & Ingredients <span className="text-[#B83226] dark:text-[#D9483B]">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Freshly made crispy dosa roasted in pure ghee served with coconut chutney & sambar..."
              className={`w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border rounded-xl text-sm text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] ${
                errors.description ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10' : 'border-[#E2D9CC] dark:border-[#38312C]'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] font-semibold text-[#B83226] dark:text-[#D9483B] mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Dish Image URL & Quick Gallery */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#231C18] dark:text-[#F5EFEB]">
                Dish Photo URL <span className="text-[#B83226] dark:text-[#D9483B]">*</span>
              </label>
              <span className="text-[11px] text-[#685D55] dark:text-[#A99F98]">
                Direct Unsplash or Web Image
              </span>
            </div>

            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF5EC] dark:bg-[#2E2925] border border-[#E2D9CC] dark:border-[#38312C] shrink-0 shadow-2xs">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#685D55] dark:text-[#A99F98]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3.5 py-2.5 bg-[#FAF5EC] dark:bg-[#2E2925] border rounded-xl text-xs font-mono text-[#231C18] dark:text-[#F5EFEB] placeholder:text-[#685D55]/60 dark:placeholder:text-[#A99F98]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D9532F]/25 focus:border-[#D9532F] dark:focus:border-[#E56B48] ${
                    errors.imageUrl ? 'border-[#B83226] dark:border-[#D9483B] bg-[#B83226]/5 dark:bg-[#D9483B]/10' : 'border-[#E2D9CC] dark:border-[#38312C]'
                  }`}
                />
              </div>
            </div>

            {/* Quick Pick Photo Presets */}
            <div className="mt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#685D55] dark:text-[#A99F98] block mb-1.5">
                Quick Preset Photos:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    type="button"
                    key={img.name}
                    onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className={`p-1 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                      formData.imageUrl === img.url
                        ? 'border-[#D9532F] dark:border-[#E56B48] bg-[#FAF5EC] dark:bg-[#2E2925] ring-2 ring-[#D9532F]/25 dark:ring-[#E56B48]/25'
                        : 'border-[#E2D9CC] dark:border-[#38312C] hover:border-[#D48B28]/40 dark:hover:border-[#E5A642]/40 bg-[#FAF5EC] dark:bg-[#2E2925]'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-[10px] font-bold text-[#231C18] dark:text-[#F5EFEB] truncate">
                      {img.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Controls */}
        <div className="px-5 py-4 border-t border-[#E2D9CC] dark:border-[#38312C] bg-[#F3EDE2] dark:bg-[#24201D] flex items-center justify-between gap-3">
          {isEditing ? (
            <div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="px-3 py-2 bg-[#B83226] hover:bg-[#9E2B20] text-[#FBF8F2] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="px-2.5 py-2 text-xs font-bold text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  disabled={submitting}
                  className="px-3 py-2 text-[#B83226] dark:text-[#D9483B] hover:bg-[#B83226]/10 dark:hover:bg-[#D9483B]/10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#B83226]/30 dark:border-[#D9483B]/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Dish</span>
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-[#E2D9CC] dark:border-[#38312C] text-[#685D55] dark:text-[#A99F98] hover:text-[#231C18] dark:hover:text-[#F5EFEB] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#D9532F] hover:bg-[#C24522] dark:bg-[#E56B48] dark:hover:bg-[#D9532F] active:scale-95 text-[#FBF8F2] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Add Dish to Menu'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
