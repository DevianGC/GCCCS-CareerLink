'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { getAuthConfig, getNavConfig, logout } from '../../utils/config';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(getAuthConfig().defaultRole);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Get configuration
  const authConfig = getAuthConfig();
  const navConfig = getNavConfig();
  
  // Track when component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check authentication status using session cookie via /api/me
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        const user = data.user;
        setIsLoggedIn(!!user);
        setUserRole(user?.role || authConfig.defaultRole);
      } catch {
        setIsLoggedIn(false);
        setUserRole(authConfig.defaultRole);
      }
    })();
  }, [pathname, router, authConfig, navConfig]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(`.${styles.navLinks}`) && 
          !event.target.closest(`.${styles.mobileMenuButton}`)) {
        setIsMenuOpen(false);
      }
    };
    
    // Prevent scrolling when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Handle logout
  // const handleLogout = () => {
  //   if (typeof window !== 'undefined') {
  //     localStorage.removeItem(authConfig.tokenKey);
  //     localStorage.removeItem(authConfig.userRoleKey);
  //     setIsLoggedIn(false);
  //     setUserRole(authConfig.defaultRole);
  //     setIsMenuOpen(false);
  //     router.push('/');
  //   }
  // };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <span>GCCCS</span>
          <span className={styles.highlight}>CareerLink</span>
        </Link>

        <div 
          className={`${styles.mobileMenuButton} ${isMenuOpen ? styles.active : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          role="button"
          tabIndex="0"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div 
          className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}
          aria-hidden={!isMenuOpen}
          suppressHydrationWarning
        >
          {navConfig.publicLinks.map((link, index) => (
            <Link key={index} href={link.path} className={styles.navLink}>{link.name}</Link>
          ))}
          <div className={styles.authButtons}>
            <Link href="/auth/login" className={`btn btn-secondary ${styles.loginBtn}`}>Login</Link>
            <Link href="/auth/register" className={`btn btn-primary ${styles.registerBtn}`}>Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}