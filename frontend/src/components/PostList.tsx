import { Post } from '@/types';
import { fetchHotPosts } from '@/services/api';
import PostItem from '@/components/PostItem';

export default async function PostList() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    posts = await fetchHotPosts();
  } catch (err) {
    error = 'Failed to load posts';
    console.error(err);
  }

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}