import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminPath } from '../../lib/adminGate';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={adminPath()} replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(id, password)) {
      navigate(adminPath());
    } else {
      setError('Access denied');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-academy-green/10 p-3 rounded-2xl">
            <Shield className="text-academy-green" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-academy-gold">Restricted</p>
            <h1 className="text-2xl font-bold text-academy-green">Secure login</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-academy-green/30 focus:border-academy-green"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-academy-green/30 focus:border-academy-green"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          <button type="submit" className="w-full btn-primary py-4">
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">Authorized staff only. This page is not linked publicly.</p>
      </div>
    </div>
  );
}
