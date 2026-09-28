import React, { useState, useEffect, useRef } from 'react';

export function DeleteModal({
  isOpen,
  contact,
  onClose,
  onConfirm,
  triggerRef
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation state
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen && contact) {
      setIsRendered(true);
      setIsClosing(false);
      isClosingRef.current = false;
      setError(null);
      setIsDeleting(false);

      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
    } else if (isRendered && !isClosingRef.current) {
      triggerClose();
    }
  }, [isOpen, contact]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);

    setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      isClosingRef.current = false;
      onClose();
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    }, 180);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isRendered && !isDeleting && !isClosing) {
        triggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, isDeleting, isClosing]);

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

  if (!isRendered || !contact) {
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
