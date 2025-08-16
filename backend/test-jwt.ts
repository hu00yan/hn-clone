// Test JWT module
import { SignJWT } from 'jose';

// Test that the jose library is working
console.log('jose library imported successfully');

// Test JWT signing function
async function testJwt() {
  const secret = new TextEncoder().encode('test-secret-key');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  const token = await new SignJWT({ userId: 123, email: 'test@example.com' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
  
  console.log('JWT signing works correctly');
  console.log('Token length:', token.length);
}

testJwt().catch(console.error);