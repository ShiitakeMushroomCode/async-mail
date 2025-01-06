'use client';

import { useState } from 'react';
import styles from '../styles/Form.module.css';

export default function BulkEmailPage() {
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

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
    setEmailList((prev) => [...prev, email]);
    setEmail('');
  };

  // 이메일 삭제
  const removeEmail = (emailToRemove: string) => {
    setEmailList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // 이메일 발송
  const sendBulkEmails = async () => {
    try {
      const response = await fetch('/api/sendBulkEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList, subject, text }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage('Bulk emails queued successfully');
        setEmailList([]); // 전송 후 목록 초기화
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to queue emails');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bulk Email Sender</h1>
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
      <button onClick={sendBulkEmails} className={styles.button}>
        Send Bulk Emails
      </button>
      {message && (
        <p className={`${styles.message} ${status === 'error' ? styles.error : ''}`}>
          {message}
        </p>
      )}
    </div>
  );
}
