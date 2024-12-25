'use client';

import { useState } from 'react';
import styles from '../styles/Form.module.css';

export default function SingleEmailPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const sendEmail = async () => {
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, text }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage('Email sent successfully');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Single Email Sender</h1>
      <input
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
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
      <button onClick={sendEmail} className={styles.button}>
        Send Email
      </button>
      {message && (
        <p className={`${styles.message} ${status === 'error' ? styles.error : ''}`}>
          {message}
        </p>
      )}
    </div>
  );
}
