// test-auth.ts
import { hashPassword, verifyPassword, signJwt, verifyJwt } from './src/auth/jwt';

async function testAuth() {
  console.log('Testing authentication functions...');
  
  // Test password hashing
  const password = 'testpassword123';
  const hashedPassword = await hashPassword(password);
  console.log('Password hashed successfully');
  
  // Test password verification
  const isValid = await verifyPassword(password, hashedPassword);
  console.log('Password verification (correct):', isValid);
  
  const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
  console.log('Password verification (incorrect):', isInvalid);
  
  // Test JWT signing
  const payload = { userId: 123, email: 'test@example.com' };
  const env = { JWT_SECRET: 'test-secret-key' };
  const token = await signJwt(payload, env as any);
  console.log('JWT signed successfully, token length:', token.length);
  
  // Test JWT verification
  const verifiedPayload = await verifyJwt(token, env as any);
  console.log('JWT verified successfully:', verifiedPayload);
  
  console.log('All authentication tests passed!');
}

testAuth().catch(console.error);