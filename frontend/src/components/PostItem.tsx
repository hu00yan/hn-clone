'use client';

import { Post } from '@/types';
import Link from 'next/link';

export default function PostItem({ post }: { post: Post }) {
  const score = post.upvotes - post.downvotes;
  
  return (
    <div className="flex p-2 border-b border-gray-200">
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
        <div className="flex items-baseline">
          <Link href={`/post/${post.id}`} className="text-blue-600 hover:underline">
            {post.title}
          </Link>
          {post.url && (
            <span className="ml-2 text-xs text-gray-500">
              ({new URL(post.url).hostname})
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {post.upvotes} points by {post.author} |{' '}
          <Link href={`/post/${post.id}`} className="hover:underline">
            comments
          </Link>
        </div>
      </div>
    </div>
  );
}