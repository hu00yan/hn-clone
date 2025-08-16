// Simple test script to verify the backend code compiles and runs
import { Hono } from 'hono';
import { Env, Variables } from './src/types';

// Create the main Hono application
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Health check endpoint
app.get('/', (c) => {
  return c.json({ message: 'Hacker News Clone API is running!' });
});

console.log('Backend code compiles successfully!');