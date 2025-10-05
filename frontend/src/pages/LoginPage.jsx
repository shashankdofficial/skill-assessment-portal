// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { postSecure } from '../utils/fetchSecureData';

export default function LoginPage({ dispatch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const resp = await postSecure('auth/login', { email, password });
      const data = resp.data || resp;
      const token = data.token;
      const user = data.user;
      if (!token || !user) throw new Error('Invalid login response');
      // update global state
      dispatch({ type: 'LOGIN_SUCCESS', payload: { ...user, token } });
      // ensure token in localStorage (reducer does store but be sure)
      localStorage.setItem('token', token);
      // navigate to dashboard root
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login to Skill Portal" className="max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <div><label className="block text-sm mb-1">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" required /></div>
        <div><label className="block text-sm mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" required /></div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Logging in...' : 'Login'}</Button>
      </form>
      <p className="mt-4 text-sm">Don't have an account? <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'register' })} className="text-indigo-600">Register</button></p>
    </Card>
  );
}
