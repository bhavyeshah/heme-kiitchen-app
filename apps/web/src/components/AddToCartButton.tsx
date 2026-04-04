'use client';

import { addToCart } from '@/lib/cart';
import { Product } from '@/types';

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      unit_price: product.price,
      image_path: product.image_path,
    });
    window.dispatchEvent(new Event('cart-updated'));
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm min-h-[44px]"
    >
      Add to Cart
    </button>
  );
}
