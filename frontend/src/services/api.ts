import { Post, Comment, AuthResponse } from '@/types';

// Base URL for API requests
const API_BASE_URL = '/api';

/**
 * Fetch the hottest posts from the API
 * @returns Array of posts sorted by hotness
 */
export async function fetchHotPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE_URL}/posts/hot`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

/**
 * Fetch a single post by ID
 * @param id - Post ID
 * @returns Post object
 */
export async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

/**
 * Fetch comments for a specific post
 * @param postId - Post ID
 * @returns Array of comments
 */
export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

/**
 * Authenticate a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns Authentication response with user info and token
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

/**
 * Register a new user
 * @param email - User's email
 * @param username - Desired username
 * @param password - User's password
 * @returns Authentication response with user info and token
 */
export async function register(email: string, username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password }),
  });
  
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

/**
 * Submit a new post
 * @param title - Post title
 * @param url - Post URL (optional)
 * @param text - Post text content (optional)
 * @param token - JWT token for authentication
 * @returns The newly created post
 */
export async function submitPost(title: string, url?: string, text?: string, token?: string): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, url, text }),
  });
  
  if (!res.ok) throw new Error('Failed to submit post');
  return res.json();
}

/**
 * Vote on a post
 * @param postId - Post ID to vote on
 * @param voteType - 1 for upvote, -1 for downvote
 * @param token - JWT token for authentication
 * @returns The updated post with new vote counts
 */
export async function votePost(postId: number, voteType: number, token?: string): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/votes/post/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ voteType }),
  });
  
  if (!res.ok) throw new Error('Failed to vote on post');
  return res.json();
}

/**
 * Submit a comment on a post
 * @param postId - Post ID to comment on
 * @param text - Comment text
 * @param parentId - Parent comment ID for nested replies (optional)
 * @param token - JWT token for authentication
 * @returns The newly created comment
 */
export async function submitComment(postId: number, text: string, parentId?: number, token?: string): Promise<Comment> {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ text, parentId }),
  });
  
  if (!res.ok) throw new Error('Failed to submit comment');
  return res.json();
}