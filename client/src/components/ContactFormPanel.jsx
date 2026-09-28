import React, { useState, useEffect, useRef, useCallback } from 'react';
import { validateContactForm } from '../utils/validation.js';

export function ContactFormPanel({
  isOpen,
  initialContact,
  onClose,
  onSave,
  triggerRef
}) {
  const isEditing = Boolean(initialContact && initialContact.id);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const nameInputRef = useRef(null);
  const panelRef = useRef(null);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      if (initialContact) {
        setFormData({
          name: initialContact.name || '',
          phone: initialContact.phone || '',
          email: initialContact.email || ''
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: ''
        });
      }
      setErrors({});
      setServerError(null);

      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialContact]);

  // Gracefully animate out then invoke onClose
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
    }, 220);
  }, [isClosing, onClose, triggerRef]);

  // Handle ESC key to close and Tab key to trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // 1. Escape key handling
      if (e.key === 'Escape' && !isSubmitting) {
        triggerClose();
        return;
      }

      // 2. Tab focus containment
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !panelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !panelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, isClosing, triggerClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateContactForm(formData);
    
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSave(result.sanitized, initialContact ? initialContact.id : null);
      // Animate out smoothly on success
      triggerClose();
    } catch (err) {
      console.error('[Form Submit Error]', err);
      setServerError(err.message || 'Failed to save contact. Please try again.');
      if (err.details) {
        setErrors(err.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <div
      className={`drawer-backdrop ${isClosing ? 'is-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isClosing) {
          triggerClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={`drawer-panel ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
      >
        <div className="drawer-header">
          <h2 id="drawer-heading" className="drawer-title">
            {isEditing ? 'Edit entry' : 'New entry'}
          </h2>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={triggerClose}
            aria-label="Close panel"
            disabled={isSubmitting || isClosing}
          >
            &times;
          </button>
        </div>

        <form id="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="drawer-body">
            {serverError && (
              <div className="toast-banner error" role="alert" style={{ marginBottom: '16px' }}>
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="contact-name" className="form-label">
                Full name <span aria-hidden="true" style={{ color: 'var(--accent-green)' }}>*</span>
              </label>
              <input
                ref={nameInputRef}
                id="contact-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Beatrix Thorne"
                disabled={isSubmitting || isClosing}
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                autoComplete="name"
              />
              {errors.name && (
                <div id="name-error" className="field-error" role="alert">
                  {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contact-phone" className="form-label">
                Phone number <span aria-hidden="true" style={{ color: 'var(--accent-green)' }}>*</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'has-error' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 234-5678"
                disabled={isSubmitting || isClosing}
                aria-required="true"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                autoComplete="tel"
              />
              {errors.phone && (
                <div id="phone-error" className="field-error" role="alert">
                  {errors.phone}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contact-email" className="form-label">
                Email address <span className="optional-tag">(optional)</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. beatrix@example.com"
                disabled={isSubmitting || isClosing}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <div id="email-error" className="field-error" role="alert">
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={triggerClose}
              disabled={isSubmitting || isClosing}
            >
              Cancel
            </button>
            <button
              id="save-contact-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isClosing}
            >
              {isSubmitting ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
