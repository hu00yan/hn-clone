import { SignJWT, jwtVerify } from 'jose';
import { Env } from '../types';

// Default secret key - MUST be changed in production and stored in environment variables
const JWT_SECRET = 'your-secret-key-change-in-production';

/**
 * Signs a JWT token with the provided payload
 * @param payload - The data to include in the token
 * @param env - Environment variables containing the JWT secret
 * @returns Signed JWT token
 */
export async function signJwt(payload: any, env: Env) {
  // Use environment variable if available, otherwise use default (for development only)
  const secret = new TextEncoder().encode(
    env.JWT_SECRET ?? JWT_SECRET
  );
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days expiration

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // Use HS256 algorithm for signing
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Verifies a JWT token
 * @param token - The JWT token to verify
 * @param env - Environment variables containing the JWT secret
 * @returns The payload if valid, null if invalid
 */
export async function verifyJwt(token: string, env: Env) {
  try {
    const secret = new TextEncoder().encode(
      env.JWT_SECRET ?? JWT_SECRET
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    // Return null for any verification errors
    return null;
  }
}