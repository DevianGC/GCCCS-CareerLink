'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error-pages.module.css';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorCode}>500</div>
        <h1 className={styles.errorTitle}>Something went wrong!</h1>
        <p className={styles.errorMessage}>
          We're sorry, but something went wrong on our end. Please try again later.
        </p>
        <div className={styles.errorActions}>
          <button onClick={reset} className={styles.primaryButton}>
            Try Again
          </button>
          <Link href="/" className={styles.secondaryButton}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}