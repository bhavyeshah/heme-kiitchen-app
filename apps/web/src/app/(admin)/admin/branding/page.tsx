'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { SiteContent } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

function BrandingContent() {
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<SiteContent>('/api/site-content').then((d) => {
      setTagline(d.tagline);
      setDescription(d.description);
      setHighlights(d.highlights);
      setInstagramHandle(d.instagram_handle || '');
    }).catch(() => {});
  }, []);

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    if (newHighlight.trim().length > 80) {
      setErrors({ ...errors, newHighlight: 'Max 80 characters' });
      return;
    }
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight('');
    setErrors({ ...errors, newHighlight: '' });
  };

  const updateHighlight = (idx: number, value: string) => {
    setHighlights(highlights.map((h, i) => (i === idx ? value : h)));
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!tagline.trim()) errs.tagline = 'Tagline is required';
    else if (tagline.length > 150) errs.tagline = 'Max 150 characters';
    if (description.length > 500) errs.description = 'Max 500 characters';
    highlights.forEach((h, i) => {
      if (h.length > 80) errs[`highlight_${i}`] = 'Max 80 characters';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/api/site-content', {
        method: 'PATCH',
        body: JSON.stringify({
          tagline: tagline.trim(),
          description,
          highlights,
          instagram_handle: instagramHandle.trim() || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title="Branding" />
      <AdminNav />

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errors.general}</div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">Saved successfully!</div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-stone-700">Tagline *</label>
                <span className="text-xs text-stone-400">{tagline.length}/150</span>
              </div>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} maxLength={150}
                placeholder="Your brand tagline..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
              {errors.tagline && <p className="text-red-500 text-xs mt-1">{errors.tagline}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-stone-700">Brand Description</label>
                <span className="text-xs text-stone-400">{description.length}/500</span>
              </div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={4}
                placeholder="Describe your brand..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Highlights</label>
              <div className="flex flex-col gap-2 mb-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input type="text" value={h} onChange={e => updateHighlight(i, e.target.value)} maxLength={80}
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
                    <button type="button" onClick={() => removeHighlight(i)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
                    {errors[`highlight_${i}`] && <p className="text-red-500 text-xs">{errors[`highlight_${i}`]}</p>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newHighlight} onChange={e => setNewHighlight(e.target.value)} maxLength={80}
                  placeholder="Add highlight..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
                <button type="button" onClick={addHighlight}
                  className="bg-stone-800 text-white px-4 rounded-lg text-sm font-medium min-h-[44px]">Add</button>
              </div>
              {errors.newHighlight && <p className="text-red-500 text-xs mt-1">{errors.newHighlight}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Instagram Handle <span className="text-stone-400 font-normal">(optional, without @)</span></label>
              <input type="text" value={instagramHandle} onChange={e => setInstagramHandle(e.target.value.replace('@', ''))}
                placeholder="yourbrand"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors shadow-md min-h-[44px]">
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function BrandingPage() {
  return <AdminGuard><BrandingContent /></AdminGuard>;
}
