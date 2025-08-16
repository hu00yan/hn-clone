import { Hono } from 'hono';
import { Env, Variables, NewPost } from '../types';
import { desc, eq, sql } from 'drizzle-orm';
import { posts, users } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /posts/hot
 * Retrieve the hottest posts sorted by score (upvotes - downvotes) and creation time
 * @returns Array of posts with author information and vote counts
 */
app.get('/hot', async (c) => {
  const db = c.get('db');
  
  // Simple hot algorithm: score = upvotes - downvotes
  // In a real app, you might use a more complex algorithm like Reddit's
  const hotPosts = await db.select({
    id: posts.id,
    title: posts.title,
    url: posts.url,
    text: posts.text,
    author: users.username,
    createdAt: posts.createdAt,
    upvotes: posts.upvotes,
    downvotes: posts.downvotes,
    score: sql<number>`(${posts.upvotes} - ${posts.downvotes})`
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .orderBy(desc(sql`(${posts.upvotes} - ${posts.downvotes})`), desc(posts.createdAt))
  .limit(30); // Limit to 30 posts to prevent excessive data transfer
  
  return c.json(hotPosts);
});

/**
 * GET /posts/:id
 * Retrieve a single post by ID with author information
 * @param id - Post ID
 * @returns Post object with author information and vote counts
 */
app.get('/:id', async (c) => {
  const db = c.get('db');
  // Parse the post ID from the URL parameter
  const postId = parseInt(c.req.param('id'));
  
  // Query the database for the post with author information
  const result = await db.select({
    id: posts.id,
    title: posts.title,
    url: posts.url,
    text: posts.text,
    author: users.username,
    createdAt: posts.createdAt,
    upvotes: posts.upvotes,
    downvotes: posts.downvotes
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.id, postId))
  .limit(1); // Limit to 1 result since we're looking for a specific post
  
  // Return 404 if post not found
  if (result.length === 0) {
    return c.json({ error: 'Post not found' }, 404);
  }
  
  return c.json(result[0]);
});

/**
 * POST /posts/submit
 * Submit a new post (requires authentication)
 * @param title - Post title (required)
 * @param url - Post URL (optional, required if no text)
 * @param text - Post text content (optional, required if no URL)
 * @returns The newly created post
 */
app.post('/submit', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  // Parse the request body
  const { title, url, text } = await c.req.json();
  
  // Validate input - title is required, and either URL or text must be provided
  if (!title || (!url && !text)) {
    return c.json({ error: 'Title and either URL or text are required' }, 400);
  }
  
  // Create the new post object
  const newPost: NewPost = {
    title,
    url: url || null,
    text: text || null,
    authorId: user.id, // Use the authenticated user's ID
  };
  
  // Insert the new post into the database
  const result = await db.insert(posts).values(newPost).returning();
  const post = result[0];
  
  return c.json(post);
});

export default app;