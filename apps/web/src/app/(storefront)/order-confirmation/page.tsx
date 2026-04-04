'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

const BUSINESS_WA = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER || '';

function OrderConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get('id') || 'N/A';
  const deliveryType = params.get('delivery') || 'pickup';
  const isHomeDelivery = deliveryType === 'home_delivery';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-green-500 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-stone-900 mb-2">Order Placed!</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 inline-block">
        <p className="text-stone-600 text-sm mb-1">Your Order ID</p>
        <p className="font-mono font-bold text-stone-900 text-lg break-all">{orderId}</p>
      </div>

      {isHomeDelivery ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
          <h2 className="font-semibold text-blue-900 mb-3">What happens next?</h2>
          <p className="text-blue-800 text-sm leading-relaxed">
            To complete your payment and confirm your order, contact us on WhatsApp at{' '}
            <strong>{BUSINESS_WA || '[business WhatsApp number]'}</strong> with your Order ID.
            You can also request any changes at this stage — payment will only be collected once your order is finalised.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
          <h2 className="font-semibold text-green-900 mb-3">What happens next?</h2>
          <p className="text-green-800 text-sm leading-relaxed mb-3">
            We will confirm your order via WhatsApp.
          </p>
          <p className="text-green-700 text-sm">
            To make any changes to your order, please contact us on WhatsApp with your Order ID.
          </p>
        </div>
      )}

      <Link
        href="/products"
        className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
