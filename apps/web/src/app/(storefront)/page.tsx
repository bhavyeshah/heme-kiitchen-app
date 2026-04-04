import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { SiteContent } from '@/types';

async function getSiteContent(): Promise<SiteContent | null> {
  try {
    return await apiFetch<SiteContent>('/api/site-content');
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const content = await getSiteContent();

  const tagline = content?.tagline ?? 'Premium Jain-friendly dips, crafted with care';
  const description =
    content?.description ??
    'Handcrafted in small batches with all-natural ingredients. No onion, no garlic — just bold, fresh flavours.';
  const highlights = content?.highlights ?? [
    '100% Jain-friendly — no onion, no garlic',
    'Handcrafted in small batches',
    'All-natural ingredients, no preservatives',
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-amber-50 px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 leading-tight mb-6">
            {tagline}
          </h1>
          <p className="text-stone-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          <Link
            href="/products"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-md"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="px-4 py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto">
            <ul className="grid sm:grid-cols-2 gap-4">
              {highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-stone-700 text-sm sm:text-base">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
