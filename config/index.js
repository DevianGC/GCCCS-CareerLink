/**
 * Configuration system for GCCCS CareerLink
 * This file exports the configuration based on the current environment
 */

const development = require('./development');
const production = require('./production');
const test = require('./test');

// Determine which environment to use
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return production;
    case 'test':
      return test;
    case 'development':
    default:
      return development;
  }
};

// Export the configuration for the current environment
module.exports = getConfig();