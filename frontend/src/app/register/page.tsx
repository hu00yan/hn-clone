'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await register(email, username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
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
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="yourusername"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}