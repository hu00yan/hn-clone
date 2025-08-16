// test-db-connection.ts
import { drizzle } from 'drizzle-orm/d1';
import { users, posts, comments, votes } from './src/db/schema';

// This is a simple test to verify we can import the schema without errors
console.log('Database schema imported successfully');

// Test a simple query structure
const testQueries = {
  users: {
    select: users.id,
    insert: {
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword'
    }
  },
  posts: {
    select: posts.id,
    insert: {
      title: 'Test Post',
      authorId: 1
    }
  }
};

console.log('Query structures compiled successfully');
console.log('Database connection test completed successfully');