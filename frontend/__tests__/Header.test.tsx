import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Header', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Hacker News')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('past')).toBeInTheDocument();
    expect(screen.getByText('comments')).toBeInTheDocument();
    expect(screen.getByText('ask')).toBeInTheDocument();
    expect(screen.getByText('show')).toBeInTheDocument();
    expect(screen.getByText('jobs')).toBeInTheDocument();
  });

  it('shows login/register links when not logged in', () => {
    render(<Header />);
    
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('register')).toBeInTheDocument();
  });

  it('shows submit/logout links when logged in', () => {
    // Mock localStorage to simulate logged in user
    localStorage.setItem('token', 'fake-token');
    
    render(<Header />);
    
    expect(screen.getByText('submit')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
  });
});