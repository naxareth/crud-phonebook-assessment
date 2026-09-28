// PostgreSQL UUID accepts any hexadecimal UUID, including deterministic seed IDs.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Allowed phone formatting characters (digits, spaces, hyphens, parens, dots, slashes, optional leading +)
const PHONE_ALLOWED_REGEX = /^[+]?[0-9\s\-()./]+$/;

// Unicode letters, spaces, dots, hyphens, apostrophes, and commas for human names
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
      if (!isValidEmail(cleaned)) {
        errors.email = 'Please enter a valid email address with a recognized domain (e.g. name@example.com or name@example.ph).';
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
