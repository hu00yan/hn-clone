import { Metadata } from "next";
import PostPageClient from "./client-page";

// For static export, we provide a minimal set of static params
// The actual dynamic routing will work at runtime
export async function generateStaticParams() {
  // Return a minimal set of IDs to satisfy Next.js export requirements
  // In a real application, this might fetch the most recent or popular posts
  return [{ id: "1" }];
}

// Optional: Generate metadata for the post page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Post ${id} - HN Clone`,
    description: `View post ${id} and its comments`,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostPageClient id={id} />;
}
