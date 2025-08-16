import { Context, Next } from 'hono';
import { verifyJwt } from './jwt';
import { Env, Variables } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJwt(token, c.env);
  
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  c.set('user', {
    id: payload.id as number,
    email: payload.email as string,
    username: payload.username as string
  });
  await next();
}