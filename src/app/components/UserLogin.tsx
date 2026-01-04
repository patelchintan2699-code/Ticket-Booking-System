import React, { useState } from 'react';
import { Button } from './Button';

interface UserLoginProps {
  onLogin: (result: { user: { id: string; name: string; email: string; role: string; phone?: string }; token: string }) => void;
  onBack: () => void;
}

export function UserLogin({ onLogin, onBack }: UserLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 401) {
        setError('Invalid email or password');
        return;
      }
      if (!res.ok) throw new Error('Network error');
      const body = await res.json();
      // backend returns { user, token }
      if (!body.user || !body.token) throw new Error('Invalid server response');
      onLogin({ user: body.user, token: body.token });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="mb-4">Sign In</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </div>
      </form>
    </div>
  );
}
