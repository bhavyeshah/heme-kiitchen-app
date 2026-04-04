'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Order, OrderStatus, Product } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

const TERMINAL: OrderStatus[] = ['completed', 'cancelled', 'declined'];
const CAN_CANCEL: OrderStatus[] = ['confirmed', 'preparing', 'dispatched'];

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Order>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch<Order>(`/api/orders/${id}`),
      apiFetch<Product[]>('/api/products?include_inactive=true'),
    ]).then(([o, p]) => {
      setOrder(o);
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const patch = async (body: object) => {
    setSaving(true);
    setError('');
    try {
      const updated = await apiFetch<Order>(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setOrder(updated);
      setNewStatus('');
      setEditMode(false);
      setEditData({});
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this order? (This is a soft delete — order will be hidden from lists)')) return;
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <AdminHeader title="Order Detail" />
        <AdminNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <AdminHeader title="Order Not Found" />
        <AdminNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-400 text-sm">Order not found. <Link href="/admin" className="underline">Back to orders</Link></p>
        </div>
      </div>
    );
  }

  const isTerminal = TERMINAL.includes(order.status);
  const canCancel = CAN_CANCEL.includes(order.status);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title={`Order ${order.id.slice(0, 8)}…`} />
      <AdminNav />

      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Chef Note */}
        {order.special_instructions && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="font-semibold text-orange-900 mb-1">Chef Note</p>
            <p className="text-orange-800 text-sm">{order.special_instructions}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-900">Order Info</h2>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              TERMINAL.includes(order.status) ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-stone-500">Order ID</dt>
            <dd className="font-mono text-xs text-stone-700 break-all">{order.id}</dd>
            <dt className="text-stone-500">Customer</dt>
            <dd className="text-stone-900 font-medium">{order.customer_name}</dd>
            <dt className="text-stone-500">Phone</dt>
            <dd className="text-stone-900">{order.phone}</dd>
            <dt className="text-stone-500">Source</dt>
            <dd className="text-stone-900 capitalize">{order.source}</dd>
            <dt className="text-stone-500">Delivery</dt>
            <dd className="text-stone-900">{order.delivery_type === 'pickup' ? 'Pickup' : 'Home Delivery'}</dd>
            {order.delivery_address && (
              <>
                <dt className="text-stone-500">Address</dt>
                <dd className="text-stone-900">{order.delivery_address}</dd>
              </>
            )}
            <dt className="text-stone-500">Payment</dt>
            <dd className="text-stone-900">{order.payment_method}</dd>
            <dt className="text-stone-500">Payment Status</dt>
            <dd className={`font-medium ${order.payment_status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
              {order.payment_status}
            </dd>
            <dt className="text-stone-500">Delivery Charges</dt>
            <dd className="text-stone-900">{order.delivery_charges_applicable ? 'Yes (paid to delivery partner)' : 'None'}</dd>
            <dt className="text-stone-500">Created</dt>
            <dd className="text-stone-900 text-xs">{new Date(order.created_at).toLocaleString('en-IN')}</dd>
          </dl>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <h2 className="font-semibold text-stone-900 mb-3">Items</h2>
          <div className="flex flex-col gap-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-stone-700">{item.name} × {item.quantity}</span>
                <span className="font-medium text-stone-900">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-stone-100 pt-2 mt-1 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{order.total_price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isTerminal && !order.deleted && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Actions</h2>

            {/* Pending: Accept / Decline */}
            {order.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => patch({ status: 'confirmed' })}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => patch({ status: 'declined' })}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}

            {/* Status update for confirmed+ */}
            {order.status !== 'pending' && !isTerminal && (
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                >
                  <option value="">Update Status…</option>
                  {['preparing','dispatched','completed'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={() => newStatus && patch({ status: newStatus })}
                  disabled={!newStatus || saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  Update
                </button>
              </div>
            )}

            {/* Mark as Paid */}
            {order.payment_status !== 'paid' && (
              <button
                onClick={() => patch({ payment_status: 'paid' })}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
              >
                Mark as Paid
              </button>
            )}

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={() => patch({ status: 'cancelled' })}
                disabled={saving}
                className="w-full border border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}

            {/* Edit */}
            {!editMode && (
              <button
                onClick={() => { setEditMode(true); setEditData({ ...order }); }}
                className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
              >
                Edit Order
              </button>
            )}
          </div>
        )}

        {/* Edit Form */}
        {editMode && !isTerminal && !order.deleted && (
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-stone-900">Edit Order</h2>

            <div>
              <label className="block text-xs text-stone-500 mb-1">Customer Name</label>
              <input
                type="text"
                value={editData.customer_name ?? ''}
                onChange={(e) => setEditData({ ...editData, customer_name: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">Phone (10 digits)</label>
              <input
                type="tel"
                value={(editData.phone ?? '').replace('+91', '')}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-500 mb-1">Special Instructions</label>
              <textarea
                value={editData.special_instructions ?? ''}
                onChange={(e) => setEditData({ ...editData, special_instructions: e.target.value })}
                rows={2}
                maxLength={500}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-stone-400 text-right">{(editData.special_instructions ?? '').length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => { setEditMode(false); setEditData({}); }}
                className="border border-stone-300 text-stone-700 font-semibold py-3 rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => patch({
                  customer_name: editData.customer_name,
                  phone: editData.phone,
                  special_instructions: editData.special_instructions || null,
                })}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl min-h-[44px] disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Soft Delete */}
        {!order.deleted && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="text-red-500 hover:text-red-700 text-sm text-center py-2 disabled:opacity-50"
          >
            Delete Order (soft delete)
          </button>
        )}

        <Link href="/admin" className="text-stone-500 hover:text-stone-700 text-sm text-center py-2">
          ← Back to Orders
        </Link>
      </main>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <AdminGuard>
      <OrderDetailContent />
    </AdminGuard>
  );
}
