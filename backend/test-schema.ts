// Test database schema
import { drizzle } from 'drizzle-orm/d1';
import { users, posts, comments, votes } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';

// This is just to verify the schema compiles correctly
console.log('Database schema imported successfully');

// Test a simple query structure
const testQuery = {
  select: {
    id: posts.id,
    title: posts.title,
    author: users.username,
  },
  from: posts,
  leftJoin: [users, eq(posts.authorId, users.id)],
  orderBy: [desc(posts.createdAt)],
};

console.log('Query structure is valid');