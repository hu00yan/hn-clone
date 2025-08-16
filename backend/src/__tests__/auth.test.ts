import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../src/index';
import { createDb } from '../src/db/client';

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 1, email: 'test@example.com', username: 'testuser' }]),
};

vi.mock('../src/db/client', () => ({
  createDb: vi.fn(() => mockDb),
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user', async () => {
    const response = await app.request('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toEqual({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    });
    expect(data.token).toBeDefined();
  });

  it('should login an existing user', async () => {
    // Mock the select query to return a user
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.returning.mockResolvedValue([{ 
      id: 1, 
      email: 'test@example.com', 
      username: 'testuser',
      password: '$argon2id$v=19$m=65536,t=3,p=4$...' // Mock hashed password
    }]);

    const response = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toEqual({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    });
    expect(data.token).toBeDefined();
  });
});