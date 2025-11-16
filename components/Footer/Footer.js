import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>GCCCS CareerLink</h3>
            <p className={styles.footerDescription}>
              A career support and placement platform for students, graduates, and alumni of Gordon College CCS.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/auth/register">Register</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Resources</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/career-tips">Career Tips</Link></li>
              <li><Link href="/job-listings">Job Listings</Link></li>
              <li><Link href="/training">Training</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Contact</h3>
            <ul className={styles.footerLinks}>
              <li>Email: careerlink@gcccs.edu</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: Gordon College, City</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} GCCCS CareerLink. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}