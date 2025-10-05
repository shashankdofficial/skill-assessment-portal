// frontend/src/pages/admin/QuestionManager.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../api/axios';

function blankQuestion() {
  return { id: null, skillId: '', text: '', options: ['', '', ''], correctIndex: 0, weight: 1 };
}

export default function QuestionManager() {
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [editing, setEditing] = useState(blankQuestion());
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setLoading(true);
      const resp = await api.get('/skills');
      const arr = resp.data || [];
      setSkills(arr);
      if (arr.length && !selectedSkillId) {
        setSelectedSkillId(arr[0].id);
        await loadQuestions(arr[0].id, 1, search);
      }
    } catch (err) {
      console.error('load skills', err);
      alert('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions(skillId = selectedSkillId, newPage = page, searchTerm = search) {
    if (!skillId) return setQuestions([]);
    try {
      setLoading(true);
      const resp = await api.get(`/questions?skillId=${skillId}&page=${newPage}&limit=${limit}&search=${searchTerm}`);
      // backend may return {rows, count, ...} or []
      const data = Array.isArray(resp.data) ? resp.data : resp.data.rows || [];
      setQuestions(data);
      setTotalPages(resp.data?.totalPages || 1);
      setPage(newPage);
    } catch (err) {
      console.error('load questions', err);
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditing(blankQuestion());
    if (!selectedSkillId && skills.length) setSelectedSkillId(skills[0].id);
  }

  function startEdit(q) {
    let options = q.options || [];
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options).map(o => o.text || o);
      } catch {
        options = options.split('|');
      }
    } else {
      options = options.map(o => (typeof o === 'string' ? o : o.text || ''));
    }
    setEditing({
      id: q.id,
      skillId: q.skillId || q.skill_id || selectedSkillId,
      text: q.text,
      options: [...options],
      correctIndex: q.correct_index ?? q.correctIndex ?? 0,
      weight: q.weight ?? 1
    });
  }

  async function saveQuestion(e) {
    e?.preventDefault();
    try {
      setLoading(true);
      const payload = {
        skillId: editing.skillId,
        text: editing.text,
        options: editing.options.map((t, i) => ({ id: String(i), text: t })),
        correct_option: String(editing.correctIndex),
        weight: editing.weight
      };

      if (editing.id) {
        const resp = await api.put(`/questions/${editing.id}`, payload);
        setQuestions(qs => qs.map(q => (q.id === resp.data.id ? resp.data : q)));
      } else {
        const resp = await api.post('/questions', payload);
        setQuestions(prev => [...prev, resp.data]);
      }

      setEditing(blankQuestion());
      await loadQuestions(editing.skillId);
    } catch (err) {
      console.error('save question', err);
      alert(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuestion(q) {
    if (!window.confirm(`Delete question: "${q.text}" ?`)) return;
    try {
      setLoading(true);
      await api.delete(`/questions/${q.id}`);
      setQuestions(prev => prev.filter(x => x.id !== q.id));
    } catch (err) {
      console.error('delete question', err);
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Manage Questions">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <label className="block text-sm mb-1">For skill</label>
            <select
              value={selectedSkillId}
              onChange={e => {
                const val = e.target.value;
                setSelectedSkillId(val);
                loadQuestions(val, 1, search);
              }}
              className="p-2 border rounded"
            >
              <option value="">-- choose skill --</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Search</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search text..."
              className="p-2 border rounded"
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={startNew}>+ New</Button>
            <Button variant="secondary" onClick={() => loadQuestions(selectedSkillId, 1, search)}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {questions.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded">No questions for this skill.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {questions.map(q => (
                  <div key={q.id} className="p-3 bg-white border rounded flex justify-between items-start">
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ fontWeight: 700 }}>{q.text}</div>
                      <div style={{ color: '#6b7280', marginTop: 6 }}>
                        {(q.options || []).slice(0, 4).map((o, idx) => {
                          const text = typeof o === 'string' ? o : o.text || JSON.stringify(o);
                          return (
                            <span key={idx} className="inline-block mr-2 px-2 py-1 bg-gray-100 rounded">
                              {String.fromCharCode(65 + idx)}. {text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(q)} className="px-3 py-1 bg-gray-100 rounded">
                        Edit
                      </button>
                      <button onClick={() => deleteQuestion(q)} className="px-3 py-1 bg-red-500 text-white rounded">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Button disabled={page <= 1} onClick={() => loadQuestions(selectedSkillId, page - 1, search)}>
                Prev
              </Button>
              <span>
                Page {page} / {totalPages}
              </span>
              <Button disabled={page >= totalPages} onClick={() => loadQuestions(selectedSkillId, page + 1, search)}>
                Next
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Create / Edit Form */}
      <Card title={editing.id ? 'Edit Question' : 'Create Question'}>
        <form onSubmit={saveQuestion} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Skill</label>
            <select
              value={editing.skillId}
              onChange={e => setEditing({ ...editing, skillId: e.target.value })}
              className="p-2 border rounded"
              required
            >
              <option value="">-- select skill --</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Question text</label>
            <input
              value={editing.text}
              onChange={e => setEditing({ ...editing, text: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Options</label>
            {editing.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={opt}
                  onChange={e => {
                    const arr = [...editing.options];
                    arr[i] = e.target.value;
                    setEditing({ ...editing, options: arr });
                  }}
                  className="flex-1 p-2 border rounded"
                  required
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="radio"
                    checked={editing.correctIndex === i}
                    onChange={() => setEditing({ ...editing, correctIndex: i })}
                  />{' '}
                  Correct
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const arr = editing.options.filter((_, idx) => idx !== i);
                    setEditing({
                      ...editing,
                      options: arr,
                      correctIndex: Math.max(0, Math.min(arr.length - 1, editing.correctIndex))
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, options: [...editing.options, ''] })}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                + Add option
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={() => setEditing(blankQuestion())}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
