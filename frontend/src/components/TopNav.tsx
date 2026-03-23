'use client';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TopNav() {
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

  if (!mounted) return <div className="w-32" />;

  return (
    <>
      <Link href="/" className="text-zinc-600 hover:text-zinc-900 text-sm font-medium">Browse</Link>
      {isAuthenticated ? (
        <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-zinc-200">
          <Link href="/profile" className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
            {user?.name || 'Profile'}
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-zinc-200">
          <Link href="/auth/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Login
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm py-1.5 px-3">
            Join
          </Link>
        </div>
      )}
    </>
  );
}
