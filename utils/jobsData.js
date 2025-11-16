// Shared mock job postings used by career-office and student views.
// Replace with API fetch in production.
export const jobsData = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
  location: 'Manila, Philippines (Remote)',
    type: 'Full-time',
  salary: '₱80,000 - ₱110,000',
    posted: '2023-10-15',
    deadline: '2023-11-15',
    status: 'Active',
    applications: 12,
    description: 'TechCorp is seeking a talented Frontend Developer to join our growing team...',
    requirements: ['3+ years of experience with React', 'Strong JavaScript skills', 'Experience with responsive design'],
    featured: true
  },
  {
    id: 2,
    title: 'UX Designer',
    company: 'Creative Solutions',
  location: 'Quezon City, Philippines (On-site)',
    type: 'Full-time',
  salary: '₱75,000 - ₱95,000',
    posted: '2023-10-14',
    deadline: '2023-11-14',
    status: 'Active',
    applications: 8,
    description: 'Creative Solutions is looking for a UX Designer to create amazing user experiences...',
    requirements: ['Portfolio demonstrating UX work', 'Experience with Figma or Sketch', 'User research skills'],
    featured: true
  },
  {
    id: 3,
    title: 'Data Analyst',
    company: 'DataViz Corp',
  location: 'Cebu, Philippines (Hybrid)',
    type: 'Full-time',
  salary: '₱65,000 - ₱85,000',
    posted: '2023-10-13',
    deadline: '2023-11-13',
    status: 'Active',
    applications: 5,
    description: 'DataViz Corp needs a Data Analyst to help interpret complex data sets...',
    requirements: ['SQL proficiency', 'Experience with data visualization tools', 'Statistical analysis background'],
    featured: false
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'WebSolutions Ltd',
  location: 'Davao, Philippines (Remote)',
    type: 'Contract',
  salary: '₱50-70/hour',
    posted: '2023-10-12',
    deadline: '2023-11-12',
    status: 'Active',
    applications: 15,
    description: 'WebSolutions is hiring a Full Stack Developer for a 6-month contract with possibility of extension...',
    requirements: ['Node.js and React experience', 'Database design skills', 'API development'],
    featured: false
  },
  {
    id: 5,
    title: 'Marketing Specialist',
    company: 'BrandBoost Agency',
  location: 'Makati, Philippines (On-site)',
    type: 'Part-time',
  salary: '₱25-35/hour',
    posted: '2023-10-11',
    deadline: '2023-11-11',
    status: 'Active',
    applications: 7,
    description: 'BrandBoost Agency is seeking a part-time Marketing Specialist to support our campaigns...',
    requirements: ['Digital marketing experience', 'Social media management', 'Content creation skills'],
    featured: false
  },
  {
    id: 6,
    title: 'Product Manager',
    company: 'InnovateTech',
  location: 'Iloilo, Philippines (Hybrid)',
    type: 'Full-time',
  salary: '₱90,000 - ₱120,000',
    posted: '2023-10-10',
    deadline: '2023-11-10',
    status: 'Active',
    applications: 10,
    description: 'InnovateTech is looking for an experienced Product Manager to lead our product development...',
    requirements: ['3+ years in product management', 'Agile methodology experience', 'Technical background preferred'],
    featured: true
  }
];

export default jobsData;
