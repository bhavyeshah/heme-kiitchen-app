'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { apiFetch, setToken } from '@/lib/api';
import { Suspense } from 'react';
import AdminHeader from '@/components/AdminHeader';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/admin';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setToken(data.access_token);
      router.push(from);
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <AdminHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-stone-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="Hémé Kiitchen"
              width={120}
              height={48}
              className="object-contain h-12 w-auto brightness-0 invert"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-white font-bold text-xl">Hémé Kiitchen</span>';
                }
              }}
            />
          </div>

          <h1 className="text-white text-xl font-bold text-center mb-6">Admin Login</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-stone-400 text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full bg-stone-700 text-white border border-stone-600 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-stone-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors mt-2 min-h-[44px]"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
