import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import MobileBottomToolbar from '@/components/MobileBottomToolbar';
import { apiFetch } from '@/lib/api';
import { SiteContent } from '@/types';

async function getSiteContent(): Promise<SiteContent | null> {
  try {
    return await apiFetch<SiteContent>('/api/site-content');
  } catch {
    return null;
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteContent = await getSiteContent();

  return (
    <div className="flex flex-col min-h-screen">
      <StorefrontHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <StorefrontFooter siteContent={siteContent} />
      <MobileBottomToolbar />
    </div>
  );
}
