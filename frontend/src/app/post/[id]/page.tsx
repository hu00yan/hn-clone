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
    
    // A dummy function for the CommentList component
    const handleCommentSubmit = () => {
      // This is a static export, so we can't actually submit comments
      // In a real application, this would be handled differently
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        <PostDetail post={post} />
        <CommentList comments={comments} postId={post.id} onCommentSubmit={handleCommentSubmit} />
      </div>
    );
  } catch (err) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Failed to load post</div>;
  }
}