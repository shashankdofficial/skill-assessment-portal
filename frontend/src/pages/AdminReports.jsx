// frontend/src/pages/AdminReports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSecure } from '../utils/fetchSecureData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

/**
 * AdminReports – Skill gap analytics dashboard for admins
 */
export default function AdminReports({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [threshold, setThreshold] = useState(60);
  const [topN, setTopN] = useState(8);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);

  // Load users list (admin-only)
  const loadUsers = useCallback(async () => {
    try {
      const res = await getSecure('admin/users');
      setUsers(res.data || res);
      if (!selectedUserId && (res.data?.length || res.length)) {
        setSelectedUserId(res.data?.[0]?.id || res[0]?.id);
      }
    } catch (err) {
      console.error('loadUsers failed', err);
      setError('Failed to load users list');
    }
  }, [selectedUserId]);

  // Load skill gap data
  const loadGaps = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await getSecure(
        `reports/skill-gaps?userId=${selectedUserId}&threshold=${threshold}`
      );
      const data = resp.data || resp;
      setGaps(data || []);
    } catch (err) {
      console.error('loadGaps failed', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to load skill gaps'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, threshold]);

  // Load users once on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load gaps whenever selected user or threshold changes
  useEffect(() => {
    if (selectedUserId) {
      loadGaps();
    }
  }, [selectedUserId, threshold, loadGaps]);

  const chartData = gaps.slice(0, topN).map((g) => ({
    name: g.skillName,
    'User Avg': Number(g.userAvg || 0),
    'Global Avg': Number(g.globalAvg || 0)
  }));

  return (
    <div className="space-y-6">
      <Card title="Skill Gap Analysis">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 12
          }}
        >
          <div>
            <label className="block text-sm font-semibold">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">-- Select --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || `User #${u.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Threshold (%)
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="p-2 border rounded w-24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Top N</label>
            <input
              type="number"
              value={topN}
              onChange={(e) =>
                setTopN(Math.max(1, Number(e.target.value || 1)))
              }
              className="p-2 border rounded w-24"
            />
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={loadGaps}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        ) : (
          <>
            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="User Avg" fill="#4f46e5" barSize={18} />
                  <Bar dataKey="Global Avg" fill="#94a3b8" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 className="text-lg font-semibold mb-2">Detailed Gaps</h4>
              {gaps.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded">
                  No skills match the current threshold.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{ width: '100%', borderCollapse: 'collapse' }}
                    className="text-sm"
                  >
                    <thead>
                      <tr
                        style={{
                          textAlign: 'left',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <th style={{ padding: 8 }}>Skill</th>
                        <th style={{ padding: 8 }}>User Avg</th>
                        <th style={{ padding: 8 }}>Global Avg</th>
                        <th style={{ padding: 8 }}>Gap</th>
                        <th style={{ padding: 8 }}>User Attempts</th>
                        <th style={{ padding: 8 }}>Global Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.map((g) => (
                        <tr
                          key={g.skillId}
                          style={{ borderTop: '1px solid #f1f5f9' }}
                        >
                          <td style={{ padding: 8 }}>{g.skillName}</td>
                          <td style={{ padding: 8 }}>
                            {Number(g.userAvg).toFixed(1)}
                          </td>
                          <td style={{ padding: 8 }}>
                            {Number(g.globalAvg).toFixed(1)}
                          </td>
                          <td style={{ padding: 8 }}>
                            {Number(g.gap || 0).toFixed(1)} ({g.pctBelow || 0}%)
                          </td>
                          <td style={{ padding: 8 }}>{g.userAttempts}</td>
                          <td style={{ padding: 8 }}>{g.globalAttempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
