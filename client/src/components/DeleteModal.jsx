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
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsDeleting(false);
      setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting]);

  const handleCancel = () => {
    onClose();
    if (triggerRef && triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(contact.id);
      handleCancel();
    } catch (err) {
      console.error('[Delete Error]', err);
      setError(err.message || 'Failed to delete contact. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!isOpen || !contact) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          handleCancel();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-dialog"
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
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete contact'}
          </button>
        </div>
      </div>
    </div>
  );
}
