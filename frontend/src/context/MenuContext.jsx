import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CATEGORIES, INITIAL_MENU_ITEMS } from '../utils/constants';
import { apiUrl } from '../utils/api';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState(INITIAL_MENU_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Attempt to fetch from FastAPI backend if available, gracefully fallback to seed items
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/v1/menu'));
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setItems(json.data);
          setError(null);
          return;
        }
      }
    } catch {
      // Backend not running yet (Phase 2), use seed menu data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Dietary check
      const matchesDietary = vegOnly ? item.isVeg === true : true;

      // Search query check
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesDietary && matchesSearch;
    });
  }, [items, selectedCategory, vegOnly, searchQuery]);

  const categories = useMemo(() => {
    const catSet = new Set(['All']);
    CATEGORIES.forEach((c) => catSet.add(c));
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        catSet.add(item.category.trim());
      }
    });
    return Array.from(catSet);
  }, [items]);

  return (
    <MenuContext.Provider
      value={{
        items,
        filteredItems,
        loading,
        error,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        vegOnly,
        setVegOnly,
        fetchMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
