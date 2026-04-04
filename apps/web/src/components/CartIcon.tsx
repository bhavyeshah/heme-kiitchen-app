'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart, cartTotal } from '@/lib/cart';

export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = getCart();
      setCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
