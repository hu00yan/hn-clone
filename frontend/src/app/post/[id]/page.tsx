'use client';

import { useState, useEffect } from 'react';
import { Post, Comment } from '@/types';
import { fetchPost, fetchComments } from '@/services/api';
import PostDetail from '@/components/PostDetail';
import CommentList from '@/components/CommentList';
import { useParams } from 'next/navigation';

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      loadPostAndComments();
    }
  }, [params?.id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      const postId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
      const postData = await fetchPost(postId);
      const commentsData = await fetchComments(postId);
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