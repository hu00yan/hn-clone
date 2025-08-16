import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { Env, Variables } from './types';
import { createDb } from './db/client';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import voteRoutes from './routes/votes';
import commentRoutes from './routes/comments';

// Create the main Hono application
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware setup
// Add timing information to responses
app.use('*', timing());

// Add request logging
app.use('*', logger());

// Configure CORS for cross-origin requests
app.use(
  '*',
  cors({
    origin: '*', // Change this to your frontend URL in production
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  })
);

// Database setup middleware
// Creates a database client for each request
app.use('*', async (c, next) => {
  const db = createDb(c.env.DB);
  c.set('db', db);
  await next();
});

// Route registration
// Mount all the different route modules
app.route('/auth', authRoutes);
app.route('/posts', postRoutes);
app.route('/votes', voteRoutes);
app.route('/comments', commentRoutes);

// Health check endpoint
app.get('/', (c) => {
  return c.json({ message: 'Hacker News Clone API is running!' });
});

export default app;