const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHAR_REGEX = /^[+0-9\s\-()./]+$/;

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
  
  // 1. Name validation
  let name = '';
  if (data.name !== undefined && data.name !== null) {
    name = String(data.name).trim();
  }
  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  }

  // 2. Phone validation (preserving leading zeros, +, etc.)
  let phone = '';
  if (data.phone !== undefined && data.phone !== null) {
    phone = String(data.phone).trim();
  }
  const digitCount = phone.replace(/\D/g, '').length;
  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (phone.length < 3 || digitCount < 3) {
    errors.phone = 'Phone number must contain at least 3 digits.';
  } else if (phone.length > 30) {
    errors.phone = 'Phone number cannot exceed 30 characters.';
  } else if (!PHONE_CHAR_REGEX.test(phone)) {
    errors.phone = 'Please enter a valid phone number (e.g. +1 (555) 123-4567 or 07700 900461).';
  }

  // 3. Email validation (optional)
  let email = null;
  if (data.email !== undefined && data.email !== null) {
    const trimmedEmail = String(data.email).trim();
    if (trimmedEmail.length > 0) {
      if (trimmedEmail.length > 254) {
        errors.email = 'Email address cannot exceed 254 characters.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address.';
      } else {
        email = trimmedEmail.toLowerCase();
      }
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
