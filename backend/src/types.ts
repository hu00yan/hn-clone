import { users, posts, comments } from './db/schema';
import { D1Database } from '@cloudflare/workers-types';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Env = {
  DB: D1Database;
  JWT_SECRET?: string;
};

export type Variables = {
  user: {
    id: number;
    email: string;
    username: string;
  };
  db: DrizzleD1Database<typeof import('./db/schema')>;
};