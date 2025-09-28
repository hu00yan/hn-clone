import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { desc, eq, sql, and, inArray } from 'drizzle-orm';
import { posts, users } from '../db/schema';
import { authMiddleware } from '../auth/middleware';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 计算热度（自然衰减，避免使用 SQLite 的 pow/sqrt，提升兼容性）
// rank = upvotes / (age_hours + 2)
const rankExpr = sql<number>`
  ( (${posts.upvotes} * 1.0) /
    ( ((strftime('%s','now') - ${posts.createdAt}) / 3600.0) + 2.0 )
  )
`;

/**
 * GET /posts/hot
 * story/ask/show，按热度衰减排序（仅 upvote）
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
 * GET /posts/newest (HN 兼容别名)
 * story/ask/show，按创建时间倒序
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
 * GET /posts/ask
 */
app.get('/ask', async (c) => {
  const db = c.get('db');
  const rows = await db
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
        eq(posts.type, 'ask')
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return c.json(rows);
});

/**
 * GET /posts/show
 */
app.get('/show', async (c) => {
  const db = c.get('db');
  const rows = await db
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
        eq(posts.type, 'show')
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return c.json(rows);
});

/**
 * GET /posts/jobs
 */
app.get('/jobs', async (c) => {
  const db = c.get('db');
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      text: posts.text,
      type: posts.type,
      author: users.username,
      createdAt: posts.createdAt,
      // jobs 通常不计分，不返回 score 也行
      upvotes: posts.upvotes,
      score: sql<number>`${posts.upvotes}`
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        eq(posts.isDeleted, false),
        eq(posts.isDead, false),
        eq(posts.type, 'job')
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return c.json(rows);
});

/**
 * GET /posts/:id
 * 单帖详情
 */
app.get('/:id', async (c) => {
  const db = c.get('db');
  const postId = parseInt(c.req.param('id'));

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      text: posts.text,
      type: posts.type,
      author: users.username,
      createdAt: posts.createdAt,
      upvotes: posts.upvotes
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json(result[0]);
});

/**
 * POST /posts/submit
 * 支持 type：story|ask|show|job，且进行互斥校验
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

  // 互斥规则与必填
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
      // createdAt 由数据库默认赋值
    })
    .returning();

  return c.json(result[0]);
});

export default app;