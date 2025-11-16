'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './DashboardLayout.module.css';
import { logout } from '../../utils/config';

export default function DashboardLayout({ children, userType = 'student' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Always open on desktop
      } else {
        setIsSidebarOpen(false); // Closed by default on mobile
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const u = data?.user;
        if (!u || !isMounted) return;
        const first = (u.firstName || '').toString().trim();
        const last = (u.lastName || '').toString().trim();
        const full = (u.fullName || `${first} ${last}`).trim();
        const display = full || u.email || '';
        setUserName(display);

        const initials = (first[0] || '') + (last[0] || (first ? '' : (u.email || '?')[0] || ''));
        setUserInitials((initials || '?').toUpperCase());
      } catch {}
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const handleNavClick = () => {
    if (isMobile) setIsSidebarOpen(false);
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  // Define navigation links based on user type
  const navLinks = userType === 'student' || userType === 'graduate' 
    ? [
        { href: '/dashboard/student', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/student/profile', label: 'My Profile', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="13" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/student/jobs', label: 'Job Listings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="7" y="3" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/student/matching', label: 'AI Matching', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
        { href: '/dashboard/student/pathway', label: 'Career Pathway', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2"/><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/></svg> },
        { href: '/dashboard/student/mentorship', label: 'Mentorship', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="2"/><path d="M2 17c0-2.5 2.5-4.5 5.5-4.5S13 14.5 13 17" stroke="currentColor" strokeWidth="2"/><path d="M13 17c0-2.5 2.5-4.5 5.5-4.5S19 14.5 19 17" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/student/mentorship-groups', label: 'Mentorship Groups', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.5"/></svg> },
        { href: '/dashboard/student/ojt', label: 'My OJT', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="7" y="3" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M10 11v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/student/career-tips', label: 'Career Tips', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 14.93c-2.83.48-5.43-1.51-5.91-4.34-.07-.39.27-.73.66-.73.33 0 .61.23.67.55.36 1.93 2.19 3.19 4.11 2.83 1.93-.36 3.19-2.19 2.83-4.11-.36-1.93-2.19-3.19-4.11-2.83-.39.07-.73-.27-.73-.66 0-.33.23-.61.55-.67 2.83-.48 5.43 1.51 5.91 4.34.07.39-.27.73-.66.73-.33 0-.61-.23-.67-.55-.36-1.93-2.19-3.19-4.11-2.83-1.93.36-3.19 2.19-2.83 4.11.36 1.93 2.19 3.19 4.11 2.83.39-.07.73.27.73.66 0 .33-.23.61-.55.67z" fill="currentColor"/></svg> },
        { href: '/dashboard/student/applications', label: 'My Applications', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/student/events', label: 'Events', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/student/help', label: 'Help / FAQ', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M10 14v-2m0-6a2 2 0 0 1 2 2c0 1-1 2-2 2s-2 1-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
      ]
    : userType === 'employer'
    ? [
        { href: '/dashboard/employer', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/employer/profile', label: 'Company Profile', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/employer/jobs', label: 'Job Postings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="7" y="3" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/employer/matching', label: 'AI Matching', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
        { href: '/dashboard/employer/applicants', label: 'Applicants', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="13" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/employer/interviews', label: 'Interviews', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 9h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/employer/analytics', label: 'Analytics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
      ]
    : userType === 'alumni'
    ? [
        { href: '/dashboard/alumni', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/alumni/profile', label: 'My Profile', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="13" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/alumni/mentorship-groups', label: 'Mentorship Groups', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.5"/></svg> },
        { href: '/dashboard/alumni/help', label: 'Help / Support', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M10 14v-2m0-6a2 2 0 0 1 2 2c0 1-1 2-2 2s-2 1-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
      ]
    : userType === 'faculty-mentor'
    ? [
        { href: '/dashboard/faculty-mentor', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/faculty-mentor/sessions', label: 'Mentorship Sessions', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M13 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 9h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/faculty-mentor/profile', label: 'My Profile', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="13" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/faculty-mentor/reports', label: 'Reports & Activity', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 13H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/faculty-mentor/ojt', label: 'Manage Students OJT', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="2"/><path d="M2 17c0-2.5 2.5-4.5 5.5-4.5S13 14.5 13 17" stroke="currentColor" strokeWidth="2"/><path d="M13 17c0-2.5 2.5-4.5 5.5-4.5S19 14.5 19 17" stroke="currentColor" strokeWidth="2"/></svg> },
      ]
    : [
        { href: '/dashboard/career-office', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/career-office/jobs', label: 'Manage Jobs', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="7" y="3" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/career-office/students', label: 'User Profiles', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><rect x="4" y="13" width="12" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/career-office/faculty-mentors', label: 'Faculty Mentors', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L3 7v6c0 4 7 7 7 7s7-3 7-7V7l-7-5z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2"/></svg> },
        { href: '/dashboard/career-office/mentor-approvals', label: 'Mentor Approvals', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/></svg> },
        { href: '/dashboard/career-office/events', label: 'Manage Events', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        { href: '/dashboard/career-office/reports', label: 'Reports', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 9H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
      ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside
        className={
          styles.sidebar +
          (isMobile
            ? (isSidebarOpen ? ' ' + styles.open : ' ' + styles.collapsed)
            : (isSidebarOpen ? '' : ' ' + styles.collapsed))
        }
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            {userType === 'career-office' ? 'Career Office' : userType === 'employer' ? 'Employer Portal' : userType === 'alumni' ? 'Alumni Portal' : userType === 'faculty-mentor' ? 'Faculty Mentor' : 'User Portal'}
          </h2>
          {!isMobile && (
            <button
              className={styles.sidebarToggle}
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          )}
          {isMobile && (
            <button
              className={styles.sidebarCloseButton}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              ×
            </button>
          )}
        </div>
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.href} className={styles.navItem}>
                <Link href={link.href} className={styles.navLink} onClick={handleNavClick}>
                  <span className={styles.navIcon}>{link.icon}</span>
                  {isSidebarOpen && <span className={styles.navLabel}>{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.navLink} onClick={handleLogout}>
            {isSidebarOpen ? <span className={styles.navLabel}>Logout</span> : <span className={styles.navLabelCollapsed}>Logout</span>}
          </button>
        </div>
      </aside>
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.mobileMenuButton}
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName || ' '}</span>
              <div className={styles.userAvatar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
}