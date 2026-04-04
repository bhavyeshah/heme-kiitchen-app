// ─── Site Content ────────────────────────────────────────────────────────────

export interface SiteContent {
  tagline: string;           // max 150 chars
  description: string;       // max 500 chars
  highlights: string[];      // each max 80 chars
  instagram_handle: string | null;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_path: string;        // Cloudinary CDN URL
  cloudinary_public_id: string; // stored to enable deletion on photo replace
  status: ProductStatus;
  created_at: string;        // ISO 8601
  updated_at: string;        // ISO 8601
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderSource = 'online' | 'offline';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'dispatched'
  | 'completed'
  | 'cancelled'
  | 'declined';
export type DeliveryType = 'pickup' | 'home_delivery';
export type PaymentMethod = 'COD' | 'UPI';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  product_id: string;
  name: string;        // snapshot at order creation
  unit_price: number;  // snapshot at order creation
  quantity: number;
}

export interface Order {
  id: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  total_price: number;
  customer_name: string;
  phone: string;                        // stored as +91XXXXXXXXXX
  delivery_type: DeliveryType;
  delivery_address: string | null;      // required for home_delivery, null for pickup
  delivery_charges_applicable: boolean;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  special_instructions: string | null;  // max 500 chars
  deleted: boolean;
  deleted_at: string | null;            // ISO 8601 or null
  created_at: string;                   // ISO 8601
  updated_at: string;                   // ISO 8601
}

// ─── API request/response helpers ────────────────────────────────────────────

export interface CreateOrderPayload {
  source: OrderSource;
  items: { product_id: string; quantity: number }[];
  customer_name: string;
  phone: string;
  delivery_type: DeliveryType;
  delivery_address?: string | null;
  payment_method: PaymentMethod;
  special_instructions?: string | null;
}

export interface PatchOrderPayload {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  items?: { product_id: string; quantity: number }[];
  customer_name?: string;
  phone?: string;
  delivery_type?: DeliveryType;
  delivery_address?: string | null;
  payment_method?: PaymentMethod;
  special_instructions?: string | null;
}
