// frontend/src/pages/_PastPerformance.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSecure } from '../utils/fetchSecureData';

export default function PastPerformance({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const resp = await getSecure(`reports/user/${user.id}`);
      const data = resp.data || resp;
      setReports(data.attempts || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadReports(); }, [loadReports]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-3 bg-red-100 text-red-700 rounded">Error loading reports: {error}</div>;

  return (
    <Card title="Past Performance" className="mt-6">
      {reports.length === 0 ? <div className="p-4 text-sm">No quiz attempts found.</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Skill</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>
            {reports.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 8 }}>{a.skill?.name || a.skillId}</td>
                <td style={{ padding: 8 }}>{a.score}/{a.total}</td>
                <td style={{ padding: 8 }}>{new Date(a.completed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
