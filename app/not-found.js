'use client';

import Link from 'next/link';
import styles from './error-pages.module.css';

export default function NotFound() {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>Page Not Found</h1>
        <p className={styles.errorMessage}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className={styles.errorActions}>
          <Link href="/" className={styles.primaryButton}>
            Back to Home
          </Link>
          <Link href="/dashboard" className={styles.secondaryButton}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}