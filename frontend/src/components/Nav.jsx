import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Nav() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
      <Link to="/">Dashboard</Link>
      {user?.role === 'admin' && <> | <Link to="/admin">Admin</Link></>}

      <span style={{ float: 'right' }}>
        {user ? <><strong>{user.name}</strong> <button onClick={logout}>Logout</button></> : <Link to="/login">Login</Link>}
      </span>
    </nav>
  );
}
