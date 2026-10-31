import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const OrderContext = createContext();

const STORAGE_KEY = 'foodieflow_student_orders';

export const OrderProvider = ({ children }) => {
  // Load saved orders from localStorage (filtering out legacy test mock entries)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((o) => {
          const name = (o.customerName || '').trim().toLowerCase();
          const sid = (o.studentId || '').trim().toLowerCase();
          const phone = (o.phone || '').trim();
          if (name === 'aarav sharma' || sid === 'cs-2024-102' || phone === '9876543210') {
            return false;
          }
          return true;
        });
      }
      return [];
    } catch (e) {
      console.error('Failed to load saved orders:', e);
      return [];
    }
  });

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Save orders to localStorage whenever orders state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders to localStorage:', e);
    }
  }, [orders]);

  // Helper to extract clean order progress status
  const getOrderStatus = (o) => {
    if (!o) return 'PAID';
    if (o.orderStatus) return o.orderStatus;
    if (o.status && o.status !== 'success') return o.status;
    return 'PAID';
  };

  // Active orders are those not yet completed or cancelled
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = getOrderStatus(o);
      return s !== 'COMPLETED' && s !== 'CANCELLED';
    });
  }, [orders]);

  // Completed or historical orders (retained permanently for student reference)
  const completedOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = getOrderStatus(o);
      return s === 'COMPLETED' || s === 'CANCELLED';
    });
  }, [orders]);

  // Currently focused order
  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = orders.find((o) => o.orderId === selectedOrderId);
      if (found) return found;
    }
    return activeOrders[0] || orders[0] || null;
  }, [orders, selectedOrderId, activeOrders]);

  // Function to add a newly placed order to tracker
  const addOrder = useCallback((newOrder) => {
    if (!newOrder || !newOrder.orderId) return;

    const normalizedStatus = getOrderStatus(newOrder);

    setOrders((prev) => {
      const exists = prev.some((o) => o.orderId === newOrder.orderId);
      if (exists) {
        return prev.map((o) =>
          o.orderId === newOrder.orderId
            ? {
                ...o,
                ...newOrder,
                status: normalizedStatus,
                orderStatus: normalizedStatus,
              }
            : o
        );
      }
      return [
        {
          ...newOrder,
          trackedAt: new Date().toISOString(),
          status: normalizedStatus,
          orderStatus: normalizedStatus,
        },
        ...prev,
      ];
    });

    setSelectedOrderId(newOrder.orderId);
    setIsBannerDismissed(false);
  }, []);

  // Update order fields
  const updateOrderStatus = useCallback((orderId, updatedFields) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...updatedFields } : o))
    );
  }, []);

  // Remove order from history
  const removeOrder = useCallback((orderId) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    setSelectedOrderId((prev) => (prev === orderId ? null : prev));
  }, []);

  // Clear all past completed orders (user option)
  const clearCompletedOrders = useCallback(() => {
    setOrders((prev) =>
      prev.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
    );
  }, []);

  // Function to fetch latest status for an order from backend
  const fetchOrderStatus = useCallback(async (orderId) => {
    if (!orderId) return null;
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  // Function to look up an order by Token Number (e.g. FF-104) or Order ID
  const lookupOrder = useCallback(
    async (identifier) => {
      if (!identifier || !identifier.trim()) {
        throw new Error('Please enter a valid Token or Order ID');
      }
      const cleanId = identifier.trim();
      const res = await fetch(`/api/v1/orders/track/${encodeURIComponent(cleanId)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Order '${cleanId}' not found.`);
      }
      const orderData = await res.json();
      addOrder(orderData);
      setSelectedOrderId(orderData.orderId);
      return orderData;
    },
    [addOrder]
  );

  // Polling loop for active orders (every 4 seconds)
  useEffect(() => {
    if (activeOrders.length === 0) return;

    let isMounted = true;

    const pollActiveOrders = async () => {
      for (const order of activeOrders) {
        if (!isMounted) break;
        try {
          const updated = await fetchOrderStatus(order.orderId);
          if (updated && isMounted) {
            setOrders((prev) =>
              prev.map((o) => {
                if (o.orderId === updated.orderId) {
                  const updatedStatus = getOrderStatus(updated);
                  return {
                    ...o,
                    ...updated,
                    status: updatedStatus,
                    orderStatus: updatedStatus,
                    // Retain items and pricing details if already stored locally
                    items: updated.items && updated.items.length > 0 ? updated.items : o.items,
                  };
                }
                return o;
              })
            );
          }
        } catch {
          // ignore
        }
      }
    };

    pollActiveOrders();
    const intervalId = setInterval(pollActiveOrders, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [activeOrders.length, fetchOrderStatus]);

  const openTracker = useCallback((orderId = null) => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
    setIsTrackerOpen(true);
  }, []);

  const closeTracker = useCallback(() => {
    setIsTrackerOpen(false);
  }, []);

  const value = {
    orders,
    activeOrders,
    completedOrders,
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId,
    isTrackerOpen,
    openTracker,
    closeTracker,
    addOrder,
    removeOrder,
    clearCompletedOrders,
    updateOrderStatus,
    lookupOrder,
    fetchOrderStatus,
    isBannerDismissed,
    setIsBannerDismissed,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
