// Configuration System Test
'use strict';

// Import configuration utilities
const { getConfig, getAuthConfig, getNavConfig, getUIConfig, getAppConfig, getValidationConfig } = require('../utils/config');

// Test function to verify configuration system flexibility
function testConfigSystem() {
  console.log('\n===== TESTING CONFIGURATION SYSTEM FLEXIBILITY =====\n');
  
  // Test 1: Access full configuration
  const fullConfig = getConfig();
  console.log('1. Full Configuration Access:', Object.keys(fullConfig));
  
  // Test 2: Access specific configuration sections
  const authConfig = getAuthConfig();
  const navConfig = getNavConfig();
  const uiConfig = getUIConfig();
  const appConfig = getAppConfig();
  const validationConfig = getValidationConfig();
  
  console.log('\n2. Specific Configuration Sections:');
  console.log('   - Auth Config Keys:', Object.keys(authConfig));
  console.log('   - Nav Config Keys:', Object.keys(navConfig));
  console.log('   - UI Config Keys:', Object.keys(uiConfig));
  console.log('   - App Config Keys:', Object.keys(appConfig));
  console.log('   - Validation Config Keys:', Object.keys(validationConfig));
  
  // Test 3: Verify environment-specific configuration
  console.log('\n3. Environment-specific Configuration:');
  console.log('   - Current Environment:', process.env.NODE_ENV || 'development');
  console.log('   - App Name:', appConfig.name);
  console.log('   - Base URL:', appConfig.baseUrl);
  
  // Test 4: Verify authentication configuration
  console.log('\n4. Authentication Configuration:');
  console.log('   - Token Key:', authConfig.tokenKey);
  console.log('   - User Role Key:', authConfig.userRoleKey);
  console.log('   - Available Roles:', Object.keys(authConfig.roles).map(role => `${role}: ${authConfig.roles[role]}`));
  
  // Test 5: Verify navigation configuration
  console.log('\n5. Navigation Configuration:');
  console.log('   - Public Links:', navConfig.publicLinks.map(link => `${link.name}: ${link.path}`));
  console.log('   - Student Links:', navConfig.authenticatedLinks.student.map(link => `${link.name}: ${link.path}`));
  
  // Test 6: Verify validation configuration
  console.log('\n6. Validation Configuration:');
  console.log('   - Email Pattern Test:', validationConfig.email.test('test@example.com'));
  console.log('   - Min Password Length:', validationConfig.passwordMinLength);
  
  console.log('\n===== CONFIGURATION SYSTEM TEST COMPLETE =====\n');
}

// Run the test
testConfigSystem();