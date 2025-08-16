import { Hono } from 'hono';
import { Env, Variables, NewComment } from '../types';
import { desc, eq, and } from 'drizzle-orm';
import { comments, users, posts } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /comments/post/:id
 * Retrieve all comments for a specific post
 * @param id - Post ID
 * @returns Array of comments with author information
 */
app.get('/post/:id', async (c) => {
  const db = c.get('db');
  
  // Parse the post ID from the URL parameter
  const postId = parseInt(c.req.param('id'));
  
  // Check if the post exists
  const postResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (postResult.length === 0) {
    return c.json({ error: 'Post not found' }, 404);
  }
  
  // Get all comments for the post with author information
  const postComments = await db.select({
    id: comments.id,
    postId: comments.postId,
    text: comments.text,
    createdAt: comments.createdAt,
    author: users.username,
    parentId: comments.parentId
  })
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .where(eq(comments.postId, postId))
  .orderBy(desc(comments.createdAt)); // Order by creation time, newest first
  
  return c.json(postComments);
});

/**
 * POST /comments/post/:id
 * Add a new comment to a post (requires authentication)
 * @param id - Post ID to comment on
 * @param text - Comment text (required)
 * @param parentId - ID of parent comment for nested replies (optional)
 * @returns The newly created comment with author information
 */
app.post('/post/:id', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  // Parse the post ID from the URL parameter
  const postId = parseInt(c.req.param('id'));
  
  // Parse the comment data from the request body
  const { text, parentId } = await c.req.json();
  
  // Validate input - comment text is required
  if (!text) {
    return c.json({ error: 'Comment text is required' }, 400);
  }
  
  // Check if the post exists
  const postResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (postResult.length === 0) {
    return c.json({ error: 'Post not found' }, 404);
  }
  
  // Create the new comment object
  const newComment: NewComment = {
    postId,
    authorId: user.id, // Use the authenticated user's ID
    text,
    parentId: parentId || null // Set parent ID for nested comments, or null for top-level
  };
  
  // Insert the new comment into the database
  const result = await db.insert(comments).values(newComment).returning();
  const comment = result[0];
  
  // Return the comment with author information
  const commentWithAuthor = await db.select({
    id: comments.id,
    postId: comments.postId,
    text: comments.text,
    createdAt: comments.createdAt,
    author: users.username,
    parentId: comments.parentId
  })
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .where(eq(comments.id, comment.id))
  .limit(1);
  
  return c.json(commentWithAuthor[0]);
});

export default app;