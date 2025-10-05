// frontend/src/pages/admin/SkillManager.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../api/axios';

export default function SkillManager() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // skill object being edited
  const [form, setForm] = useState({ name: '', description: '' });

  // pagination/search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load(page, limit, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(p = 1, lim = limit, q = '') {
    try {
      setLoading(true);
      // call paginated api; but handle legacy array response too
      const resp = await api.get(`/skills?page=${p}&limit=${lim}${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      const data = resp.data ?? resp;
      if (Array.isArray(data)) {
        // legacy array response
        setSkills(data);
        setPage(1);
        setTotalPages(1);
      } else {
        setSkills(data.rows || []);
        setPage(data.page || p);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('load skills error', err);
      alert(err.response?.data?.message || err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
  }

  function startEdit(s) {
    setEditing(s);
    setForm({ name: s.name || '', description: s.description || '' });
  }

  async function submit(e) {
    e?.preventDefault();
    try {
      setLoading(true);
      if (editing) {
        const resp = await api.put(`/skills/${editing.id}`, form);
        const updated = resp.data;
        setSkills(skills.map(s => (s.id === updated.id ? updated : s)));
        setEditing(null);
      } else {
        const resp = await api.post('/skills', form);
        // if API returned created item
        setSkills(prev => [ ...(prev || []), resp.data ]);
      }
      setForm({ name: '', description: '' });
      // reload current page to keep pagination consistent
      await load(page, limit, search);
    } catch (err) {
      console.error('save skill error', err);
      alert(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function removeSkill(s) {
    if (!window.confirm(`Delete skill "${s.name}"? This will not remove questions automatically.`)) return;
    try {
      setLoading(true);
      await api.delete(`/skills/${s.id}`);
      setSkills(skills.filter(x => x.id !== s.id));
      // reload page in case deletion affects pagination
      await load(page, limit, search);
    } catch (err) {
      console.error('delete skill error', err);
      alert(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    load(p, limit, search);
  };

  return (
    <div className="space-y-6">
      <Card title="Manage Skills">
        <div className="mb-4">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button onClick={startCreate}>+ New Skill</Button>
            <Button variant="secondary" onClick={() => load(1, limit, '')}>Refresh</Button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="p-2 border rounded"
              />
              <Button onClick={() => load(1, limit, search)}>Search</Button>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Page size:
                <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); load(1, Number(e.target.value), search); }}>
                  <option value={5}>5</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ display: 'grid', gap: 10 }}>
            {(!skills || skills.length === 0) ? (
              <div className="p-3 bg-gray-50 rounded">No skills found.</div>
            ) : (
              skills.map(s => (
                <div key={s.id} className="p-3 bg-white border rounded flex justify-between items-start">
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={{ color: '#6b7280' }}>{s.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(s)} className="px-3 py-1 bg-gray-100 rounded">Edit</button>
                    <button onClick={() => removeSkill(s)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              ))
            )}

            {/* pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Button disabled={page <= 1} onClick={() => goPage(page - 1)}>Prev</Button>
              <span>Page {page} / {totalPages}</span>
              <Button disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Card title={editing ? `Edit: ${editing.name}` : 'Create / Edit Skill'}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" disabled={loading}>{editing ? 'Save' : 'Create'}</Button>
            {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm({name:'',description:''}); }}>Cancel</Button>}
          </div>
        </form>
      </Card>
    </div>
  );
}
