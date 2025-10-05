import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Admin() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => { async function load(){ const r = await api.get('/skills'); setSkills(r.data); } load(); }, []);

  const createSkill = async () => {
    const r = await api.post('/skills', { name });
    setSkills(prev => [...prev, r.data]);
    setName('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin</h2>
      <div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New skill name" />
        <button onClick={createSkill}>Create Skill</button>
      </div>
      <h3>Skills</h3>
      <ul>{skills.map(s=> <li key={s.id}>{s.name}</li>)}</ul>
    </div>
  );
}
