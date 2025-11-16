'use client';

import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
}