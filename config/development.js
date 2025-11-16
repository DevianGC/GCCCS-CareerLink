/**
 * Development environment configuration
 */

module.exports = {
  // Application settings
  app: {
    name: 'GCCCS CareerLink',
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
  },
  
  // Authentication settings
  auth: {
    tokenKey: 'token',
    userRoleKey: 'userRole',
    roles: {
      student: 'student',
      careerOffice: 'career_office',
      alumni: 'alumni'
    },
    defaultRole: 'student',
    tokens: {
      student: 'student-token',
      careerOffice: 'career-office-token',
      alumni: 'alumni-token'
    }
  },
  
  // Navigation settings
  navigation: {
    publicLinks: [
      { name: 'Home', path: '/' },
      { name: 'Events', path: '/events' },
      { name: 'About', path: '/about' },
    ],
    authenticatedLinks: {
      student: [
        { name: 'Events', path: '/events' },
        { name: 'About', path: '/about' },
        { name: 'Dashboard', path: '/dashboard/student' },
      ],
      careerOffice: [
        { name: 'Events', path: '/events' },
        { name: 'About', path: '/about' },
        { name: 'Dashboard', path: '/dashboard/career-office' },
      ],
      // Alumni dashboard
      alumni: [
        { name: 'Events', path: '/events' },
        { name: 'About', path: '/about' },
        { name: 'Dashboard', path: '/dashboard/alumni' },
      ],
    },
    dashboardRedirects: {
      student: '/dashboard/student',
      careerOffice: '/dashboard/career-office',
      alumni: '/dashboard/alumni',
    },
  },
  
  // UI settings
  ui: {
    theme: {
      primary: '#FF6600',
      primaryLight: '#FF8533',
      primaryDark: '#CC5200',
      background: '#FFFFFF',
      foreground: '#171717',
    },
    breakpoints: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  
  // Form validation settings
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    passwordMinLength: 6,
  },
};