import Link from 'next/link';
import styles from './auth-login.module.css';

export default function AuthLogin() {
  const userRoles = [
    {
      title: 'Student',
      description: 'Access jobs, events, and career resources',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      link: '/login',
      color: '#3498db',
      features: ['Access job listings', 'Build your portfolio', 'Attend career events']
    },
    {
      title: 'Employer',
      description: 'Post jobs and find talented candidates',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      link: '/employer/login',
      color: '#e67e22',
      features: ['Post job openings', 'Review applications', 'Connect with talent']
    },
    {
      title: 'Alumni',
      description: 'Mentor students and share opportunities',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      link: '/alumni/login',
      color: '#f97316',
      features: ['Create mentorship groups', 'Share opportunities', 'Connect with students']
    },
    {
      title: 'Career Office',
      description: 'Manage jobs, events, and student profiles',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      link: '/career-office/login',
      color: '#9b59b6',
      features: ['Manage job postings', 'Organize events', 'Monitor student progress']
    },
    {
      title: 'Faculty Mentor',
      description: 'Monitor and guide students in their OJT journey',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <path d="M12 14l-2-2m0 0l2-2m-2 2h8"/>
        </svg>
      ),
      link: '/faculty-mentor/login',
      color: '#27ae60',
      features: ['Monitor student OJT status', 'Review student notes', 'Track OJT progress']
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Select your role to login</p>
      </div>

      <div className={styles.rolesGrid}>
        {userRoles.map((role, index) => (
          <div key={index} className={styles.roleCardWrapper}>
            <Link 
              href={role.link} 
              className={styles.roleCard}
              style={{ '--role-color': role.color }}
            >
              <div className={styles.roleIcon}>
                {role.icon}
              </div>
              <h2 className={styles.roleTitle}>{role.title}</h2>
              <p className={styles.roleDescription}>{role.description}</p>
              
              <ul className={styles.featureList}>
                {role.features.map((feature, idx) => (
                  <li key={idx}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className={styles.roleArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>Don't have an account? <Link href="/auth/register">Register here</Link></p>
        <Link href="/" className={styles.backLink}>Back to Home</Link>
      </div>
    </div>
  );
}
