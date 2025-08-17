"use client";

import { useState, useEffect } from "react";
import { Post, Comment } from "@/types";
import { fetchPost, fetchComments } from "@/services/api";
import PostDetail from "@/components/PostDetail";
import CommentList from "@/components/CommentList";

interface PostPageClientProps {
  id: string;
}

export default function PostPageClient({ id }: PostPageClientProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const postId = parseInt(id);
    if (isNaN(postId)) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    Promise.all([fetchPost(postId), fetchComments(postId)])
      .then(([fetchedPost, fetchedComments]) => {
        setPost(fetchedPost);
        setComments(fetchedComments);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load post");
        setLoading(false);
        console.error(err);
      });
  }, [id]);

  const handleCommentSubmit = () => {
    const postId = parseInt(id);
    fetchComments(postId)
      .then(setComments)
      .catch((err) => console.error("Failed to refetch comments", err));
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        {error || "Post not found"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
      <CommentList
        comments={comments}
        postId={parseInt(id)}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
}
