import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { CheckCircle2, AlertCircle, Info, Bell, MessageSquare } from 'lucide-react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';

function SingleToast({ toast, onRemove }) {
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Auto dismiss after 4 seconds (4000ms) with right-swipe animation
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsDismissing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleAnimationEnd = () => {
    if (isDismissing) {
      onRemove(toast.id);
    }
  };

  const isNotifType = toast.type === 'notification' || toast.type === 'info';
  const label = toast.label || (toast.type === 'notification' ? 'NOTIFICATION' : toast.type.toUpperCase());
  const username = toast.senderUsername
    ? (toast.senderUsername.startsWith('@') ? toast.senderUsername : `@${toast.senderUsername}`)
    : null;

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      className={isDismissing ? 'animate-toast-dismissing' : 'animate-toast-popup'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px 16px',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        color: '#2D1D15',
        boxShadow: '0 10px 28px rgba(111, 64, 95, 0.20), 0 2px 8px rgba(0,0,0,0.06)',
        border: toast.type === 'error'
          ? '1.5px solid #E11D48'
          : toast.type === 'success'
          ? '1.5px solid #10B981'
          : '1.5px solid var(--deep-plum)',
        fontSize: '13px',
        width: '100%',
        pointerEvents: 'auto',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
      }}
    >
      {/* ── TOP HEADER: Label Badge ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: toast.type === 'error'
              ? 'rgba(225,29,72,0.1)'
              : toast.type === 'success'
              ? 'rgba(16,185,129,0.1)'
              : 'rgba(111,64,95,0.12)',
            color: toast.type === 'error'
              ? '#E11D48'
              : toast.type === 'success'
              ? '#10B981'
              : 'var(--deep-plum)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={11} />}
          {toast.type === 'error' && <AlertCircle size={11} />}
          {toast.type === 'warning' && <AlertCircle size={11} />}
          {isNotifType && <Bell size={11} />}
          {label}
        </span>
      </div>

      {/* ── CONTENT BODY ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        {username && <InitialAvatar username={username} size={34} />}
        <span style={{ fontWeight: 600, color: '#2D1D15', fontSize: '13px', lineHeight: 1.35, flex: 1 }}>
          {toast.message}
        </span>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      className="no-scrollbar"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
