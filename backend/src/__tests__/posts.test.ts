import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../src/index';
import { createDb } from '../src/db/client';

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

vi.mock('../src/db/client', () => ({
  createDb: vi.fn(() => mockDb),
}));

// Mock JWT verification
vi.mock('../src/auth/jwt', () => ({
  verifyJwt: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com', username: 'testuser' }),
}));

describe('Posts Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get hot posts', async () => {
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.leftJoin.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.returning.mockResolvedValue([
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
    expect(data.title).toBe('Test Post'); // This would be the actual post from the mock
  });
});