import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../index';
import { createDb } from '../db/client';

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 1, title: 'Test Post' }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

// Mock environment
const mockEnv = {
  DB: {}, // Mock DB object
  JWT_SECRET: 'test-secret-key'
};

vi.mock('../db/client', () => ({
  createDb: vi.fn(() => mockDb),
}));

// Mock JWT verification
vi.mock('../auth/jwt', () => ({
  verifyJwt: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com', username: 'testuser' }),
}));

// Mock the context
vi.mock('hono', async () => {
  const actual = await vi.importActual('hono');
  return {
    ...actual,
    createHono: () => {
      const app = actual.createHono();
      // Mock the context for all requests
      app.use('*', (c, next) => {
        c.env = mockEnv;
        return next();
      });
      return app;
    }
  };
});

describe('Posts Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get hot posts', async () => {
    // Reset mock calls
    vi.clearAllMocks();
    
    // Properly mock the database chain
    mockDb.select.mockReturnValueOnce(mockDb);
    mockDb.from.mockReturnValueOnce(mockDb);
    mockDb.leftJoin.mockReturnValueOnce(mockDb);
    mockDb.orderBy.mockReturnValueOnce(mockDb);
    mockDb.limit.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([
      { 
        id: 1, 
        title: 'Test Post',
        author: 'testuser',
        upvotes: 10,
        downvotes: 2,
        score: 8
      }
    ]);

    const response = await app.request('/posts/hot');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe('Test Post');
  });

  it('should submit a new post when authenticated', async () => {
    // Mock the insert query to return a post
    mockDb.insert.mockReturnValueOnce(mockDb);
    mockDb.values.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ 
      id: 1, 
      title: 'New Test Post',
      url: 'https://example.com',
      text: null,
      authorId: 1
    }]);
    
    const response = await app.request('/posts/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        title: 'New Test Post',
        url: 'https://example.com',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.title).toBe('New Test Post');
  });
});