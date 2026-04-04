'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFormData } from '@/lib/api';
import { Product } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

function NewProductContent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Enter a valid positive price';
    if (!imageFile) errs.image = 'Image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('price', price);
    fd.append('image', imageFile!);

    setSaving(true);
    try {
      const product = await apiFormData<Product>('/api/products', 'POST', fd);
      router.push(`/admin/products/${product.id}`);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to create product' });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title="Add Product" />
      <AdminNav />

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errors.general}</div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-4">
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Product Photo *</label>
              <div
                className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" sizes="160px" />
                  </div>
                ) : (
                  <div className="text-stone-400">
                    <p className="text-sm mb-1">Tap to upload photo</p>
                    <p className="text-xs">JPEG, PNG, WebP — any size</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Roasted Red Pepper Dip"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Describe the product..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price (₹) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors shadow-md min-h-[44px]">
            {saving ? 'Saving...' : 'Add Product'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function NewProductPage() {
  return <AdminGuard><NewProductContent /></AdminGuard>;
}
