import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../index';
import { createDb } from '../db/client';

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

// Mock hashed password for login test
const mockHashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$...';

// Mock environment
const mockEnv = {
  DB: {}, // Mock DB object
  JWT_SECRET: 'test-secret-key'
};

vi.mock('../db/client', () => ({
  createDb: vi.fn(() => mockDb),
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
    // Reset mock calls
    vi.clearAllMocks();
    
    // Mock the select query to return a user
    mockDb.select.mockReturnValueOnce(mockDb);
    mockDb.from.mockReturnValueOnce(mockDb);
    mockDb.where.mockReturnValueOnce(mockDb);
    mockDb.limit.mockReturnValueOnce(mockDb);
    mockDb.returning.mockResolvedValueOnce([{ 
      id: 1, 
      email: 'test@example.com', 
      username: 'testuser',
      password: mockHashedPassword // Mock hashed password
    }]);

    // Mock verifyPassword to return true
    vi.mock('../auth/jwt', async () => {
      const actual = await vi.importActual('../auth/jwt');
      return {
        ...actual,
        verifyPassword: vi.fn().mockResolvedValue(true)
      };
    });

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