'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiFetch<{ isAdmin: boolean }>('/api/auth/me')
      .then((data) => {
        if (!data.isAdmin) {
          router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
      });
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-900">
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
