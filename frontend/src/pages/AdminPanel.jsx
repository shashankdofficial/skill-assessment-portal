// // frontend/src/pages/AdminPanel.jsx
// import React, { useState } from 'react';
// import Card from '../components/ui/Card';
// import QuestionManagement from './_QuestionManagement';
// import AdminReports from './_AdminReports';

// export default function AdminPanel({ user }) {
//   const [view, setView] = useState('reports');
//   return (
//     <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
//       <div>
//         <Card title="Admin">
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//             <button className={`p-2 rounded ${view==='reports' ? 'bg-indigo-600 text-white' : ''}`} onClick={()=>setView('reports')}>User Reports</button>
//             <button className={`p-2 rounded ${view==='questions' ? 'bg-indigo-600 text-white' : ''}`} onClick={()=>setView('questions')}>Manage Questions</button>
//           </div>
//         </Card>
//       </div>
//       <div>
//         {view === 'reports' ? <AdminReports user={user} /> : <QuestionManagement user={user} />}
//       </div>
//     </div>
//   );
// }



// frontend/src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import Card from '../components/ui/Card';
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
