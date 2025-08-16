// Test Hono routes
import { Hono } from 'hono';

// Test that Hono imports correctly
console.log('Hono imported successfully');

// Test creating a simple app
const app = new Hono();

// Test adding a route
app.get('/test', (c) => {
  return c.json({ message: 'Test route works' });
});

console.log('Hono route creation works');

// Test middleware
app.use('*', async (c, next) => {
  console.log('Middleware executed');
  await next();
});

console.log('Hono middleware works');