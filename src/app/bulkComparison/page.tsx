// src/app/comparison/page.tsx

'use client';

import { useState } from 'react';
import styles from '../styles/Form.module.css';

// 이메일 목록을 관리하는 컴포넌트
const EmailList = ({
  emailList,
  removeEmail,
}: {
  emailList: string[];
  removeEmail: (index: number) => void;
}) => (
  <ul className={styles.emailList}>
    {emailList.map((email, index) => (
      <li key={index} className={styles.emailItem}>
        <span>{email}</span>
        <button onClick={() => removeEmail(index)} className={styles.removeButton}>
          X
        </button>
      </li>
    ))}
  </ul>
);

// 성능 결과를 테이블로 표시하는 컴포넌트
const ResultsTable = ({ results }: { results: any[] }) => (
  <table className={styles.resultsTable}>
    <thead>
      <tr>
        <th>테스트넘버</th>
        <th>타입</th>
        <th>시간 (ms)</th>
      </tr>
    </thead>
    <tbody>
      {results.map((result, index) => (
        <tr key={index}>
          <td>{result.test}</td>
          <td>{result.type}</td>
          <td>{result.time !== 'N/A' ? `${result.time} ms` : 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function ComparisonPage() {
  // 상태 관리
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [sendCount, setSendCount] = useState<number>(1);
  const [testCount, setTestCount] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 이메일 형식 검사 함수
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 이메일 추가 핸들러
  const addEmail = () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      alert('유효하지 않은 이메일 형식입니다.');
      return;
    }
    setEmailList(prev => [...prev, email]);
    setEmail('');
  };

  // 이메일 삭제 핸들러
  const removeEmail = (indexToRemove: number) => {
    setEmailList(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 이메일 리스트를 sendCount만큼 곱해서 새로운 리스트 생성
  const multiplyEmailList = (emails: string[], count: number): string[] => {
    const multipliedList = [];
    for (let i = 0; i < count; i++) {
      multipliedList.push(...emails);
    }
    return multipliedList;
  };

  // 테스트 실행 핸들러
  const runTests = async () => {
    if (emailList.length === 0) {
      alert('최소 하나의 이메일을 추가해주세요.');
      return;
    }
    if (!subject || !text) {
      alert('제목과 메시지를 모두 입력해주세요.');
      return;
    }
    if (sendCount <= 0) {
      alert('보내는 횟수는 1 이상이어야 합니다.');
      return;
    }

    const newTestCount = testCount + 1;
    setTestCount(newTestCount);
    setIsLoading(true); // 로딩 시작

    // 이메일 리스트를 sendCount만큼 곱함
    const multipliedEmailList = multiplyEmailList(emailList, sendCount);

    // 비동기 테스트 함수
    const asyncTest = async () => {
      try {
        const asyncStart = performance.now();
        const asyncResponse = await fetch('/api/sendBulkEmails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: multipliedEmailList, subject, text }),
        });
        const asyncEnd = performance.now();
        const asyncEnqueueTime = asyncEnd - asyncStart;

        const asyncData = await asyncResponse.json();
        if (asyncResponse.ok) {
          const { testId } = asyncData;

          // 폴링을 통한 결과 확인
          const pollResults = async () => {
            const maxAttempts = 20;
            const interval = 1000; // 1초 간격
            let attempts = 0;
            const pollStart = performance.now();

            return new Promise<void>((resolve) => {
              const intervalId = setInterval(async () => {
                attempts += 1;
                try {
                  const resultResponse = await fetch(`/api/getResults?testId=${testId}`);
                  const resultData = await resultResponse.json();

                  if (resultResponse.ok) {
                    const { status } = resultData;
                    if (status === 'Completed' || status.startsWith('Failed')) {
                      clearInterval(intervalId);
                      const pollEnd = performance.now();
                      const elapsedTime = pollEnd - pollStart;
                      setResults((prev) => [
                        ...prev,
                        {
                          test: `Test ${newTestCount}`,
                          type: 'Async',
                          time: elapsedTime.toFixed(2),
                        },
                      ]);
                      resolve();
                    }
                  } else {
                    console.error('Failed to fetch async test results:', resultData.error);
                  }

                  if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    const pollEnd = performance.now();
                    const elapsedTime = pollEnd - pollStart;
                    setResults((prev) => [
                      ...prev,
                      {
                        test: `Test ${newTestCount}`,
                        type: 'Async',
                        time: elapsedTime.toFixed(2),
                      },
                    ]);
                    resolve();
                  }
                } catch (error) {
                  console.error('Error during polling:', error);
                }
              }, interval);
            });
          };

          await pollResults();
        } else {
          alert(asyncData.error || '비동기적으로 이메일을 보내는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('비동기 테스트 중 오류 발생:', error);
        alert('비동기 테스트 중 예상치 못한 오류가 발생했습니다.');
      }
    };

    // 동기 테스트 함수
    const syncTest = async () => {
      try {
        const syncStart = performance.now();
        const syncResponse = await fetch('/api/sendBulkEmailsSync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: multipliedEmailList, subject, text }),
        });
        const syncEnd = performance.now();
        const syncElapsedTime = syncEnd - syncStart;

        const syncData = await syncResponse.json();
        if (syncResponse.ok) {
          // 동기 테스트 결과 업데이트
          setResults((prev) => [
            ...prev,
            {
              test: `Test ${newTestCount}`,
              type: 'Sync',
              time: syncElapsedTime.toFixed(2),
            },
          ]);
        } else {
          alert(syncData.error || '동기적으로 이메일을 보내는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('동기 테스트 중 오류 발생:', error);
        alert('동기 테스트 중 예상치 못한 오류가 발생했습니다.');
      }
    };

    // 비동기 및 동기 테스트 동시에 실행
    await Promise.all([asyncTest(), syncTest()]);

    setIsLoading(false); // 로딩 종료
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bulk Email Performance Comparison</h1>

      {/* 이메일 입력 섹션 */}
      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Recipient Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
          />
          <button onClick={addEmail} className={styles.addButton}>
            Add
          </button>
        </div>
        <EmailList emailList={emailList} removeEmail={removeEmail} />
      </div>

      {/* 이메일 제목 및 메시지 입력 */}
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <textarea
          placeholder="Message"
          value={text}
          onChange={e => setText(e.target.value)}
          className={styles.textarea}
        />
      </div>

      {/* 보내는 횟수 입력 */}
      <div className={styles.inputGroup}>
        <input
          type="number"
          placeholder="Number of Sends"
          value={sendCount}
          onChange={e => setSendCount(parseInt(e.target.value, 10) || 1)}
          className={styles.input}
          min="1"
        />
      </div>

      {/* 테스트 실행 버튼 */}
      <button onClick={runTests} className={styles.runButton} disabled={isLoading}>
        {isLoading ? 'Running Tests...' : 'Run Async & Sync Tests'}
      </button>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Tests are running, please wait...</p>
        </div>
      )}

      {/* 테이블 섹션 */}
      <div className={styles.tableContainer}>
        <h2>Performance Results (Table)</h2>
        {results.length > 0 ? (
          <ResultsTable results={results} />
        ) : (
          <p>No tests conducted yet.</p>
        )}
      </div>
    </div>
  );
}
