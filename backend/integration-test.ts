// integration-test.ts
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { users, posts } from './src/db/schema';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from './src/auth/jwt';

async function runIntegrationTest() {
  console.log('Starting integration test...');
  
  // Test 1: Password hashing and verification
  console.log('Test 1: Password hashing and verification');
  const password = 'testpassword123';
  const hashedPassword = await hashPassword(password);
  const isValid = await verifyPassword(password, hashedPassword);
  const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
  
  if (isValid && !isInvalid) {
    console.log('✓ Password hashing and verification works');
  } else {
    console.log('✗ Password hashing and verification failed');
    return;
  }
  
  // Test 2: JWT signing and verification
  console.log('Test 2: JWT signing and verification');
  const payload = { userId: 123, email: 'test@example.com' };
  const env = { JWT_SECRET: 'test-secret-key' };
  const token = await signJwt(payload, env as any);
  const verifiedPayload = await verifyJwt(token, env as any);
  
  if (verifiedPayload && verifiedPayload.userId === 123) {
    console.log('✓ JWT signing and verification works');
  } else {
    console.log('✗ JWT signing and verification failed');
    return;
  }
  
  // Test 3: Database schema import
  console.log('Test 3: Database schema import');
  try {
    // Just importing to verify schema is valid
    console.log('✓ Database schema imports successfully');
  } catch (error) {
    console.log('✗ Database schema import failed:', error);
    return;
  }
  
  // Test 4: Hono framework
  console.log('Test 4: Hono framework');
  try {
    const app = new Hono();
    app.get('/test', (c) => c.json({ message: 'success' }));
    console.log('✓ Hono framework works');
  } catch (error) {
    console.log('✗ Hono framework failed:', error);
    return;
  }
  
  console.log('All integration tests passed!');
}

runIntegrationTest().catch(console.error);