'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Post, Comment } from '@/types';
import { fetchPost, fetchComments } from '@/services/api';
import PostDetail from '@/components/PostDetail';
import CommentList from '@/components/CommentList';

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPostAndComments();
  }, [params.id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const postData = await fetchPost(parseInt(params.id));
      const commentsData = await fetchComments(parseInt(params.id));
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError('Failed to load post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
      <CommentList comments={comments} postId={post.id} onCommentSubmit={loadPostAndComments} />
    </div>
  );
}