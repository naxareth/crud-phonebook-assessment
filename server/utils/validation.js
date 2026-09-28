const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// RFC 5322 compliant regex with proper domain and TLD checks
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Permissive international phone format: optional leading +, digits, spaces, hyphens, parens, dots, slashes
const PHONE_CHAR_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{2,26}$/;

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

  if (!sanitizedName) {
    errors.name = 'Full name is required.';
  } else if (sanitizedName.length < 1) {
    errors.name = 'Full name must be at least 1 character.';
  } else if (sanitizedName.length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  } else if (!/[a-zA-Z\p{L}0-9]/u.test(sanitizedName)) {
    // Requires at least one letter or alphanumeric character (supports all Unicode alphabets)
    errors.name = 'Full name must contain at least one letter or number.';
  }

  // 2. Phone Sanitization & Validation (preserving leading zeros, +, etc.)
  const rawPhone = data.phone !== undefined && data.phone !== null ? String(data.phone) : '';
  const sanitizedPhone = sanitizeString(rawPhone);
  const digitCount = sanitizedPhone.replace(/\D/g, '').length;

  if (!sanitizedPhone) {
    errors.phone = 'Phone number is required.';
  } else if (sanitizedPhone.length < 3 || digitCount < 3) {
    errors.phone = 'Phone number must contain at least 3 digits.';
  } else if (digitCount > 20) {
    errors.phone = 'Phone number cannot contain more than 20 digits.';
  } else if (sanitizedPhone.length > 30) {
    errors.phone = 'Phone number cannot exceed 30 characters.';
  } else if (!/^[+0-9\s\-()./]+$/.test(sanitizedPhone) || sanitizedPhone.indexOf('+') > 0 || sanitizedPhone.split('+').length > 2) {
    errors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567 or 07700 900461).';
  }

  // 3. Email Sanitization & Validation (optional)
  let sanitizedEmail = null;
  if (data.email !== undefined && data.email !== null) {
    const rawEmail = String(data.email);
    const cleaned = sanitizeString(rawEmail);
    
    if (cleaned.length > 0) {
      if (cleaned.length > 254) {
        errors.email = 'Email address cannot exceed 254 characters.';
      } else if (!EMAIL_REGEX.test(cleaned) || cleaned.includes('..')) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com).';
      } else {
        sanitizedEmail = cleaned.toLowerCase();
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
