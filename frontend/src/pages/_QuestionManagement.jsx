// frontend/src/pages/_QuestionManagement.jsx
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSecure, postSecure } from '../utils/fetchSecureData';

export default function QuestionManagement({ user }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [form, setForm] = useState({ text: '', options: ['', '', ''], correctIndex: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    try {
      setLoading(true);
      const resp = await getSecure('skills');
      const data = resp.data || resp;
      setSkills(data);
      if (data.length && !selectedSkill) setSelectedSkill(data[0]);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedSkill) return alert('Select a skill');
    const options = form.options.filter(Boolean).map((t,i) => ({ id: String(i), text: t }));
    const payload = {
      skillId: selectedSkill.id,
      text: form.text,
      options,
      correct_option: options[form.correctIndex]?.id || options[0]?.id
    };
    try {
      setLoading(true);
      await postSecure('questions', payload);
      alert('Created (backend will persist).');
      setForm({ text: '', options: ['', '', ''], correctIndex: 0 });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Create failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <Card title="Create Question">
        <div style={{ marginBottom: 8 }}>
          <label className="block text-sm">Skill</label>
          <select value={selectedSkill?.id||''} onChange={e => setSelectedSkill(skills.find(s => String(s.id) === String(e.target.value)))} className="p-2 border rounded">
            <option value="">-- select --</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <form onSubmit={handleCreate}>
          <div><label className="block text-sm">Question</label>
            <input value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} className="w-full p-2 border rounded" required />
          </div>
          <div className="mt-3">
            <label className="block text-sm">Options</label>
            {form.options.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input value={opt} onChange={e => { const arr = [...form.options]; arr[idx] = e.target.value; setForm(f => ({ ...f, options: arr })); }} className="flex-1 p-2 border rounded" />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" checked={form.correctIndex === idx} onChange={() => setForm(f => ({ ...f, correctIndex: idx }))} /> Correct
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={loading}>Create Question</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
