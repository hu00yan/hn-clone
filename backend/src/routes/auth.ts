import { Hono } from 'hono';
import { signJwt } from '../auth/jwt';
import { Env, Variables, NewUser } from '../types';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { hashPassword, verifyPassword } from '../auth/jwt';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /auth/register
 * Register a new user
 * @param email - User's email address
 * @param username - User's username
 * @param password - User's password (will be hashed)
 * @returns User object and JWT token
 */
app.post('/register', async (c) => {
  const db = c.get('db');
  
  // Parse user data from request body
  const { email, username, password } = await c.req.json();
  
  // Check if a user with this email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return c.json({ error: 'User already exists' }, 400);
  }
  
  // Hash the password using bcrypt for security
  const hashedPassword = await hashPassword(password);
  
  // Create the new user object
  const newUser: NewUser = {
    email,
    username,
    password: hashedPassword, // Store the hashed password, never the plain text
  };
  
  // Insert the new user into the database
  const result = await db.insert(users).values(newUser).returning();
  const user = result[0];
  
  // Generate a JWT token for the new user
  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);
  
  // Return the user object (without password) and token
  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

/**
 * POST /auth/login
 * Authenticate a user and return a JWT token
 * @param email - User's email address
 * @param password - User's password
 * @returns User object and JWT token
 */
app.post('/login', async (c) => {
  const db = c.get('db');
  
  // Parse login credentials from request body
  const { email, password } = await c.req.json();
  
  // Find the user by email
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 400);
  }
  
  const user = result[0];
  
  // Verify the password using bcrypt's verify function
  const validPassword = await verifyPassword(password, user.password);
  if (!validPassword) {
    return c.json({ error: 'Invalid credentials' }, 400);
  }
  
  // Generate a JWT token for the authenticated user
  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);
  
  // Return the user object (without password) and token
  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

export default app;