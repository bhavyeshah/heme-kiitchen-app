'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, cartTotal, clearCart, CartItem } from '@/lib/cart';
import { apiFetch } from '@/lib/api';
import { Order, DeliveryType, PaymentMethod } from '@/types';

const BUSINESS_WA = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER || '';
const PICKUP_ADDRESS = 'Contact us on WhatsApp to confirm the pickup address';

interface FormErrors {
  delivery_type?: string;
  delivery_address?: string;
  payment_method?: string;
  customer_name?: string;
  phone?: string;
  special_instructions?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [deliveryType, setDeliveryType] = useState<DeliveryType | ''>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const c = getCart();
    if (c.length === 0) {
      router.replace('/products');
      return;
    }
    setCart(c);
    setMounted(true);
  }, [router]);

  const total = cartTotal(cart);
  const deliveryChargeApplies = deliveryType === 'home_delivery' && total <= 1500;

  // When switching to home_delivery, auto-select UPI
  const handleDeliveryTypeChange = (type: DeliveryType) => {
    setDeliveryType(type);
    if (type === 'home_delivery') {
      setPaymentMethod('UPI');
    } else {
      setPaymentMethod('');
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!deliveryType) errs.delivery_type = 'Please select a delivery type';
    if (deliveryType === 'home_delivery' && !deliveryAddress.trim())
      errs.delivery_address = 'Delivery address is required';
    if (!paymentMethod) errs.payment_method = 'Please select a payment method';
    if (!customerName.trim()) errs.customer_name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phone))
      errs.phone = 'Enter a valid 10-digit Indian mobile number (starting with 6-9)';
    if (specialInstructions.length > 500)
      errs.special_instructions = 'Special instructions must be 500 characters or fewer';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await apiFetch<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          customer_name: customerName.trim(),
          phone,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'home_delivery' ? deliveryAddress.trim() : null,
          payment_method: paymentMethod,
          special_instructions: specialInstructions.trim() || null,
        }),
      });
      clearCart();
      window.dispatchEvent(new Event('cart-updated'));
      router.push(`/order-confirmation?id=${order.id}&delivery=${deliveryType}`);
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-6">
        <h2 className="font-semibold text-stone-900 mb-3">Order Summary</h2>
        <div className="flex flex-col gap-2">
          {cart.map((item) => (
            <div key={item.product_id} className="flex justify-between text-sm">
              <span className="text-stone-600">{item.name} × {item.quantity}</span>
              <span className="font-medium text-stone-900">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-stone-100 pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          {deliveryChargeApplies && (
            <p className="text-amber-700 text-xs bg-amber-50 px-3 py-2 rounded-lg mt-1">
              Delivery charges apply — payable directly to the delivery partner on arrival
            </p>
          )}
          {deliveryType === 'home_delivery' && !deliveryChargeApplies && total > 1500 && (
            <p className="text-green-700 text-xs bg-green-50 px-3 py-2 rounded-lg mt-1">
              Free delivery on this order
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Delivery Type */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-3">Delivery Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['pickup', 'home_delivery'] as DeliveryType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleDeliveryTypeChange(type)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors min-h-[44px] ${
                  deliveryType === type
                    ? 'border-amber-600 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {type === 'pickup' ? 'Pickup' : 'Home Delivery'}
              </button>
            ))}
          </div>
          {errors.delivery_type && (
            <p className="text-red-500 text-xs mt-1">{errors.delivery_type}</p>
          )}
          {deliveryType === 'pickup' && (
            <div className="mt-3 bg-stone-50 rounded-lg p-3 text-sm text-stone-600">
              <strong>Pickup location:</strong> {PICKUP_ADDRESS}
            </div>
          )}
          {deliveryType === 'home_delivery' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                placeholder="Enter your full delivery address"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {errors.delivery_address && (
                <p className="text-red-500 text-xs mt-1">{errors.delivery_address}</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-3">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {deliveryType !== 'home_delivery' && (
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors min-h-[44px] ${
                  paymentMethod === 'COD'
                    ? 'border-amber-600 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                Cash on Delivery
              </button>
            )}
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors min-h-[44px] ${
                paymentMethod === 'UPI'
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              UPI
            </button>
          </div>
          {errors.payment_method && (
            <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
          )}
          {paymentMethod === 'UPI' && (
            <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              After placing your order, contact us on WhatsApp with your Order ID to receive payment details and complete your payment.
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-3">Your Details</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-stone-400 text-xs mt-1">
                Enter your WhatsApp number — order updates will be sent here
              </p>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Any special instructions for the chef? <span className="text-stone-400">(optional)</span>
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                placeholder="e.g., extra spicy, no sesame..."
                maxLength={500}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-stone-400 text-xs mt-1 text-right">{specialInstructions.length} / 500</p>
              {errors.special_instructions && (
                <p className="text-red-500 text-xs mt-1">{errors.special_instructions}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-md"
        >
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
