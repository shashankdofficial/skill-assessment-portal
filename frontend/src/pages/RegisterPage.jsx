// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { postSecure } from '../utils/fetchSecureData';

export default function RegisterPage({ dispatch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const resp = await postSecure('auth/register', { name, email, password });
      const data = resp.data || resp;
      const token = data.token;
      const user = data.user;
      if (!token || !user) throw new Error('Invalid register response');
      dispatch({ type: 'LOGIN_SUCCESS', payload: { ...user, token } });
      localStorage.setItem('token', token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create an account" className="max-w-md mx-auto">
      <form onSubmit={handleRegister} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <div><label className="block text-sm mb-1">Full name</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" required /></div>
        <div><label className="block text-sm mb-1">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" required /></div>
        <div><label className="block text-sm mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" required /></div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Registering...' : 'Register'}</Button>
      </form>
      <p className="mt-4 text-sm">Already got an account? <button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'login' })} className="text-indigo-600">Login</button></p>
    </Card>
  );
}
