import PostList from '@/components/PostList';

export const dynamic = 'force-static'; // Force static rendering
export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hacker News Clone</h1>
      <PostList />
    </main>
  );
}