// utils/api.js
import { signOut } from 'next-auth/react';

/**
 * Utility for making API requests with standard error handling and authentication
 */
export const api = {
  /**
   * Make a GET request to the API
   * @param {string} url - The URL to fetch from
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * Make a POST request to the API
   * @param {string} url - The URL to fetch from
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Make a PUT request to the API
   * @param {string} url - The URL to fetch from
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Make a DELETE request to the API
   * @param {string} url - The URL to fetch from
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },

  /**
   * Make a PATCH request to the API
   * @param {string} url - The URL to fetch from
   * @param {Object} data - The data to send in the request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Base request method with error handling
   * @param {string} url - The URL to fetch from
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // Handle HTTP errors
      if (!response.ok) {
        // Handle unauthorized error (session expired)
        if (response.status === 401) {
          // Sign out user if unauthorized
          signOut({ callbackUrl: '/login' });
          throw new Error('Your session has expired. Please sign in again.');
        }

        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Error: ${response.status} ${response.statusText}`;
        } catch (e) {
          errorMessage = `Error: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses
      return await response.text();
    } catch (error) {
      // Handle network errors or JSON parsing errors
      console.error('API request failed:', error);
      throw error;
    }
  },

  /**
   * Helper to build query parameters
   * @param {Object} params - The query parameters
   * @returns {string} - The query string
   */
  buildQueryParams(params) {
    if (!params || Object.keys(params).length === 0) return '';
    
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        // Handle Date objects
        if (value instanceof Date) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value.toISOString())}`;
        }
        // Handle arrays
        if (Array.isArray(value)) {
          return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
        }
        // Handle everything else
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
    
    return queryString ? `?${queryString}` : '';
  },

  /**
   * Get data with pagination
   * @param {string} url - The base URL to fetch from
   * @param {Object} params - Query parameters for pagination, filtering, etc.
   * @returns {Promise<Object>} - Paginated response
   */
  async getPaginated(url, params = {}) {
    const queryString = this.buildQueryParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...params
    });
    
    return this.get(`${url}${queryString}`);
  },

  /**
   * Upload a file
   * @param {string} url - The URL to upload to
   * @param {File|FormData} fileOrFormData - The file or FormData to upload
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - The JSON response
   */
  async uploadFile(url, fileOrFormData, options = {}) {
    let formData;
    
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('file', fileOrFormData);
    }
    
    const headers = {
      ...options.headers
      // Content-Type is automatically set by the browser for FormData
    };
    
    return this.request(url, {
      method: 'POST',
      body: formData,
      headers,
      ...options
    });
  }
};

/**
 * API endpoints - centralized location for API URLs
 */
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    resetPassword: '/api/auth/reset-password',
  },
  users: {
    base: '/api/users',
    detail: (id) => `/api/users/${id}`,
    profile: '/api/users/profile',
  },
  employees: {
    base: '/api/employees',
    detail: (id) => `/api/employees/${id}`,
  },
  departments: {
    base: '/api/departments',
    detail: (id) => `/api/departments/${id}`,
  },
  attendance: {
    base: '/api/attendance',
    detail: (id) => `/api/attendance/${id}`,
    byEmployee: (id) => `/api/attendance/employee/${id}`,
  },
  leave: {
    base: '/api/leave',
    detail: (id) => `/api/leave/${id}`,
    byEmployee: (id) => `/api/leave/employee/${id}`,
  },
  compliance: {
    base: '/api/compliance',
    detail: (id) => `/api/compliance/${id}`,
    byEmployee: (id) => `/api/compliance/employee/${id}`,
    expiring: '/api/compliance/expiring',
  },
  documents: {
    base: '/api/documents',
    detail: (id) => `/api/documents/${id}`,
    byDepartment: (id) => `/api/documents/department/${id}`,
  },
  dashboard: {
    stats: '/api/dashboard/stats',
  },
};

export default api;