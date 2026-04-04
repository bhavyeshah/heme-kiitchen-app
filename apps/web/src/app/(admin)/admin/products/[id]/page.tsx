'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch, apiFormData } from '@/lib/api';
import { Product } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

function EditProductContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<Product>(`/api/products/${id}`)
      .then((p) => {
        setProduct(p);
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
      })
      .catch(() => {});
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Enter a valid positive price';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('price', price);
    if (imageFile) fd.append('image', imageFile);

    setSaving(true);
    setSaved(false);
    try {
      const updated = await apiFormData<Product>(`/api/products/${id}`, 'PATCH', fd);
      setProduct(updated);
      setImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      const updated = await apiFormData<Product>(`/api/products/${id}`, 'PATCH', fd);
      setProduct(updated);
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <AdminHeader title="Edit Product" />
        <AdminNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const currentImage = preview || product.image_path;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title={`Edit: ${product.name}`} />
      <AdminNav />

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errors.general}</div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">Saved!</div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-4">
            {/* Current + New Image */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Product Photo</label>
              {currentImage && (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden mb-3 bg-stone-100">
                  <Image src={currentImage} alt={name} fill className="object-cover" sizes="160px" />
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm px-4 py-2 rounded-lg transition-colors min-h-[44px]">
                {imageFile ? 'Change photo' : 'Replace photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {imageFile && <p className="text-xs text-amber-700 mt-1">New photo selected: {imageFile.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price (₹) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors shadow-md min-h-[44px]">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Deactivate / Reactivate */}
          <button type="button" onClick={handleToggleStatus} disabled={saving}
            className={`w-full border font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 min-h-[44px] ${
              product.status === 'active'
                ? 'border-red-300 text-red-600 hover:bg-red-50'
                : 'border-green-300 text-green-700 hover:bg-green-50'
            }`}>
            {product.status === 'active' ? 'Deactivate Product' : 'Reactivate Product'}
          </button>

          <Link href="/admin/products" className="text-stone-500 hover:text-stone-700 text-sm text-center py-2 block">
            ← Back to Products
          </Link>
        </form>
      </main>
    </div>
  );
}

export default function EditProductPage() {
  return <AdminGuard><EditProductContent /></AdminGuard>;
}
