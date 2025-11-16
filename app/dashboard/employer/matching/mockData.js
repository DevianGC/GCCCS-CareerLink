// Mock data for AI Candidate Matching
// In production, this would be replaced with API calls

export const MOCK_JOBS = [
  { id: 1, title: 'Senior Software Engineer', department: 'Engineering' },
  { id: 2, title: 'UX Designer', department: 'Design' },
  { id: 3, title: 'Data Analyst', department: 'Analytics' },
  { id: 4, title: 'Marketing Manager', department: 'Marketing' }
];

export const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 123-4567',
    matchScore: 95,
    aiInsights: { skillMatch: 98, experienceMatch: 92, educationMatch: 95, cultureFit: 94 },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: '6 years',
    education: 'MS Computer Science',
    currentRole: 'Senior Developer at Tech Corp',
    location: 'San Francisco, CA',
    availability: 'Immediate',
    salary: '$120k - $140k',
    keyStrengths: [
      'Strong full-stack development experience',
      'Leadership in agile teams',
      'Cloud architecture expertise'
    ],
    resume: 'alex_thompson_resume.pdf',
    portfolio: 'https://alexthompson.dev'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1 (555) 234-5678',
    matchScore: 92,
    aiInsights: { skillMatch: 95, experienceMatch: 88, educationMatch: 93, cultureFit: 92 },
    skills: ['React', 'TypeScript', 'GraphQL', 'MongoDB', 'Redis'],
    experience: '5 years',
    education: 'BS Software Engineering',
    currentRole: 'Full Stack Engineer at StartupXYZ',
    location: 'New York, NY',
    availability: '2 weeks notice',
    salary: '$110k - $130k',
    keyStrengths: [
      'Excellent problem-solving skills',
      'Experience with microservices',
      'Strong communication abilities'
    ],
    resume: 'sarah_chen_resume.pdf',
    portfolio: 'https://sarahchen.io'
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    matchScore: 88,
    aiInsights: { skillMatch: 90, experienceMatch: 85, educationMatch: 88, cultureFit: 89 },
    skills: ['Python', 'Django', 'PostgreSQL', 'React', 'Docker'],
    experience: '4 years',
    education: 'BS Computer Science',
    currentRole: 'Software Developer at Digital Solutions',
    location: 'Austin, TX',
    availability: '1 month notice',
    salary: '$100k - $120k',
    keyStrengths: [
      'Backend development expertise',
      'Database optimization skills',
      'Team collaboration'
    ],
    resume: 'michael_rodriguez_resume.pdf',
    portfolio: 'https://mrodriguez.dev'
  },
  {
    id: 4,
    name: 'Emily Watson',
    email: 'emily.watson@email.com',
    phone: '+1 (555) 456-7890',
    matchScore: 85,
    aiInsights: { skillMatch: 87, experienceMatch: 82, educationMatch: 86, cultureFit: 85 },
    skills: ['JavaScript', 'Vue.js', 'Node.js', 'MySQL', 'Git'],
    experience: '3 years',
    education: 'BS Information Technology',
    currentRole: 'Junior Developer at WebTech Inc',
    location: 'Seattle, WA',
    availability: 'Immediate',
    salary: '$90k - $110k',
    keyStrengths: [
      'Fast learner with growth mindset',
      'Strong frontend skills',
      'Attention to detail'
    ],
    resume: 'emily_watson_resume.pdf',
    portfolio: 'https://emilywatson.com'
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 567-8901',
    matchScore: 82,
    aiInsights: { skillMatch: 84, experienceMatch: 80, educationMatch: 82, cultureFit: 83 },
    skills: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Kubernetes'],
    experience: '4 years',
    education: 'BS Computer Engineering',
    currentRole: 'Software Engineer at Enterprise Corp',
    location: 'Boston, MA',
    availability: '3 weeks notice',
    salary: '$95k - $115k',
    keyStrengths: [
      'Enterprise application development',
      'System design experience',
      'Mentoring junior developers'
    ],
    resume: 'david_kim_resume.pdf',
    portfolio: 'https://davidkim.tech'
  },
  {
    id: 6,
    name: 'Jessica Martinez',
    email: 'jessica.martinez@email.com',
    phone: '+1 (555) 678-9012',
    matchScore: 78,
    aiInsights: { skillMatch: 80, experienceMatch: 75, educationMatch: 79, cultureFit: 78 },
    skills: ['Python', 'Flask', 'JavaScript', 'MongoDB', 'AWS'],
    experience: '2 years',
    education: 'BS Software Development',
    currentRole: 'Developer at Innovation Labs',
    location: 'Denver, CO',
    availability: '2 weeks notice',
    salary: '$85k - $100k',
    keyStrengths: [
      'API development expertise',
      'Cloud deployment experience',
      'Agile methodology'
    ],
    resume: 'jessica_martinez_resume.pdf',
    portfolio: 'https://jmartinez.dev'
  }
];

// Utility functions
export const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Good Match';
  if (score >= 70) return 'Fair Match';
  return 'Low Match';
};

export const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('');
};

// Simulate API delay
export const simulateApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
