// frontend/src/pages/admin/AdminUserManager.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import { getSecure, postSecure, putSecure, deleteSecure } from '../../utils/fetchSecureData';
import { getSecure, putSecure, deleteSecure } from '../../utils/fetchSecureData';

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [editingRole, setEditingRole] = useState('');
  const [error, setError] = useState(null);

  const load = useCallback(async (p = page, q = search) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await getSecure(`admin/users?page=${p}&limit=${limit}${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      const data = resp?.data ?? resp;
      setUsers(data.rows || []);
      setCount(data.count || 0);
      setPage(data.page || p);
    } catch (err) {
      console.error('load users', err);
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    load(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handlers
  const onSearch = () => load(1, search);

  const toggleActive = async (user) => {
    if (!window.confirm(`Set active = ${!user.active} for ${user.name || user.email}?`)) return;
    try {
      setLoading(true);
      await putSecure(`admin/users/${user.id}`, { active: !user.active });
      await load(page, search);
    } catch (err) {
      console.error('toggleActive', err);
      alert('Failed to update active');
    } finally {
      setLoading(false);
    }
  };

  const onChangeRole = async (userId, role) => {
    try {
      setLoading(true);
      await putSecure(`admin/users/${userId}`, { role });
      await load(page, search);
    } catch (err) {
      console.error('onChangeRole', err);
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (userId) => {
    if (!window.confirm('Deactivate this user? (soft-deactivate)')) return;
    try {
      setLoading(true);
      await deleteSecure(`admin/users/${userId}`);
      await load(page, search);
    } catch (err) {
      console.error('delete user', err);
      alert('Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(count / limit));
  const goPage = (p) => { if (p < 1 || p > totalPages) return; setPage(p); load(p, search); };

  return (
    <div>
      <Card title="Admin — Users">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="Search name or email" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', minWidth: 240 }} />
          <button onClick={onSearch} className="px-3 py-2 bg-indigo-600 text-white rounded">Search</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={()=>load(1,'')} className="px-3 py-2 bg-gray-100 rounded">Reset</button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : error ? <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 6 }}>{error}</div> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: 8 }}>ID</th>
                    <th style={{ padding: 8 }}>Name</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Role</th>
                    <th style={{ padding: 8 }}>Active</th>
                    <th style={{ padding: 8 }}>Created</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #f8fafc' }}>
                      <td style={{ padding: 8, width: 70 }}>{u.id}</td>
                      <td style={{ padding: 8 }}>{u.name || '-'}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>
                        <select value={u.role} onChange={(e)=>onChangeRole(u.id, e.target.value)} style={{ padding: 6 }}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ padding: 8 }}>
                        <button onClick={()=>toggleActive(u)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e6e9ef' }}>
                          {u.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={()=>onDelete(u.id)} style={{ marginLeft: 8, padding: '6px 10px', background:'#ef4444', color:'#fff', borderRadius:6 }}>Deactivate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div>Showing page {page} of {totalPages} — {count} users</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={()=>goPage(page-1)} disabled={page===1} className="px-3 py-2 border rounded">Prev</button>
                <button onClick={()=>goPage(page+1)} disabled={page===totalPages} className="px-3 py-2 border rounded">Next</button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
