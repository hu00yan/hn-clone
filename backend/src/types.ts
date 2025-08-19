import { users, posts, comments } from "./db/schema";
import { D1Database } from "@cloudflare/workers-types";
import { DrizzleD1Database } from "drizzle-orm/d1";

// Database types
export type NewUser = typeof users.$inferInsert;
export type NewPost = typeof posts.$inferInsert;
export type NewComment = typeof comments.$inferInsert;

// User type for API responses
export type User = {
  id: number;
  email: string;
  username: string;
};

// Post type for API responses
export type Post = {
  id: number;
  title: string;
  url?: string;
  text?: string;
  authorId: number;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
};

// Comment type for API responses
export type Comment = {
  id: number;
  postId: number;
  authorId: number;
  text: string;
  createdAt: Date;
  parentId?: number;
};

// Auth response type
export type AuthResponse = {
  user: User;
  token: string;
};

// Environment types
export type Env = {
  DB: D1Database;
  JWT_SECRET?: string;
};

// Context variables
export type Variables = {
  user: User;
  db: DrizzleD1Database<typeof import("./db/schema")>;
};
