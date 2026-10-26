import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000, options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration: duration || 4000,
      label: options.label || (type === 'notification' ? 'NOTIFICATION' : type.toUpperCase()),
      senderUsername: options.senderUsername || options.username || null,
    };

    // Append to bottom of toast list
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  React.useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail?.message) {
        addToast(e.detail.message, e.detail.type || 'error', e.detail.duration || 4000);
      }
    };
    window.addEventListener('mka:toast', handleCustomToast);
    return () => window.removeEventListener('mka:toast', handleCustomToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
