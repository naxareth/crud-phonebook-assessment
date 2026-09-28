import React, { useState, useEffect, useRef, useCallback } from 'react';

export function DeleteModal({
  isOpen,
  contact,
  onClose,
  onConfirm,
  triggerRef
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  const triggerClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Wait for React to remove inert; deleted/filtered rows need a stable fallback.
      requestAnimationFrame(() => {
        const trigger = triggerRef?.current;
        const target = trigger?.isConnected ? trigger : document.getElementById('add-contact-btn');
        target?.focus();
      });
    }, 180);
  }, [isClosing, onClose, triggerRef]);

  // Focus cancel button on mount/open
  useEffect(() => {
    if (isOpen && contact) {
      setError(null);
      setIsDeleting(false);

      const timer = setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, contact]);

  // Handle ESC key and Tab focus containment
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // 1. Escape key
      if (e.key === 'Escape' && !isDeleting) {
        triggerClose();
        return;
      }

      // 2. Tab focus containment
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, isClosing, triggerClose]);

  const handleDelete = async () => {
    if (!contact) return;
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(contact.id);
      triggerClose();
    } catch (err) {
      console.error('[Delete Error]', err);
      setError(err.message || 'Failed to delete contact. Please try again.');
      setIsDeleting(false);
    }
  };

  if ((!isOpen && !isClosing) || !contact) {
    return null;
  }

  return (
    <div
      className={`modal-backdrop ${isClosing ? 'is-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting && !isClosing) {
          triggerClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`modal-dialog ${isClosing ? 'is-closing' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <h2 id="delete-dialog-title" className="modal-title">
          Delete {contact.name}?
        </h2>

        <p id="delete-dialog-desc" className="modal-body">
          This contact will be permanently removed.
        </p>

        {error && (
          <div className="toast-banner error" role="alert" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={triggerClose}
            disabled={isDeleting || isClosing}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting || isClosing}
          >
            {isDeleting ? 'Deleting…' : 'Delete contact'}
          </button>
        </div>
      </div>
    </div>
  );
}
