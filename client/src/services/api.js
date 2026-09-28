/**
 * Client API Service for Contact CRUD operations
 */

const API_BASE = '/api/contacts';

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Handle API responses and extract JSON errors if any
 */
async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage = (data && data.error) || `Request failed with status ${response.status}`;
    const details = (data && data.details) || {};
    throw new ApiError(errorMessage, response.status, details);
  }

  return data;
}

export const api = {
  /**
   * Fetch all contacts
   * @returns {Promise<Array>}
   */
  async getContacts() {
    const res = await fetch(API_BASE, {
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  },

  /**
   * Create a new contact
   * @param {{ name: string, phone: string, email?: string }} contact
   * @returns {Promise<Object>}
   */
  async createContact(contact) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    return handleResponse(res);
  },

  /**
   * Update an existing contact
   * @param {string} id
   * @param {{ name: string, phone: string, email?: string }} contact
   * @returns {Promise<Object>}
   */
  async updateContact(id, contact) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    return handleResponse(res);
  },

  /**
   * Delete a contact by ID
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteContact(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  }
};
