// PostgreSQL UUID accepts any hexadecimal UUID, including deterministic seed IDs.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Strict RFC-compliant email regex ensuring a valid 2-10 letter TLD
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

// Allowed phone formatting characters (digits, spaces, hyphens, parens, dots, slashes, optional leading +)
const PHONE_ALLOWED_REGEX = /^[+]?[0-9\s\-()./]+$/;

// Unicode letters, spaces, dots, hyphens, apostrophes, and commas for human names
const NAME_REGEX = /^[a-zA-Z\p{L}\s.'\-,]+$/u;

/**
 * Sanitizes a raw string by:
 * 1. Coercing to string & Unicode normalization (NFC)
 * 2. Removing non-printable/invisible control characters (ASCII 0-31, 127)
 * 3. Stripping dangerous HTML/script tags to prevent stored XSS
 * 4. Collapsing multiple spaces into a single space
 * 5. Trimming leading and trailing whitespace
 *
 * @param {any} val
 * @returns {string}
 */
export const sanitizeString = (val) => {
  if (val === null || val === undefined) {
    return '';
  }

  return String(val)
    .normalize('NFC')
    // Remove control characters (null bytes, control codes)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tags (<script>, <b>, <img>, etc.)
    .replace(/<[^>]*>?/gm, '')
    // Collapse multiple consecutive spaces/tabs/newlines into a single space
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Validates a UUID string
 * @param {string} id 
 * @returns {boolean}
 */
export const isValidUUID = (id) => {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
};

/**
 * Validates and sanitizes contact payload
 * @param {object} data
 * @param {string} [data.name]
 * @param {string} [data.phone]
 * @param {string} [data.email]
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitized: { name: string, phone: string, email: string | null } }}
 */
export const validateContactInput = (data = {}) => {
  const errors = {};

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: { _general: 'Invalid request payload. Expected a JSON object.' },
      sanitized: { name: '', phone: '', email: null }
    };
  }

  // 1. Name Sanitization & Validation
  const rawName = data.name !== undefined && data.name !== null ? String(data.name) : '';
  const sanitizedName = sanitizeString(rawName);
  const letterCount = sanitizedName.replace(/[^a-zA-Z\p{L}]/gu, '').length;

  if (!sanitizedName) {
    errors.name = 'Full name is required.';
  } else if (sanitizedName.length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  } else if (/\d/.test(sanitizedName)) {
    errors.name = 'Full name cannot contain numbers.';
  } else if (!NAME_REGEX.test(sanitizedName) || letterCount < 2) {
    errors.name = 'Full name must contain at least 2 letters and only valid characters (letters, spaces, hyphens, apostrophes).';
  }

  // 2. Phone Sanitization & Validation
  const rawPhone = data.phone !== undefined && data.phone !== null ? String(data.phone) : '';
  const sanitizedPhone = sanitizeString(rawPhone);
  const digitCount = sanitizedPhone.replace(/\D/g, '').length;

  if (!sanitizedPhone) {
    errors.phone = 'Phone number is required.';
  } else if (/[a-zA-Z]/.test(sanitizedPhone)) {
    errors.phone = 'Phone number cannot contain letters.';
  } else if (sanitizedPhone.length < 3 || digitCount < 3) {
    errors.phone = 'Phone number must contain at least 3 digits.';
  } else if (digitCount > 15) {
    errors.phone = 'Phone number cannot exceed 15 digits (ITU-T E.164 standard).';
  } else if (sanitizedPhone.length > 30) {
    errors.phone = 'Phone number cannot exceed 30 characters.';
  } else if (!PHONE_ALLOWED_REGEX.test(sanitizedPhone) || sanitizedPhone.indexOf('+') > 0 || (sanitizedPhone.match(/\+/g) || []).length > 1) {
    errors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567 or 07700 900461).';
  }

  // 3. Email Sanitization & Validation (optional)
  let sanitizedEmail = null;
  if (data.email !== undefined && data.email !== null) {
    const rawEmail = String(data.email);
    const cleaned = sanitizeString(rawEmail).toLowerCase();
    
    if (cleaned.length > 0) {
      if (cleaned.length > 254) {
        errors.email = 'Email address cannot exceed 254 characters.';
      } else if (!EMAIL_REGEX.test(cleaned) || cleaned.includes('..') || cleaned.startsWith('.') || cleaned.endsWith('.')) {
        errors.email = 'Please enter a valid email address with a valid domain (e.g. name@example.com).';
      } else {
        sanitizedEmail = cleaned;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: sanitizedName,
      phone: sanitizedPhone,
      email: sanitizedEmail
    }
  };
};
