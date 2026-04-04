'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Product[]>('/api/products?include_inactive=true')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title="Products" />
      <AdminNav />

      <main className="max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-stone-900">All Products</h2>
          <Link href="/admin/products/new"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] flex items-center">
            + Add Product
          </Link>
        </div>

        {loading ? (
          <p className="text-stone-400 text-sm text-center py-8">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}`}
                className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow block">
                <div className="relative w-full aspect-square bg-stone-100">
                  {product.image_path && (
                    <Image src={product.image_path} alt={product.name} fill className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  )}
                  {product.status === 'inactive' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">INACTIVE</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-stone-900 text-sm">{product.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs mt-1 truncate">{product.description}</p>
                  <p className="font-bold text-stone-900 text-sm mt-2">₹{product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminProductsPage() {
  return <AdminGuard><AdminProductsContent /></AdminGuard>;
}
