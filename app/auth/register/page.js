'use client';
import Link from 'next/link';
import styles from './auth-register.module.css';

export default function AuthRegister() {
  const userRoles = [
    {
      title: 'Student',
      description: 'Create your profile and start your career journey',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      link: '/register',
      color: '#3498db',
      features: ['Access job listings', 'Build your portfolio', 'Attend career events']
    },
    {
      title: 'Employer',
      description: 'Find and recruit talented GCCCS students',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      link: '/employer/register',
      color: '#e67e22',
      features: ['Post job openings', 'Review applications', 'Connect with talent']
    },
    {
      title: 'Alumni',
      description: 'Give back and mentor the next generation',
      icon: (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      link: '/alumni/register',
      color: '#f97316',
      features: ['Create mentorship groups', 'Share opportunities', 'Connect with students']
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Join CareerLink</h1>
        <p className={styles.subtitle}>Select your role to get started</p>
      </div>

      <div className={styles.rolesGrid}>
        {userRoles.map((role, index) => (
          <div key={index} className={styles.roleCardWrapper}>
            <Link 
              href={role.link} 
              className={`${styles.roleCard} ${role.note ? styles.disabled : ''}`}
              style={{ '--role-color': role.color }}
              onClick={(e) => role.note && e.preventDefault()}
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

              {role.note ? (
                <div className={styles.note}>{role.note}</div>
              ) : (
                <div className={styles.roleArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>Already have an account? <Link href="/auth/login">Login here</Link></p>
        <Link href="/" className={styles.backLink}>Back to Home</Link>
      </div>
    </div>
  );
}
