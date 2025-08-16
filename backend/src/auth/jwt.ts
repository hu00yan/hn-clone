import { SignJWT, jwtVerify } from 'jose';
import { Env } from '../types';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function signJwt(payload: any, env: Env) {
  // JWT_SECRET must be set in environment variables for production
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyJwt(token: string, env: Env) {
  try {
    // JWT_SECRET must be set in environment variables for production
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}