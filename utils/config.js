/**
 * Configuration utility functions
 * Provides easy access to configuration values throughout the application
 */

'use client';

// Use dynamic import for Next.js compatibility
let config;
try {
  config = require('../config');
} catch (error) {
  // Fallback to development config if import fails
  config = require('../config/development');
}

/**
 * Get a configuration value by path
 * @param {string} path - Dot notation path to the configuration value
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - The configuration value or default value
 */
const getConfig = (path, defaultValue = undefined) => {
  if (!path) return config;
  
  const keys = path.split('.');
  let result = config;
  
  for (const key of keys) {
    if (result === undefined || result === null || !result.hasOwnProperty(key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
};

/**
 * Get authentication configuration
 * @returns {Object} - Authentication configuration
 */
const getAuthConfig = () => getConfig('auth');

/**
 * Get navigation configuration
 * @returns {Object} - Navigation configuration
 */
const getNavConfig = () => getConfig('navigation');

/**
 * Get UI configuration
 * @returns {Object} - UI configuration
 */
const getUIConfig = () => getConfig('ui');

/**
 * Get application configuration
 * @returns {Object} - Application configuration
 */
const getAppConfig = () => getConfig('app');

/**
 * Get validation configuration
 * @returns {Object} - Validation configuration
 */
const getValidationConfig = () => getConfig('validation');

/**
 * Shared logout function for both Navbar and Dashboard
 */
const logout = async () => {
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {}
    window.location.href = '/';
  }
};

// Export all configuration functions
module.exports = {
  getConfig,
  getAuthConfig,
  getNavConfig,
  getUIConfig,
  getAppConfig,
  getValidationConfig,
  logout
};