import React, { useState, useEffect, useRef } from 'react';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHAR_REGEX = /^[+0-9\s\-()./]+$/;

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
  
  // Animation state
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  const nameInputRef = useRef(null);
  const panelRef = useRef(null);

  // Synchronize rendered state with isOpen prop
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      isClosingRef.current = false;

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

      // Focus first input
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 60);
    } else if (isRendered && !isClosingRef.current) {
      triggerClose();
    }
  }, [isOpen, initialContact]);

  // Gracefully animate out then invoke onClose
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
    }, 220);
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isRendered && !isSubmitting && !isClosing) {
        triggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, isSubmitting, isClosing]);

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

  const validate = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      newErrors.name = 'Full name is required.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Full name cannot exceed 100 characters.';
    }

    const digitCount = trimmedPhone.replace(/\D/g, '').length;
    if (!trimmedPhone) {
      newErrors.phone = 'Phone number is required.';
    } else if (trimmedPhone.length < 3 || digitCount < 3) {
      newErrors.phone = 'Phone number must contain at least 3 digits.';
    } else if (trimmedPhone.length > 30) {
      newErrors.phone = 'Phone number cannot exceed 30 characters.';
    } else if (!PHONE_CHAR_REGEX.test(trimmedPhone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567).';
    }

    if (trimmedEmail) {
      if (trimmedEmail.length > 254) {
        newErrors.email = 'Email cannot exceed 254 characters.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() ? formData.email.trim() : null
      };

      await onSave(payload, initialContact ? initialContact.id : null);
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

  if (!isRendered) {
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
