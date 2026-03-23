import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import TopNav from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YourAcademy - Minimalist Learning',
  description: 'A focused, content-first learning management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen">
        <AuthGuard>
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl tracking-tight text-zinc-900">
                YourAcademy.
              </Link>
              <nav className="flex items-center space-x-4">
                <TopNav />
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-zinc-50 border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} YourAcademy. All rights reserved.</p>
          </footer>
        </AuthGuard>
      </body>
    </html>
  );
}
