"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types";
import { fetchHotPosts } from "../services/api";
import PostItem from "./PostItem";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchHotPosts()
      .then((data: Post[]) => {
        if (mounted) setPosts(data);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError("Failed to load posts");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
