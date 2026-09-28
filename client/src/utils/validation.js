/**
 * Client-Side Validation & Sanitization Utilities
 */

// Allowed phone formatting characters
const PHONE_ALLOWED_REGEX = /^[+]?[0-9\s\-()./]+$/;

// Unicode letters, spaces, dots, hyphens, apostrophes, and commas
const NAME_REGEX = /^[a-zA-Z\p{L}\s.'\-,]+$/u;

// Comprehensive set of standard IANA generic and country-code top-level domains (TLDs)
const VALID_TLDS = new Set([
  // Common generic TLDs
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
  'io', 'ai', 'co', 'me', 'dev', 'app', 'tech', 'xyz', 'online', 'site', 'store',
  'club', 'space', 'design', 'blog', 'cloud', 'digital', 'agency', 'media',
  'world', 'global', 'network', 'systems', 'email', 'link', 'live', 'page',
  // Common country codes
  'ph', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'es', 'it', 'nl',
  'se', 'no', 'fi', 'dk', 'br', 'mx', 'sg', 'nz', 'hk', 'tw', 'kr', 'za', 'eu',
  'ch', 'at', 'be', 'pl', 'ru', 'ua', 'ie', 'pt', 'gr', 'cz', 'ro', 'hu', 'vn',
  'th', 'my', 'id', 'cc', 'tv', 'fm', 'so', 'gg', 'to'
]);

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
 * Validates email address syntax and verifies top-level domain validity
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  
  if (
    trimmed.length > 254 ||
    trimmed.includes('..') ||
    trimmed.includes(' ') ||
    trimmed.startsWith('.') ||
    trimmed.endsWith('.')
  ) {
    return false;
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;

  if (
    !local ||
    !domain ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)
  ) {
    return false;
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;

  for (const label of domainParts) {
    if (!label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)) {
      return false;
    }
  }

  const tld = domainParts[domainParts.length - 1];
  return VALID_TLDS.has(tld);
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
    if (!isValidEmail(cleaned)) {
      errors.email = 'Please enter a valid email address with a recognized domain (e.g. name@example.com or name@example.ph).';
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
