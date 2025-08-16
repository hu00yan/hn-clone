import { Post, Comment } from '@/types';
import { fetchPost, fetchComments } from '@/services/api';
import PostDetail from '@/components/PostDetail';
import CommentList from '@/components/CommentList';

// This function is required for static export
export async function generateStaticParams() {
  // For demonstration, we're returning some sample IDs
  // In a real application, you would fetch these from your API
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export const dynamicParams = false; // Only generate static pages for the params returned by generateStaticParams

// Server-side rendering for static export
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolve the params promise
    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);
    const post: Post = await fetchPost(postId);
    const comments: Comment[] = await fetchComments(postId);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <PostDetail post={post} />
        {/* For static export, we can't use interactive components with event handlers */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Comments</h2>
          <div className="mt-6 space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Failed to load post</div>;
  }
}