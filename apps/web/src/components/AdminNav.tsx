'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const NAV_LINKS = [
  { href: '/admin', label: 'Orders', exact: true },
  { href: '/admin/create-order', label: 'New Order', exact: false },
  { href: '/admin/products', label: 'Products', exact: false },
  { href: '/admin/branding', label: 'Branding', exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  return (
    <nav className="bg-stone-800 border-b border-stone-700">
      <div className="max-w-5xl mx-auto px-4 flex items-center overflow-x-auto gap-1 py-1">
        {NAV_LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
                active
                  ? 'bg-stone-700 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="ml-auto px-3 py-2 rounded text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-700 whitespace-nowrap transition-colors min-h-[44px]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
