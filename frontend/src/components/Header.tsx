'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="bg-orange-500 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              Hacker News
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="hover:underline">
                new
              </Link>
              <Link href="/" className="hover:underline">
                past
              </Link>
              <Link href="/" className="hover:underline">
                comments
              </Link>
              <Link href="/" className="hover:underline">
                ask
              </Link>
              <Link href="/" className="hover:underline">
                show
              </Link>
              <Link href="/" className="hover:underline">
                jobs
              </Link>
              <Link href="/" className="hover:underline">
                submit
              </Link>
            </nav>
          </div>
          <div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/submit" className="hover:underline">
                  submit
                </Link>
                <button onClick={handleLogout} className="hover:underline">
                  logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="hover:underline">
                  login
                </Link>
                <Link href="/register" className="hover:underline">
                  register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}