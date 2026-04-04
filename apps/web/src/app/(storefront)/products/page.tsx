import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';
import AddToCartButton from '@/components/AddToCartButton';

async function getProducts(): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/api/products');
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Our Menu</h1>
      <p className="text-stone-500 mb-8">
        All products are 100% Jain-friendly — no onion, no garlic.
      </p>

      {products.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg">Menu coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-square bg-stone-100">
                {product.image_path && (
                  <Image
                    src={product.image_path}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="font-semibold text-stone-900 text-base">{product.name}</h2>
                <p className="text-stone-500 text-sm leading-relaxed flex-1">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-stone-900 text-lg">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
                <AddToCartButton product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
