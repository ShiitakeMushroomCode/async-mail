'use client';

import Link from 'next/link';
import styles from './styles/Form.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Management Dashboard</h1>
      <div>
        <Link href="/single">
          <button className={styles.button}>Single Email Sender</button>
        </Link>
        <Link href="/bulk">
          <button className={styles.button}>Bulk Email Sender</button>
        </Link>
        <Link href="/bulkComparison">
          <button className={styles.button}>Comparison Email Sending</button>
        </Link>
        <Link href="/results">
          <button className={styles.button}>Email Results</button>
        </Link>
      </div>
    </div>
  );
}
