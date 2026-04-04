'use client';

import { useEffect, useRef, useState } from 'react';

const FSSAI_LICENCE_NUMBER = process.env.NEXT_PUBLIC_FSSAI_LICENCE_NUMBER || '(Add FSSAI licence number)';

export default function AboutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument('/fssai-certificate.pdf').promise;
        const page = await pdf.getPage(1);

        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        setPdfLoading(false);
      } catch {
        if (!cancelled) {
          setPdfError(true);
          setPdfLoading(false);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">About Hémé Kiitchen</h1>

      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">Our Story</h2>
        <div className="prose prose-stone text-stone-600 leading-relaxed space-y-4">
          <p>
            Hémé Kiitchen was born out of a simple belief: that Jain-friendly food shouldn&apos;t mean
            compromising on flavour. Our handcrafted dips are made in small batches using the finest
            all-natural ingredients — no onion, no garlic, no preservatives.
          </p>
          <p>
            Every jar is a labour of love, crafted to bring bold, fresh flavours to your table.
            Whether you&apos;re entertaining guests or elevating your everyday meal, Hémé Kiitchen dips
            are the perfect companion.
          </p>
        </div>
      </div>

      {/* FSSAI */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">Food Safety (FSSAI)</h2>
        <p className="text-stone-600 mb-2">
          Hémé Kiitchen is a registered food business under the Food Safety and Standards Authority
          of India (FSSAI).
        </p>
        <p className="text-stone-600">
          <span className="font-medium">FSSAI Licence No.:</span>{' '}
          <span className="font-mono text-stone-800">{FSSAI_LICENCE_NUMBER}</span>
        </p>
      </div>

      {/* FSSAI Certificate via PDF.js */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">FSSAI Certificate</h2>
        {pdfLoading && !pdfError && (
          <div className="text-stone-400 text-sm py-8 text-center">Loading certificate...</div>
        )}
        {pdfError && (
          <div className="text-stone-400 text-sm py-8 text-center">
            Certificate not yet uploaded. Please check back later.
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`w-full rounded-lg ${pdfLoading || pdfError ? 'hidden' : 'block'}`}
        />
      </div>
    </div>
  );
}
