// test-routes.ts
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

// Test route grouping
const api = new Hono();
api.get('/users', (c) => c.json({ users: [] }));
api.post('/users', (c) => c.json({ id: 1 }));

app.route('/api', api);
console.log('Route grouping works');

console.log('All route tests passed!');