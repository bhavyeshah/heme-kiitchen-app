import Link from 'next/link';
import Image from 'next/image';

interface Props {
  title?: string;
}

export default function AdminHeader({ title }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Hémé Kiitchen"
            width={80}
            height={28}
            className="object-contain h-7 w-auto brightness-0 invert"
          />
          <span className="text-sm font-medium text-stone-300 hidden sm:inline">Admin</span>
        </Link>
        {title && (
          <span className="text-stone-200 font-semibold truncate text-sm sm:text-base">{title}</span>
        )}
      </div>
    </header>
  );
}
