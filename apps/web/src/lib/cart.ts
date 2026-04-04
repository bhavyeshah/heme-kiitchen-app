'use client';

export interface CartItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_path: string;
}

const CART_KEY = 'heme_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.product_id === item.product_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((c) => c.product_id !== productId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  const item = cart.find((c) => c.product_id === productId);
  if (item) {
    if (quantity <= 0) return removeFromCart(productId);
    item.quantity = quantity;
  }
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}
