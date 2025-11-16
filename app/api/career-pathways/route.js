import { adminDb } from '../../../lib/firebaseAdmin';

export async function GET(req) {
  try {
    // Fetch career pathways from database
    const pathwaysSnapshot = await adminDb.collection('careerPathways')
      .orderBy('role', 'asc')
      .get();
    
    const pathways = pathwaysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no pathways in database, return default ones
    if (pathways.length === 0) {
      const defaultPathways = [
        {
          role: 'Frontend Developer',
          skills: [
            'HTML/CSS',
            'JavaScript',
            'React.js',
            'Responsive Design',
            'Version Control (Git)'
          ],
          courses: [
            'Coursera: HTML, CSS, and Javascript for Web Developers',
            'freeCodeCamp: Responsive Web Design',
            'Udemy: React - The Complete Guide'
          ],
          certifications: [
            'Meta Front-End Developer (Coursera)',
            'Microsoft Certified: Front End Web Developer Associate'
          ]
        },
        {
          role: 'Data Analyst',
          skills: [
            'SQL',
            'Data Visualization',
            'Python',
            'Statistics',
            'Excel'
          ],
          courses: [
            'Google Data Analytics Professional Certificate',
            'Coursera: Data Visualization with Python',
            'Udemy: SQL Bootcamp'
          ],
          certifications: [
            'Google Data Analytics Professional Certificate',
            'Microsoft Certified: Data Analyst Associate'
          ]
        },
        {
          role: 'UX Designer',
          skills: [
            'User Research',
            'Wireframing',
            'Figma/Sketch',
            'Prototyping',
            'Usability Testing'
          ],
          courses: [
            'Coursera: Google UX Design',
            'Interaction Design Foundation: Become a UX Designer',
            'Udemy: User Experience Design Essentials'
          ],
          certifications: [
            'Google UX Design Professional Certificate',
            'Certified Usability Analyst (CUA)'
          ]
        }
      ];
      
      return new Response(JSON.stringify({ pathways: defaultPathways }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ pathways }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching career pathways:', error);
    
    // Return default pathways on error
    const defaultPathways = [
      {
        role: 'Frontend Developer',
        skills: ['HTML/CSS', 'JavaScript', 'React.js', 'Responsive Design', 'Version Control (Git)'],
        courses: ['Coursera: HTML, CSS, and Javascript for Web Developers', 'freeCodeCamp: Responsive Web Design', 'Udemy: React - The Complete Guide'],
        certifications: ['Meta Front-End Developer (Coursera)', 'Microsoft Certified: Front End Web Developer Associate']
      },
      {
        role: 'Data Analyst',
        skills: ['SQL', 'Data Visualization', 'Python', 'Statistics', 'Excel'],
        courses: ['Google Data Analytics Professional Certificate', 'Coursera: Data Visualization with Python', 'Udemy: SQL Bootcamp'],
        certifications: ['Google Data Analytics Professional Certificate', 'Microsoft Certified: Data Analyst Associate']
      },
      {
        role: 'UX Designer',
        skills: ['User Research', 'Wireframing', 'Figma/Sketch', 'Prototyping', 'Usability Testing'],
        courses: ['Coursera: Google UX Design', 'Interaction Design Foundation: Become a UX Designer', 'Udemy: User Experience Design Essentials'],
        certifications: ['Google UX Design Professional Certificate', 'Certified Usability Analyst (CUA)']
      }
    ];
    
    return new Response(JSON.stringify({ pathways: defaultPathways }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
