import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';

export default function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Hémé Kiitchen"
            width={120}
            height={40}
            className="object-contain h-10 w-auto"
          />
          <span className="font-semibold text-stone-800 text-lg hidden sm:inline">
            Hémé Kiitchen
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors"
          >
            Menu
          </Link>
          <Link
            href="/about"
            className="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors"
          >
            About
          </Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}
