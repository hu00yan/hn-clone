'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPost } from '@/services/api';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || (!url.trim() && !text.trim())) {
      setError('Title and either URL or text are required');
      return;
    }
    
    try {
      setLoading(true);
      // In a real app, you would get the token from context or state
      const token = localStorage.getItem('token');
      await submitPost(title, url || undefined, text || undefined, token || undefined);
      router.push('/');
    } catch (err) {
      setError('Failed to submit post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Submit New Post</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Post title"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL (optional)
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Text (optional)
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Post content"
            rows={4}
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
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}