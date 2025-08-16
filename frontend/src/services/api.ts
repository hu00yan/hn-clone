// Use environment variable for API base URL, with fallback to localhost for development
// For static export, we always use the full API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export async function fetchHotPosts() {
  // For server-side rendering or static generation
  const res = await fetch(`${API_BASE_URL}/posts/hot`, {
    // Add cache settings for static export
    next: { 
      revalidate: 60 // Revalidate at most every 60 seconds
    }
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPost(id: number) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    next: { 
      revalidate: 60 // Revalidate at most every 60 seconds
    }
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function fetchComments(postId: number) {
  const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    next: { 
      revalidate: 60 // Revalidate at most every 60 seconds
    }
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function login(email: string, password: string) {
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

export async function register(email: string, username: string, password: string) {
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

export async function submitPost(title: string, url?: string, text?: string, token?: string) {
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

export async function votePost(postId: number, voteType: number, token?: string) {
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

export async function submitComment(postId: number, text: string, parentId?: number, token?: string) {
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