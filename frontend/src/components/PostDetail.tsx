'use client';

import { Post } from '@/types';
import Link from 'next/link';

export default function PostDetail({ post }: { post: Post }) {
  const score = post.upvotes - post.downvotes;
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex">
        <div className="flex flex-col items-center mr-4">
          <button className="text-gray-500 hover:text-orange-500">
            ▲
          </button>
          <span className="font-bold my-1">{score}</span>
          <button className="text-gray-500 hover:text-blue-500">
            ▼
          </button>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{post.title}</h1>
          {post.url && (
            <div className="mt-2">
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {post.url}
              </a>
            </div>
          )}
          {post.text && (
            <div className="mt-4 text-gray-700">
              {post.text}
            </div>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {post.upvotes} points by {post.author} |{' '}
            <Link href={`/post/${post.id}`} className="hover:underline">
              comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}