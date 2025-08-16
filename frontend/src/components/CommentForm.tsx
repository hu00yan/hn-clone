'use client';

import { useState } from 'react';
import { submitComment } from '@/services/api';

export default function CommentForm({ 
  postId,
  onCommentSubmit
}: { 
  postId: number;
  onCommentSubmit: () => void;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    try {
      setLoading(true);
      // In a real app, you would get the token from context or state
      const token = localStorage.getItem('token');
      await submitComment(postId, text, undefined, token || undefined);
      setText('');
      onCommentSubmit();
    } catch (err) {
      setError('Failed to submit comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      <div className="mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          disabled={loading || !text.trim()}
        >
          {loading ? 'Submitting...' : 'Add Comment'}
        </button>
      </div>
    </form>
  );
}