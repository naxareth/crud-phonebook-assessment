import React, { useEffect } from 'react';

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (toast && toast.type === 'success') {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`toast-banner ${toast.type || 'success'}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <span>{toast.message}</span>
      <div className="toast-actions">
        {toast.action && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '3px 8px', fontSize: '12px' }}
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          className="toast-close-btn"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
