import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { async function load(){ const r = await api.get('/skills'); setSkills(r.data); } load(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Skills</h2>
      <ul>
        {skills.map(s => (
          <li key={s.id}>{s.name} <button onClick={()=>navigate(`/quiz/${s.id}`)}>Start Quiz</button></li>
        ))}
      </ul>
    </div>
  );
}
