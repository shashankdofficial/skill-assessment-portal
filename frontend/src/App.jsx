// frontend/src/App.jsx
import React, { useEffect, useMemo, useReducer } from 'react';
import { LayoutDashboard, Settings, BarChart } from 'lucide-react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminReports from './pages/AdminReports'; // wrapper or actual component; ensure this file exists
import { appReducer, initialAppState } from './state/appState';
import './index.css';

export default function App() {
  // hooks must be top-level and stable across renders
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    const saved = localStorage.getItem('skillPortalAuth');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        dispatch({ type: 'LOGIN_SUCCESS', payload: u });
      } catch (e) {
        localStorage.removeItem('skillPortalAuth');
      }
    }
  }, []);

  // make a stable user reference based only on id (keeps same object reference across re-renders)
  const stableUser = useMemo(() => state.user, [state.user?.id]);

  // navigation items (no hooks here)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: (user) => true },
    { id: 'admin', label: 'Admin Panel', icon: Settings, show: (user) => user?.role === 'admin' },
    { id: 'reports', label: 'Reports', icon: BarChart, show: (user) => user?.role === 'admin' }
  ];

  const AuthenticatedLayout = ({ children }) => {
    const user = state.user || {};
    return (
      <div className="app-root">
        <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 14 }}>
          <div className="container-max" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#4f46e5' }}>Skill Assessment Portal</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#475569' }}>{user.name ? `${user.name} • ${user.role}` : ''}</div>
              <button onClick={() => dispatch({ type: 'LOGOUT' })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6e9ef', background: '#fff' }}>Logout</button>
            </div>
          </div>
        </header>

        <div className="container-max app-shell">
          <aside className="app-sidebar" aria-label="Navigation">
            <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, color: '#6b7280' }}>Navigation</div></div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navItems.filter(n => n.show(state.user)).map(item => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })}
                  className={`w-full text-left p-3 rounded-lg ${state.currentPage === item.id ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <item.icon size={18} />
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="app-main">
            {children}
          </main>
        </div>

        <footer style={{ padding: 12, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>© {new Date().getFullYear()} Skill Portal</footer>
      </div>
    );
  };

  // Decide which page to render - hooks have already run above, so this is safe
  let PageContent = null;

  if (!state.isAuthenticated) {
    PageContent = state.currentPage === 'register'
      ? <RegisterPage dispatch={dispatch} />
      : <LoginPage dispatch={dispatch} />;
  } else {
    if (state.currentPage === 'reports' && stableUser?.role === 'admin') {
      PageContent = <AdminReports user={stableUser} />;
    } else if (state.currentPage === 'admin') {
      PageContent = <AdminPanel user={stableUser} dispatch={dispatch} />;
    } else {
      PageContent = <UserDashboard user={stableUser} />;
    }
  }

  return state.isAuthenticated
    ? <AuthenticatedLayout>{PageContent}</AuthenticatedLayout>
    : (
      <div style={{ padding: 20, minHeight: '100vh' }}>
        <div style={{ maxWidth: 820, margin: '40px auto' }}>{PageContent}</div>
      </div>
    );
}
