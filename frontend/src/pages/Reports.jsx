import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reports() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')||'null'));
  const [reports, setReports] = useState(null);

  useEffect(() => { async function load(){ if(user) { const r = await api.get(`/reports/user/${user.id}`); setReports(r.data); } } load(); }, [user]);

  if (!reports) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Performance</h2>
      <p>Average overall: {Number(reports.avgOverall).toFixed(2)}</p>
      <h3>Attempts (latest)</h3>
      <ul>{reports.attempts.map(a => (<li key={a.id}>{a.skill?.name || a.skillId}: {a.score}/{a.total} at {new Date(a.completed_at).toLocaleString()}</li>))}</ul>
      <h3>Average by Skill</h3>
      <ul>{reports.avgBySkill.map(s => (<li key={s.skillId}>Skill {s.skillId}: {Number(s.avg_score).toFixed(2)}</li>))}</ul>
    </div>
  );
}
