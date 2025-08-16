import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { eq, and } from 'drizzle-orm';
import { posts, votes } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /votes/post/:id
 * Vote on a post (requires authentication)
 * @param id - Post ID to vote on
 * @param voteType - 1 for upvote, -1 for downvote
 * @returns Updated post with new vote counts
 */
app.post('/post/:id', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  // Parse the post ID from the URL parameter
  const postId = parseInt(c.req.param('id'));
  
  // Parse the vote type from the request body
  const { voteType } = await c.req.json(); // 1 for upvote, -1 for downvote
  
  // Validate vote type - must be either 1 (upvote) or -1 (downvote)
  if (voteType !== 1 && voteType !== -1) {
    return c.json({ error: 'Invalid vote type. Must be 1 (upvote) or -1 (downvote)' }, 400);
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
    // User has already voted - update their existing vote
    await db.update(votes).set({ voteType }).where(
      and(
        eq(votes.userId, user.id),
        eq(votes.postId, postId)
      )
    );
    
    // Update post vote counts based on the change in vote
    if (existingVote[0].voteType !== voteType) {
      if (voteType === 1) {
        // Changed from downvote to upvote
        await db.update(posts).set({
          upvotes: post.upvotes + 1,
          downvotes: post.downvotes - 1
        }).where(eq(posts.id, postId));
      } else {
        // Changed from upvote to downvote
        await db.update(posts).set({
          upvotes: post.upvotes - 1,
          downvotes: post.downvotes + 1
        }).where(eq(posts.id, postId));
      }
    }
  } else {
    // User hasn't voted yet - create a new vote
    await db.insert(votes).values({
      userId: user.id,
      postId,
      voteType
    });
    
    // Update post vote counts based on the new vote
    if (voteType === 1) {
      await db.update(posts).set({
        upvotes: post.upvotes + 1
      }).where(eq(posts.id, postId));
    } else {
      await db.update(posts).set({
        downvotes: post.downvotes + 1
      }).where(eq(posts.id, postId));
    }
  }
  
  // Fetch the updated post to return to the client
  const updatedPost = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  
  return c.json(updatedPost[0]);
});

export default app;