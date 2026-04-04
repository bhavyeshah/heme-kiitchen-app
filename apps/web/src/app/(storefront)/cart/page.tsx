'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCart, removeFromCart, updateQuantity, cartTotal, CartItem } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const notify = () => window.dispatchEvent(new Event('cart-updated'));

  const handleRemove = (productId: string) => {
    const updated = removeFromCart(productId);
    setCart(updated);
    notify();
  };

  const handleQty = (productId: string, qty: number) => {
    const updated = updateQuantity(productId, qty);
    setCart(updated);
    notify();
  };

  if (!mounted) return null;

  const total = cartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 text-lg mb-6">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Your Cart</h1>

      <div className="flex flex-col gap-4 mb-8">
        {cart.map((item) => (
          <div
            key={item.product_id}
            className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 flex gap-4 items-start"
          >
            {item.image_path && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                <Image
                  src={item.image_path}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 text-sm truncate">{item.name}</p>
              <p className="text-stone-500 text-sm">₹{item.unit_price.toFixed(2)} each</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQty(item.product_id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold min-w-[44px] min-h-[44px]"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium text-stone-900">{item.quantity}</span>
                <button
                  onClick={() => handleQty(item.product_id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold min-w-[44px] min-h-[44px]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-bold text-stone-900">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => handleRemove(item.product_id)}
                className="text-red-500 hover:text-red-700 text-xs transition-colors min-h-[44px] flex items-center"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-stone-600 font-medium">Order Total</span>
          <span className="text-xl font-bold text-stone-900">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 rounded-xl text-center text-lg transition-colors shadow-md"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
