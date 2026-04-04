'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Product, Order, DeliveryType, PaymentMethod } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

interface OrderItem {
  product_id: string;
  quantity: number;
  name: string;
  unit_price: number;
}

function CreateOrderContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Product[]>('/api/products?include_inactive=true')
      .then(setProducts)
      .catch(() => {});
  }, []);

  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product_id: product.id, name: product.name, unit_price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } else {
      setItems((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const handleDeliveryTypeChange = (type: DeliveryType) => {
    setDeliveryType(type);
    if (type === 'home_delivery') setPaymentMethod('UPI');
    else setPaymentMethod('COD');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) { setError('Add at least one item'); return; }
    if (!customerName.trim()) { setError('Customer name is required'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    if (deliveryType === 'home_delivery' && !deliveryAddress.trim()) { setError('Delivery address is required'); return; }

    setSaving(true);
    try {
      const order = await apiFetch<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          customer_name: customerName.trim(),
          phone,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'home_delivery' ? deliveryAddress.trim() : null,
          payment_method: paymentMethod,
          special_instructions: specialInstructions.trim() || null,
        }),
      });
      router.push(`/admin/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title="Create Offline Order" />
      <AdminNav />

      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
          )}

          {/* Product Picker */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <h2 className="font-semibold text-stone-900 mb-3">Items</h2>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {products.filter(p => p.status === 'active').map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p)}
                  className="flex justify-between items-center text-left p-3 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors min-h-[44px]"
                >
                  <span className="text-sm font-medium text-stone-800">{p.name}</span>
                  <span className="text-sm text-stone-500">₹{p.price.toFixed(2)} + </span>
                </button>
              ))}
            </div>

            {/* Selected Items */}
            {items.length > 0 && (
              <div className="border-t border-stone-100 pt-3 flex flex-col gap-2">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between">
                    <span className="text-sm text-stone-700 flex-1 truncate">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 min-w-[44px] min-h-[44px]">−</button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 min-w-[44px] min-h-[44px]">+</button>
                      <span className="text-sm font-medium text-stone-900 w-20 text-right">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-sm mt-1">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Customer Details</h2>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Customer Name *</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Full name" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Customer WhatsApp Number *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile" inputMode="numeric" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]" />
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Delivery</h2>
            <div className="grid grid-cols-2 gap-2">
              {(['pickup', 'home_delivery'] as DeliveryType[]).map(t => (
                <button key={t} type="button" onClick={() => handleDeliveryTypeChange(t)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium min-h-[44px] transition-colors ${deliveryType === t ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-700'}`}>
                  {t === 'pickup' ? 'Pickup' : 'Home Delivery'}
                </button>
              ))}
            </div>
            {deliveryType === 'home_delivery' && (
              <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                rows={2} placeholder="Delivery address"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Payment</h2>
            <div className="grid grid-cols-2 gap-2">
              {(deliveryType === 'home_delivery' ? ['UPI'] : ['COD', 'UPI']).map(m => (
                <button key={m} type="button" onClick={() => setPaymentMethod(m as PaymentMethod)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium min-h-[44px] transition-colors ${paymentMethod === m ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-700'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <h2 className="font-semibold text-stone-900 mb-2">Special Instructions <span className="text-stone-400 font-normal text-sm">(optional)</span></h2>
            <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
              rows={2} maxLength={500} placeholder="Any chef notes..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <p className="text-xs text-stone-400 text-right mt-1">{specialInstructions.length}/500</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-md min-h-[44px]">
            {saving ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CreateOrderPage() {
  return <AdminGuard><CreateOrderContent /></AdminGuard>;
}
