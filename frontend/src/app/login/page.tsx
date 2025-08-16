'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/');
    } catch (err) {
      setError('Invalid email or password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}