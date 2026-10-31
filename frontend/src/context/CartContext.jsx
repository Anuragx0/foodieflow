import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'foodieflow_cart_items';

const initialState = {
  items: (() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  isCartOpen: false,
  isCheckoutOpen: false,
  completedOrder: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return { ...state, items: newItems };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return { ...state, items: newItems };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };

    case 'SET_CHECKOUT_OPEN':
      return { ...state, isCheckoutOpen: action.payload };

    case 'SET_COMPLETED_ORDER':
      return { ...state, completedOrder: action.payload };

    case 'CLEAR_COMPLETED_ORDER':
      return { ...state, completedOrder: null };

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [state.items]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => dispatch({ type: 'SET_CART_OPEN', payload: true });
  const closeCart = () => dispatch({ type: 'SET_CART_OPEN', payload: false });
  const toggleCart = () =>
    dispatch({ type: 'SET_CART_OPEN', payload: !state.isCartOpen });

  const openCheckout = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: false });
    dispatch({ type: 'SET_CHECKOUT_OPEN', payload: true });
  };

  const closeCheckout = () =>
    dispatch({ type: 'SET_CHECKOUT_OPEN', payload: false });

  const setCompletedOrder = (order) => {
    dispatch({ type: 'SET_COMPLETED_ORDER', payload: order });
  };

  const clearCompletedOrder = () => {
    dispatch({ type: 'CLEAR_COMPLETED_ORDER' });
  };

  const getItemQuantity = (id) => {
    const found = state.items.find((item) => item.id === id);
    return found ? found.quantity : 0;
  };

  // Calculations
  const totalItemsCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Standard 5% cafeteria GST/handling levy
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  // Real-time estimated prep time (max prep time of items + 2 min rush factor per item)
  const maxItemPrepTime = state.items.reduce(
    (max, item) => Math.max(max, item.prepTimeMinutes || 5),
    0
  );
  const estimatedPrepMinutes =
    state.items.length === 0 ? 0 : Math.min(30, maxItemPrepTime + Math.floor(totalItemsCount * 1.5));

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isCartOpen: state.isCartOpen,
        isCheckoutOpen: state.isCheckoutOpen,
        completedOrder: state.completedOrder,
        totalItemsCount,
        subtotal,
        tax,
        grandTotal,
        estimatedPrepMinutes,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        openCheckout,
        closeCheckout,
        setCompletedOrder,
        clearCompletedOrder,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
