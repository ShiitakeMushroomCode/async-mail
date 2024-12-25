'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/Form.module.css';

export default function ResultsPage() {
  const [results, setResults] = useState<
    { id: string; email: string; status: string; timestamp: string }[]
  >([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof results[0] | null; direction: string | null }>({
    key: 'id',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/getResults');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      }
    };

    fetchResults();
  }, []);

  const sortResults = (key: keyof typeof results[0]) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc'
        ? 'desc'
        : sortConfig.key === key && sortConfig.direction === 'desc'
        ? null
        : 'asc';

    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig.direction || !sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Results</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => sortResults('id')}>Job ID</th>
            <th onClick={() => sortResults('email')}>Email</th>
            <th onClick={() => sortResults('status')}>Status</th>
            <th onClick={() => sortResults('timestamp')}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {paginatedResults.length > 0 ? (
            paginatedResults.map((result, index) => (
              <tr key={index}>
                <td>{result.id}</td>
                <td>{result.email}</td>
                <td>{result.status}</td>
                <td>{result.timestamp}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        {Array.from({ length: Math.ceil(results.length / resultsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: '0 0.5rem',
              padding: '0.5rem',
              background: currentPage === i + 1 ? '#0070f3' : '#f4f4f4',
              color: currentPage === i + 1 ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
