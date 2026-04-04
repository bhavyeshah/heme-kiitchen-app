'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Order, OrderStatus, DeliveryType, PaymentStatus, OrderSource } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import AdminHeader from '@/components/AdminHeader';
import AdminNav from '@/components/AdminNav';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  declined: 'bg-red-100 text-red-800',
};

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    payment_status: '',
    delivery_type: '',
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.payment_status) params.set('payment_status', filters.payment_status);
      if (filters.delivery_type) params.set('delivery_type', filters.delivery_type);
      const qs = params.toString();
      const data = await apiFetch<Order[]>(`/api/orders${qs ? '?' + qs : ''}`);
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filters]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <AdminHeader title="Orders" />
      <AdminNav />

      <main className="max-w-5xl mx-auto w-full px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="">All Statuses</option>
              {['pending','confirmed','preparing','dispatched','completed','cancelled','declined'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="">All Sources</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={filters.delivery_type}
              onChange={(e) => setFilters({ ...filters, delivery_type: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="">All Delivery Types</option>
              <option value="pickup">Pickup</option>
              <option value="home_delivery">Home Delivery</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <p className="text-stone-400 text-sm text-center py-8">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">No orders found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-stone-400 truncate max-w-[120px]">{order.id.slice(0, 8)}…</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                      {order.special_instructions && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          Note
                        </span>
                      )}
                      {order.payment_status === 'unpaid' && order.payment_method === 'UPI' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Unpaid
                        </span>
                      )}
                    </div>
                    <p className="text-stone-900 font-medium text-sm mt-1">{order.customer_name}</p>
                    <p className="text-stone-500 text-xs">
                      {order.delivery_type === 'pickup' ? 'Pickup' : 'Home Delivery'} ·{' '}
                      {order.payment_method} · {order.source}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-stone-900">₹{order.total_price.toFixed(2)}</p>
                    <p className="text-stone-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminOrdersContent />
    </AdminGuard>
  );
}
