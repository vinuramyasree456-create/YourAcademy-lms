'use client';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // We wait until mounted to prevent hydration mismatch for persisted states
  const AuthNav = mounted ? (
    <>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <Link href="/profile" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            {user?.name || 'Profile'}
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Login
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm">
            Join
          </Link>
        </div>
      )}
    </>
  ) : null;

  // We inject the AuthNav into the header using a portal or simply handling it inline.
  // Actually, since AuthGuard wraps children, we can't easily inject into layout's header.
  // Wait, I will just render it inside layout directly by moving the client auth logic to a separate component.
  // Let's refactor this layout approach. This file will just be a Client component wrapper if needed, or I'll just render children.

  return <>{children}</>;
}
