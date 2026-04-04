import { SiteContent } from '../types';
import { readJson, writeJson } from './JsonRepository';

const FILE = 'site-content.json';

const DEFAULT: SiteContent = {
  tagline: 'Premium Jain-friendly dips, crafted with care',
  description:
    'Hémé Kiitchen brings you a range of handcrafted dips made with the finest Jain-friendly ingredients. No onion, no garlic — just bold, fresh flavours to elevate every meal.',
  highlights: [
    '100% Jain-friendly — no onion, no garlic',
    'Handcrafted in small batches',
    'All-natural ingredients, no preservatives',
  ],
  instagram_handle: null,
};

export const SiteContentRepository = {
  get(): SiteContent {
    try {
      const data = readJson<SiteContent>(FILE);
      if (data && typeof (data as any).tagline === 'string') {
        return data;
      }
      return DEFAULT;
    } catch {
      return DEFAULT;
    }
  },

  update(partial: Partial<SiteContent>): SiteContent {
    const current = this.get();
    const updated: SiteContent = { ...current, ...partial };
    writeJson(FILE, updated);
    return updated;
  },
};
