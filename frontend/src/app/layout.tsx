import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Hacker News Clone',
  description: 'A Hacker News clone built with Next.js and Hono.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}