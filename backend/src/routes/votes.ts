import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { eq, and } from 'drizzle-orm';
import { posts, votes, comments } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /votes/post/:id
 * Vote on a post (requires authentication)
 * @param id - Post ID to vote on
 * @param voteType - 1 for upvote
 * @returns Updated post with new vote counts
 */
app.post('/post/:id', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  // Parse the post ID from the URL parameter
  const postId = parseInt(c.req.param('id'));
  
  // Parse the vote type from the request body
  const { voteType } = await c.req.json(); // 1 for upvote only
  // Validate vote type - must be 1 (upvote)
  if (voteType !== 1) {
    return c.json({ error: 'Invalid vote type. Must be 1 (upvote)' }, 400);
  }
  
  // Check if the post exists
  const postResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (postResult.length === 0) {
    return c.json({ error: 'Post not found' }, 404);
  }
  
  const post = postResult[0];
  
  // Check if the user has already voted on this post
  const existingVote = await db.select().from(votes).where(
    and(
      eq(votes.userId, user.id),
      eq(votes.postId, postId)
    )
  ).limit(1);
  
  if (existingVote.length > 0) {
    // User has already voted
    if (existingVote[0].voteType === 1) {
      // Already upvoted, do nothing
      const updatedPost = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      return c.json(updatedPost[0]);
    }
    // This case shouldn't happen since only upvotes are allowed, but for safety:
    await db.update(votes).set({ voteType: 1 }).where(
      and(
        eq(votes.userId, user.id),
        eq(votes.postId, postId)
      )
    );
    // Increment upvotes (since it wasn't previously upvoted)
    await db.update(posts).set({
      upvotes: post.upvotes + 1
    }).where(eq(posts.id, postId));
  } else {
    // User hasn't voted yet - create a new vote
    await db.insert(votes).values({
      userId: user.id,
      postId,
      voteType: 1
    });
    // Increment upvotes
    await db.update(posts).set({
      upvotes: post.upvotes + 1
    }).where(eq(posts.id, postId));
  }
  
  // Fetch the updated post to return to the client
  const updatedPost = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  
  return c.json(updatedPost[0]);
});

/**
 * POST /votes/comment/:id
 * Vote on a comment (requires authentication)
 * @param id - Comment ID to vote on
 * @param voteType - 1 for upvote
 * @returns Updated comment with new vote counts
 */
app.post('/comment/:id', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const commentId = parseInt(c.req.param('id'));
  const { voteType } = await c.req.json();
  if (voteType !== 1) {
    return c.json({ error: 'Invalid vote type. Must be 1 (upvote)' }, 400);
  }
  const commentResult = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (commentResult.length === 0) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  const comment = commentResult[0];
  const existingVote = await db.select().from(votes).where(
    and(
      eq(votes.userId, user.id),
      eq(votes.commentId, commentId)
    )
  ).limit(1);
  if (existingVote.length > 0) {
    if (existingVote[0].voteType === 1) {
      // Already upvoted, do nothing
      const updatedComment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
      return c.json(updatedComment[0]);
    }
    // This case shouldn't happen since only upvotes are allowed, but for safety:
    await db.update(votes).set({ voteType: 1 }).where(
      and(eq(votes.userId, user.id), eq(votes.commentId, commentId))
    );
    await db.update(comments).set({
      score: comment.score + 1
    }).where(eq(comments.id, commentId));
  } else {
    await db.insert(votes).values({
      userId: user.id,
      commentId,
      voteType: 1
    });
    await db.update(comments).set({ score: comment.score + 1 }).where(eq(comments.id, commentId));
  }
  const updatedComment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  return c.json(updatedComment[0]);
});

export default app;