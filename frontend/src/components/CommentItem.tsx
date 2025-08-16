import { Comment } from '@/types';

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div className="text-sm text-gray-500">
        {comment.author} | {new Date(comment.createdAt).toLocaleString()}
      </div>
      <div className="mt-1 text-gray-700">
        {comment.text}
      </div>
    </div>
  );
}