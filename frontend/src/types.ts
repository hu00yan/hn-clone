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
  author: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  score?: number;
}

export interface Comment {
  id: number;
  postId: number;
  text: string;
  createdAt: Date;
  author: string;
  parentId?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}