'use client';

import { useState } from 'react';
import styles from '../styles/Form.module.css';

export default function ComparisonPage() {
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [asyncTime, setAsyncTime] = useState<number | null>(null);
  const [syncTime, setSyncTime] = useState<number | null>(null);

  // 이메일 형식 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 추가
  const addEmail = () => {
    if (!email) {
      alert('Please enter an email.');
      return;
    }
    if (!validateEmail(email)) {
      alert('Invalid email format.');
      return;
    }
    if (emailList.includes(email)) {
      alert('This email is already in the list.');
      return;
    }
    setEmailList((prev) => [...prev, email]);
    setEmail('');
  };

  // 이메일 삭제
  const removeEmail = (emailToRemove: string) => {
    setEmailList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // 비동기 방식 테스트
  const testAsync = async () => {
    try {
      const response = await fetch('/api/sendBulkEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList, subject, text }),
      });

      const data = await response.json();
      if (response.ok) {
        setAsyncTime(data.enqueueTime);
      } else {
        alert(data.error || 'Failed to send emails asynchronously.');
      }
    } catch (error) {
      console.error('Error testing async emails:', error);
    }
  };

  // 동기 방식 테스트
  const testSync = async () => {
    try {
      const response = await fetch('/api/sendBulkEmailsSync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList, subject, text }),
      });

      const data = await response.json();
      if (response.ok) {
        setSyncTime(data.sendTime);
      } else {
        alert(data.error || 'Failed to send emails synchronously.');
      }
    } catch (error) {
      console.error('Error testing sync emails:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bulk Email Performance Comparison</h1>
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <input
          type="email"
          placeholder="Recipient Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button onClick={addEmail} className={styles.addButton} style={{ marginLeft: '1rem' }}>
          Add
        </button>
      </div>
      <ul className={styles.emailList}>
        {emailList.map((e, index) => (
          <li key={index} className={styles.emailItem}>
            <span>{e}</span>
            <button
              onClick={() => removeEmail(e)}
              className={styles.removeButton}
            >
              X
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className={styles.input}
      />
      <textarea
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.textarea}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button onClick={testAsync} className={styles.button}>
          Test Async Emails
        </button>
        <button onClick={testSync} className={styles.button}>
          Test Sync Emails
        </button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Performance Results</h2>
        <p>Async Time: {asyncTime !== null ? `${asyncTime} ms` : 'N/A'}</p>
        <p>Sync Time: {syncTime !== null ? `${syncTime} ms` : 'N/A'}</p>
      </div>
    </div>
  );
}
