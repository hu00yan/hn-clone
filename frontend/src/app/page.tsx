import PostList from '@/components/PostList';

// Server-side rendering
export default async function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hacker News Clone</h1>
      <PostList />
    </main>
  );
}