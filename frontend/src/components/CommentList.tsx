'use client';

import { Comment } from '@/types';
import CommentItem from '@/components/CommentItem';
import CommentForm from '@/components/CommentForm';

export default function CommentList({ 
  comments, 
  postId,
  onCommentSubmit 
}: { 
  comments: Comment[]; 
  postId: number;
  onCommentSubmit: () => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Comments</h2>
      <CommentForm postId={postId} onCommentSubmit={onCommentSubmit} />
      <div className="mt-6 space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}