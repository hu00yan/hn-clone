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
