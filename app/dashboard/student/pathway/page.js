'use client';
import { useState } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card, { CardHeader, CardBody, CardFooter } from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import styles from './pathway.module.css';

// Example role-to-pathway data (in real app, fetch from API or config)
const ROLE_PATHWAYS = [
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
  },
  // Add more roles as needed
];

export default function CareerPathwayPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const pathway = ROLE_PATHWAYS.find((r) => r.role === selectedRole);

  return (
    <DashboardLayout userType="student">
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Career Pathway Recommender</h1>
        <p className={styles.subtitle}>Select your target role to see recommended skills, courses, and certifications.</p>
      </div>

      <div className={styles.flexRow}>
        <div className={styles.selectorCol}>
          <Card className={styles.selectorCard}>
            <CardHeader>
              <label htmlFor="role-select" className={styles.label}>Target Role</label>
            </CardHeader>
            <CardBody>
              <select
                id="role-select"
                className={styles.select}
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="">-- Select a role --</option>
                {ROLE_PATHWAYS.map((r) => (
                  <option key={r.role} value={r.role}>{r.role}</option>
                ))}
              </select>
            </CardBody>
          </Card>
        </div>
        <div className={styles.recommendCol}>
          {pathway && (
            <div className={styles.recommendations}>
              <Card className={styles.pathwayCard}>
                <CardHeader>
                  <h2 className={styles.roleTitle}>{pathway.role}</h2>
                </CardHeader>
                <CardBody>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Recommended Skills</h3>
                    <ul className={styles.list}>
                      {pathway.skills.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Recommended Courses</h3>
                    <ul className={styles.list}>
                      {pathway.courses.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Certifications</h3>
                    <ul className={styles.list}>
                      {pathway.certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button variant="primary" href="/dashboard/student/profile">Update My Profile</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
