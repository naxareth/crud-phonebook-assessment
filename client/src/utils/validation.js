/**
 * Client-Side Validation & Sanitization Utilities
 */

// Strict RFC-compliant email regex with 2-10 letter TLD
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

// Allowed phone formatting characters
const PHONE_ALLOWED_REGEX = /^[+]?[0-9\s\-()./]+$/;

// Unicode letters, spaces, dots, hyphens, apostrophes, and commas
const NAME_REGEX = /^[a-zA-Z\p{L}\s.'\-,]+$/u;

/**
 * Sanitizes input text: removes control chars, strips HTML, collapses spaces, trims.
 * @param {string} val
 * @returns {string}
 */
export const sanitizeInput = (val) => {
  if (!val) return '';
  return String(val)
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Validates contact form data
 * @param {{ name: string, phone: string, email?: string }} data
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitized: { name: string, phone: string, email: string | null } }}
 */
export const validateContactForm = (data = {}) => {
  const errors = {};

  const name = sanitizeInput(data.name);
  const phone = sanitizeInput(data.phone);
  const rawEmail = sanitizeInput(data.email);

  // Name Validation: Letters, spaces, apostrophes, hyphens, dots. No digits.
  const letterCount = name.replace(/[^a-zA-Z\p{L}]/gu, '').length;
  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  } else if (/\d/.test(name)) {
    errors.name = 'Full name cannot contain numbers.';
  } else if (!NAME_REGEX.test(name) || letterCount < 2) {
    errors.name = 'Full name must contain at least 2 letters and only valid characters (letters, spaces, hyphens, apostrophes).';
  }

  // Phone Validation: No letters permitted
  const digitCount = phone.replace(/\D/g, '').length;
  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (/[a-zA-Z]/.test(phone)) {
    errors.phone = 'Phone number cannot contain letters.';
  } else if (phone.length < 3 || digitCount < 3) {
    errors.phone = 'Phone number must contain at least 3 digits.';
  } else if (digitCount > 15) {
    errors.phone = 'Phone number cannot exceed 15 digits (ITU-T E.164 standard).';
  } else if (phone.length > 30) {
    errors.phone = 'Phone number cannot exceed 30 characters.';
  } else if (!PHONE_ALLOWED_REGEX.test(phone) || phone.indexOf('+') > 0 || (phone.match(/\+/g) || []).length > 1) {
    errors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567 or 07700 900461).';
  }

  // Email Validation (optional)
  let email = null;
  if (rawEmail) {
    const cleaned = rawEmail.toLowerCase();
    if (cleaned.length > 254) {
      errors.email = 'Email address cannot exceed 254 characters.';
    } else if (!EMAIL_REGEX.test(cleaned) || cleaned.includes('..') || cleaned.startsWith('.') || cleaned.endsWith('.')) {
      errors.email = 'Please enter a valid email address with a valid domain (e.g. name@example.com).';
    } else {
      email = cleaned;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      phone,
      email
    }
  };
};
