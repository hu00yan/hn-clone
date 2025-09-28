# 从零开始构建全栈 Hacker News 克隆教程

这是一个完整的教程，教你如何从零开始构建一个功能完整的 Hacker News 克隆应用，并部署到 Cloudflare。

## 🚀 项目概览

这个项目是一个全功能的 Hacker News 克隆，包含以下特性：

- **前端**：Next.js 15 + TypeScript + Tailwind CSS
- **后端**：Hono.js + Cloudflare Workers
- **数据库**：Cloudflare D1 (SQLite) + Drizzle ORM
- **认证**：JWT token 认证
- **部署**：Cloudflare Pages + Workers

### 📋 功能特性

✅ 用户注册和登录
✅ 发布帖子（story/ask/show/job）
✅ 查看帖子列表（hot/new/ask/show/jobs）
✅ 帖子投票系统
✅ 评论功能
✅ 响应式设计
✅ 静态导出支持
✅ 生产环境部署

### 🌐 在线演示

- **前端**：https://281fcbd8.hn-clone-frontend.pages.dev
- **后端 API**：https://hn-clone-api.hacker-news-roo.workers.dev

## 📚 目录

1. [项目初始化](#1-项目初始化)
2. [后端开发](#2-后端开发)
3. [前端开发](#3-前端开发)
4. [数据库设计](#4-数据库设计)
5. [认证系统](#5-认证系统)
6. [API 路由](#6-api-路由)
7. [前端页面](#7-前端页面)
8. [部署到 Cloudflare](#8-部署到-cloudflare)
9. [问题排查和修复](#9-问题排查和修复)
10. [总结](#10-总结)

## 1. 项目初始化

### 1.1 创建项目结构

```bash
mkdir hn-clone
cd hn-clone

# 创建 workspace 配置
cat > pnpm-workspace.yaml << EOF
packages:
  - "backend"
  - "frontend"
EOF

cat > package.json << EOF
{
  "name": "hn-clone",
  "private": true,
  "packageManager": "pnpm@10.14.0",
  "workspaces": [
    "backend",
    "frontend"
  ],
  "scripts": {
    "dev": "pnpm --filter hn-clone-backend dev & pnpm --filter hn-clone-frontend dev",
    "build": "pnpm --filter hn-clone-backend build && pnpm --filter hn-clone-frontend build",
    "test": "pnpm --filter hn-clone-backend test && pnpm --filter hn-clone-frontend test",
    "deploy": "pnpm --filter hn-clone-backend deploy && pnpm --filter hn-clone-frontend deploy"
  }
}
EOF
```

### 1.2 初始化后端项目

```bash
mkdir backend
cd backend

# 初始化 package.json
cat > package.json << EOF
{
  "name": "hn-clone-backend",
  "version": "1.0.0",
  "description": "Hono.js backend for Hacker News clone",
  "main": "src/index.ts",
  "scripts": {
    "dev": "wrangler dev src/index.ts",
    "deploy": "wrangler deploy --minify src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "build": "echo \"Building backend...\""
  },
  "dependencies": {
    "@types/bcryptjs": "^3.0.0",
    "bcryptjs": "^3.0.2",
    "drizzle-orm": "^0.44.4",
    "hono": "^4.0.0",
    "jose": "^5.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "drizzle-kit": "^0.31.4",
    "typescript": "^5.0.0",
    "vite": "^5.4.10",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^2.1.9",
    "wrangler": "^4.31.0"
  }
}
EOF

# 创建 Wrangler 配置
cat > wrangler.toml << EOF
name = "hn-clone-api"
main = "src/index.ts"
compatibility_date = "2024-08-16"

[vars]
JWT_SECRET = "mfVxIxhVrW0tuU2XUaxLH4jEpPYg5DgW7Uo8aB2eF8nK"
DATABASE_ID = "your-database-id"

[[d1_databases]]
binding = "DB"
database_name = "hn-clone-db"
database_id = "78adfc48-0926-48c5-91d6-9f85b876a5d2"
EOF

# 创建 TypeScript 配置
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# 创建 Drizzle 配置
cat > drizzle.config.ts << EOF
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    wranglerConfigPath: 'wrangler.toml',
  }
} satisfies Config;
EOF
```

### 1.3 初始化前端项目

```bash
cd ../
mkdir frontend
cd frontend

# 使用 Next.js 创建项目
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

# 更新 package.json
cat > package.json << EOF
{
  "name": "hn-clone-frontend",
  "version": "1.0.0",
  "description": "Next.js frontend for Hacker News clone",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "EXPORT_MODE=true next build && echo \"Static export completed. Note: Dynamic routes will load data at runtime.\"",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:unit": "jest",
    "test:e2e": "pnpm exec playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@types/node": "^22.5.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.5.4"
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^15.4.6",
    "@playwright/test": "^1.54.2",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest": "^30.0.0",
    "@typescript-eslint/eslint-plugin": "^8.39.1",
    "@typescript-eslint/parser": "^8.39.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.33.0",
    "eslint-config-next": "^15.4.6",
    "eslint-plugin-next": "^0.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "next": "^15.4.6",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10"
  }
}
EOF
```

## 2. 后端开发

### 2.1 数据库 Schema 设计

创建 `backend/src/db/schema.ts`：

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // hashed
  about: text('about'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url'),
  text: text('text'),
  type: text('type').notNull().default('story'), // story, ask, show, job
  authorId: integer('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  isDead: integer('is_dead', { mode: 'boolean' }).notNull().default(false),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  parentId: integer('parent_id'), // for nested comments
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  score: integer('score').notNull().default(0), // for comment voting
});

export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  commentId: integer('comment_id').references(() => comments.id),
  voteType: integer('vote_type').notNull(), // 1 for upvote, -1 for downvote
});
```

### 2.2 数据库连接

创建 `backend/src/db/client.ts`：

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { Env } from '../types';
import * as schema from './schema';

export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}
```

### 2.3 类型定义

创建 `backend/src/types.ts`：

```typescript
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
  type: 'story' | 'ask' | 'show' | 'job';
  author: string; // username from joined users table
  authorId: number; // for internal use
  createdAt: Date;
  upvotes: number;
  downvotes?: number;
  score?: number;
};

// Comment type for API responses
export type Comment = {
  id: number;
  postId: number;
  authorId: number;
  author: string; // username from joined users table
  text: string;
  createdAt: Date;
  parentId?: number;
  score: number;
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
```

### 2.4 JWT 认证工具

创建 `backend/src/auth/jwt.ts`：

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';
import { User, Env } from '../types';

const secret = new TextEncoder().encode('your-secret-key');

export async function signJwt(payload: User, env: Env): Promise<string> {
  const secretKey = env.JWT_SECRET || 'default-secret-key';
  const key = new TextEncoder().encode(secretKey);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyJwt(token: string, env: Env): Promise<User | null> {
  try {
    const secretKey = env.JWT_SECRET || 'default-secret-key';
    const key = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify(token, key);
    return payload as User;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}
```

### 2.5 认证中间件

创建 `backend/src/auth/middleware.ts`：

```typescript
import { Context, Next } from 'hono';
import { verifyJwt } from './jwt';
import { Env, Variables } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);
  const user = await verifyJwt(token, c.env);

  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
}
```

### 2.6 认证路由

创建 `backend/src/routes/auth.ts`：

```typescript
import { Hono } from "hono";
import { signJwt } from "../auth/jwt";
import { Env, Variables, NewUser } from "../types";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { hashPassword, verifyPassword } from "../auth/jwt";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.post("/register", async (c) => {
  const db = c.get("db");
  const { email, username, password } = await c.req.json();

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return c.json({ error: "User already exists" }, 400);
  }

  const hashedPassword = await hashPassword(password);
  const newUser: NewUser = { email, username, password: hashedPassword };

  const result = await db.insert(users).values(newUser).returning();
  const user = result[0];

  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);

  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

app.post("/login", async (c) => {
  const db = c.get("db");
  const { email, password } = await c.req.json();

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const user = result[0];
  const validPassword = await verifyPassword(password, user.password);
  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const token = await signJwt({ id: user.id, email: user.email, username: user.username }, c.env);

  return c.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

export default app;
```

### 2.7 帖子路由

创建 `backend/src/routes/posts.ts`：

```typescript
import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { desc, eq, sql, and, inArray } from 'drizzle-orm';
import { posts, users } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 计算热度（自然衰减）
const rankExpr = sql<number>`
  ( (${posts.upvotes} * 1.0) /
    ( ((strftime('%s','now') - ${posts.createdAt}) / 3600.0) + 2.0 )
  )
`;

/**
 * GET /posts/hot
 * 按热度衰减排序
 */
app.get('/hot', async (c) => {
  const db = c.get('db');

  const hotPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      text: posts.text,
      type: posts.type,
      author: users.username,
      createdAt: posts.createdAt,
      upvotes: posts.upvotes,
      score: sql<number>`${posts.upvotes}`
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        eq(posts.isDeleted, false),
        eq(posts.isDead, false),
        inArray(posts.type, ['story', 'ask', 'show'])
      )
    )
    .orderBy(desc(rankExpr), desc(posts.createdAt))
    .limit(30);

  return c.json(hotPosts);
});

/**
 * GET /posts/new
 * 按创建时间倒序
 */
async function newestHandler(c: any) {
  const db = c.get('db');
  const newest = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      text: posts.text,
      type: posts.type,
      author: users.username,
      createdAt: posts.createdAt,
      upvotes: posts.upvotes,
      score: sql<number>`${posts.upvotes}`
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        eq(posts.isDeleted, false),
        eq(posts.isDead, false),
        inArray(posts.type, ['story', 'ask', 'show'])
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return c.json(newest);
}
app.get('/new', newestHandler);
app.get('/newest', newestHandler);

/**
 * POST /posts/submit
 * 提交新帖子
 */
app.post('/submit', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  const body = await c.req.json();
  const rawType = (body?.type ?? 'story') as string;
  const type = ['story', 'ask', 'show', 'job'].includes(rawType) ? (rawType as 'story'|'ask'|'show'|'job') : 'story';

  const title: string | undefined = body?.title;
  const url: string | undefined = body?.url ?? undefined;
  const text: string | undefined = body?.text ?? undefined;

  if (!title) {
    return c.json({ error: 'title is required' }, 400);
  }

  // 验证互斥规则
  if (type === 'ask') {
    if (!text || url) {
      return c.json({ error: 'Ask HN must include text only (no url)' }, 400);
    }
  } else {
    const hasUrl = Boolean(url && url.trim());
    const hasText = Boolean(text && text.trim());
    if (hasUrl === hasText) {
      return c.json({ error: 'Provide exactly one of url or text' }, 400);
    }
  }

  const result = await db
    .insert(posts)
    .values({
      title,
      url: url ?? null,
      text: text ?? null,
      type,
      authorId: user.id
    })
    .returning();

  return c.json(result[0]);
});

export default app;
```

### 2.8 主入口文件

创建 `backend/src/index.ts`：

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { createDb } from './db/client';
import { Env, Variables } from './types';

// 导入路由
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import voteRoutes from './routes/votes';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 中间件
app.use('*', timing());
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 数据库中间件
app.use('*', async (c, next) => {
  const db = createDb(c.env);
  c.set('db', db);
  await next();
});

// 路由
app.route('/auth', authRoutes);
app.route('/posts', postRoutes);
app.route('/votes', voteRoutes);

// 健康检查
app.get('/', (c) => {
  return c.json({ message: 'Hacker News Clone API', status: 'OK' });
});

export default app;
```

## 3. 前端开发

### 3.1 类型定义

创建 `frontend/src/types.ts`：

```typescript
export interface User {
  id: number;
  email: string;
  username: string;
}

export interface Post {
  id: number;
  title: string;
  url?: string;
  text?: string;
  type: 'story' | 'ask' | 'show' | 'job';
  author: string; // username from joined users table
  authorId: number; // for internal use
  createdAt: Date;
  upvotes: number;
  downvotes?: number;
  score?: number;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  author: string; // username from joined users table
  text: string;
  createdAt: Date;
  parentId?: number;
  score: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```

### 3.2 API 服务

创建 `frontend/src/services/api.ts`：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async register(email: string, username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });
    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async getHotPosts() {
    const response = await fetch(`${API_BASE_URL}/posts/hot`);
    return response.json();
  }

  async getNewPosts() {
    const response = await fetch(`${API_BASE_URL}/posts/new`);
    return response.json();
  }

  async submitPost(title: string, url?: string, text?: string, type: string = 'story') {
    const response = await fetch(`${API_BASE_URL}/posts/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ title, url, text, type }),
    });
    return response.json();
  }
}

export const apiService = new ApiService();
```

### 3.3 主要组件

创建 `frontend/src/components/Header.tsx`：

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(JSON.parse(user).username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
    router.push('/');
  };

  return (
    <header className="bg-orange-500 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              Hacker News
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="hover:underline">new</Link>
              <Link href="/" className="hover:underline">past</Link>
              <Link href="/" className="hover:underline">comments</Link>
              <Link href="/" className="hover:underline">ask</Link>
              <Link href="/" className="hover:underline">show</Link>
              <Link href="/" className="hover:underline">jobs</Link>
              <Link href="/submit" className="hover:underline">submit</Link>
            </nav>
          </div>
          <div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span>Welcome, {username}!</span>
                <button onClick={handleLogout} className="hover:underline">
                  logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="hover:underline">login</Link>
                <Link href="/register" className="hover:underline">register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

创建 `frontend/src/components/PostList.tsx`：

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';
import PostItem from './PostItem';
import { apiService } from '@/services/api';

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiService.getHotPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## 4. 部署到 Cloudflare

### 4.1 准备部署

1. **设置 Cloudflare 认证**：
   ```bash
   npx wrangler login
   ```

2. **创建 D1 数据库**：
   ```bash
   npx wrangler d1 create hn-clone-db
   ```

### 4.2 后端部署

```bash
cd backend

# 生成数据库迁移
npx drizzle-kit generate

# 应用迁移到远程数据库
npx wrangler d1 migrations apply hn-clone-db --remote

# 部署 Worker
npx wrangler deploy
```

### 4.3 前端部署

```bash
cd frontend

# 构建并导出静态文件
pnpm build && pnpm export

# 部署到 Cloudflare Pages
npx wrangler pages deploy out --project-name hn-clone-frontend
```

## 5. 问题排查和修复

在开发过程中遇到了以下主要问题和解决方案：

### 5.1 问题：删除的 shared 包导致工作区失败

**问题描述**：
项目最初有一个 `shared` 包用于在前后端之间共享类型，但在重构过程中被删除了。然而，workspace 配置和 package.json 中仍然引用这个包，导致构建失败。

**错误信息**：
```
No projects matched the filters in "/Users/huyan00/mycode/hn-clone"
```

**诊断过程**：
1. 使用 `git status` 检查发现多个被删除的 shared 包文件
2. 检查 `package.json` 和 `pnpm-workspace.yaml` 配置
3. 发现工作区过滤器使用的包名不匹配

**解决方案**：
1. 从根 `package.json` 中移除 `shared` 包引用
2. 从前后端 `package.json` 中移除 `shared` 依赖
3. 更新构建脚本使用正确的包名（`hn-clone-backend`，`hn-clone-frontend`）
4. 在前后端分别维护独立的类型定义

### 5.2 问题：数据库架构不匹配

**问题描述**：
更新了数据库 schema 添加了新字段（`type`, `isDeleted`, `isDead`, `score`），但本地数据库没有应用迁移，导致查询失败。

**错误信息**：
```
D1_ERROR: no such column: posts.type at offset 69: SQLITE_ERROR
```

**诊断过程**：
1. 检查后端日志发现 SQL 查询失败
2. 检查 schema 文件确认字段存在
3. 检查迁移文件发现需要应用新迁移

**解决方案**：
1. 生成新的迁移文件：`npx drizzle-kit generate`
2. 重置本地数据库：`rm -rf .wrangler/state/v3/d1`
3. 应用所有迁移：`npx wrangler d1 migrations apply hn-clone-db --local`
4. 重启开发服务器以重新连接数据库

### 5.3 问题：测试模拟配置错误

**问题描述**：
后端测试中的数据库模拟配置不正确，对 Drizzle ORM 的查询链式调用理解有误。

**错误信息**：
```
Cannot read properties of undefined (reading 'password')
expected 500 to be 200
```

**诊断过程**：
1. 检查测试文件中的模拟配置
2. 发现对 `select` 操作错误地使用了 `returning()`
3. 理解 Drizzle ORM 中 `select` 查询应该在最后一个方法调用中解析数据

**解决方案**：
1. 修正测试中的数据库模拟链：
   ```typescript
   // 错误的方式
   mockDb.limit.mockReturnValueOnce(mockDb);
   mockDb.returning.mockResolvedValueOnce([...]);

   // 正确的方式
   mockDb.limit.mockResolvedValueOnce([...]);
   ```
2. 确保 `returning()` 只用于 `insert`/`update` 操作
3. 对 `select` 操作在链的最后解析为实际数据

### 5.4 问题：前端测试配置问题

**问题描述**：
Jest 无法解析 `@/` 路径别名，E2E 测试被包含在 Jest 运行中导致错误。

**错误信息**：
```
Cannot find module '@/components/Header' from '__tests__/Header.test.tsx'
Playwright Test needs to be invoked via 'pnpm exec playwright test'
```

**诊断过程**：
1. 检查 Jest 配置文件
2. 发现缺少模块名映射配置
3. 发现 E2E 测试文件被 Jest 意外包含

**解决方案**：
1. 在 `jest.config.js` 中添加模块名映射：
   ```javascript
   moduleNameMapping: {
     '^@/(.*)$': '<rootDir>/src/$1',
   }
   ```
2. 排除 E2E 测试目录：
   ```javascript
   testPathIgnorePatterns: [
     '<rootDir>/node_modules/',
     '<rootDir>/.next/',
     '<rootDir>/e2e/',
   ]
   ```

### 5.5 问题：工作区包名过滤不匹配

**问题描述**：
PNPM 工作区过滤器使用目录名（`backend`，`frontend`）但实际包名不同（`hn-clone-backend`，`hn-clone-frontend`）。

**诊断过程**：
1. 检查 `package.json` 中的包名
2. 测试不同的过滤器语法
3. 确认 PNPM 使用包名而不是目录名进行过滤

**解决方案**：
更新根 `package.json` 中的脚本：
```json
{
  "scripts": {
    "dev": "pnpm --filter hn-clone-backend dev & pnpm --filter hn-clone-frontend dev",
    "build": "pnpm --filter hn-clone-backend build && pnpm --filter hn-clone-frontend build"
  }
}
```

## 6. 经验总结

### 6.1 最佳实践

1. **类型安全**：在前后端保持一致的类型定义，考虑使用 monorepo 共享类型
2. **错误处理**：实现全面的错误处理和日志记录
3. **测试驱动**：编写测试时确保正确模拟外部依赖
4. **渐进部署**：先在本地测试，然后部署到生产环境
5. **版本控制**：保持清晰的提交历史和分支策略

### 6.2 调试技巧

1. **日志优先**：遇到问题时首先检查日志和错误信息
2. **隔离测试**：单独测试每个组件和 API 端点
3. **状态检查**：使用 `git status` 和配置文件检查项目状态
4. **重现问题**：在不同环境中重现问题以排除环境因素

### 6.3 工具链优势

1. **Cloudflare 平台**：提供统一的边缘计算平台
2. **D1 数据库**：SQLite 兼容的分布式数据库
3. **Drizzle ORM**：类型安全的数据库操作
4. **Next.js**：强大的 React 框架，支持静态导出
5. **PNPM 工作区**：高效的 monorepo 管理

## 7. 总结

这个项目展示了如何构建一个现代化的全栈 Web 应用：

- **后端**：使用 Hono.js 和 Cloudflare Workers 构建高性能 API
- **前端**：使用 Next.js 构建响应式用户界面
- **数据库**：使用 Cloudflare D1 和 Drizzle ORM 管理数据
- **部署**：利用 Cloudflare 边缘网络实现全球部署

通过解决开发过程中遇到的各种问题，我们学到了：
- 工作区配置的重要性
- 数据库迁移的最佳实践
- 测试模拟的正确方法
- 生产环境部署的注意事项

最终产品是一个功能完整、可扩展的 Hacker News 克隆应用，演示了现代 Web 开发的最佳实践。

---

**在线演示**：
- 前端：https://281fcbd8.hn-clone-frontend.pages.dev
- 后端 API：https://hn-clone-api.hacker-news-roo.workers.dev

**源代码**：完整的项目代码可在本仓库中找到。