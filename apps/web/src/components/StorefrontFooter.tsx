import { SiteContent } from '@/types';

interface Props {
  siteContent?: SiteContent | null;
}

export default function StorefrontFooter({ siteContent }: Props) {
  const instagramHandle = siteContent?.instagram_handle;

  return (
    <footer className="bg-stone-900 text-stone-400 py-8 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-medium text-stone-300">Hémé Kiitchen</p>
          <p className="mt-1">FSSAI Lic. No.: <span className="text-stone-300">— (Add licence number)</span></p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-1">
          {instagramHandle && (
            <a
              href={`https://www.instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              @{instagramHandle}
            </a>
          )}
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Hémé Kiitchen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
