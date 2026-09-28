/**
 * Client-Side Validation & Sanitization Utilities
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHAR_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{2,26}$/;

/**
 * Sanitizes input text: removes control chars, strips HTML, collapses spaces, trims.
 * @param {string} val
 * @returns {string}
 */
export const sanitizeInput = (val) => {
  if (!val) return '';
  return String(val)
    .normalize('NFC')
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

  // Name Validation
  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 1) {
    errors.name = 'Full name must be at least 1 character.';
  } else if (name.length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  } else if (!/[a-zA-Z\p{L}0-9]/u.test(name)) {
    errors.name = 'Full name must contain at least one letter or number.';
  }

  // Phone Validation
  const digitCount = phone.replace(/\D/g, '').length;
  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (phone.length < 3 || digitCount < 3) {
    errors.phone = 'Phone number must contain at least 3 digits.';
  } else if (digitCount > 20) {
    errors.phone = 'Phone number cannot contain more than 20 digits.';
  } else if (phone.length > 30) {
    errors.phone = 'Phone number cannot exceed 30 characters.';
  } else if (!/^[+0-9\s\-()./]+$/.test(phone) || phone.indexOf('+') > 0 || phone.split('+').length > 2) {
    errors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567 or 07700 900461).';
  }

  // Email Validation (optional)
  let email = null;
  if (rawEmail) {
    if (rawEmail.length > 254) {
      errors.email = 'Email address cannot exceed 254 characters.';
    } else if (!EMAIL_REGEX.test(rawEmail) || rawEmail.includes('..')) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    } else {
      email = rawEmail.toLowerCase();
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
