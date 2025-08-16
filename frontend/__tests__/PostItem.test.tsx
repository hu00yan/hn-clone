import { render, screen } from '@testing-library/react';
import PostItem from '@/components/PostItem';
import { Post } from '@/types';

describe('PostItem', () => {
  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    url: 'https://example.com',
    author: 'testuser',
    createdAt: new Date(),
    upvotes: 10,
    downvotes: 2,
  };

  it('renders post title and author', () => {
    render(<PostItem post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders post score', () => {
    render(<PostItem post={mockPost} />);
    
    // Score is upvotes - downvotes = 10 - 2 = 8
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders URL hostname', () => {
    render(<PostItem post={mockPost} />);
    
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });
});