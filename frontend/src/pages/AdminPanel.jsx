// frontend/src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import SkillManager from './admin/SkillManager';
import QuestionManager from './admin/QuestionManager';
import AdminUserManager from './admin/AdminUserManager';

export default function AdminPanel() {
  const [tab, setTab] = useState('skills');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setTab('skills')} className={`px-3 py-2 rounded ${tab === 'skills' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Skills</button>
        <button onClick={() => setTab('questions')} className={`px-3 py-2 rounded ${tab === 'questions' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Questions</button>
        <button onClick={() => setTab('users')} className={`px-3 py-2 rounded ${tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Users</button>
      </div>

      <div>
        {tab === 'skills' && <SkillManager />}
        {tab === 'questions' && <QuestionManager />}
        {tab === 'users' && <AdminUserManager />}
      </div>
    </div>
  );
}
