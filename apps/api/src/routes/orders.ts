import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { WhatsAppService } from '../services/WhatsAppService';
import {
  Order,
  OrderStatus,
  DeliveryType,
  PaymentMethod,
  CreateOrderPayload,
  PatchOrderPayload,
} from '../types';

const router = Router();

const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'declined'];
const VALID_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled', 'declined',
];

function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

function normalizePhone(phone: string): string {
  return `+91${phone}`;
}

function calcDeliveryCharges(deliveryType: DeliveryType, totalPrice: number): boolean {
  if (deliveryType === 'pickup') return false;
  return totalPrice <= 1500;
}

// GET /api/orders — admin only
router.get('/', requireAdmin, (req: Request, res: Response) => {
  let orders = OrderRepository.findAll();

  const source = req.query.source as string | undefined;
  const status = req.query.status as string | undefined;
  const payment_status = req.query.payment_status as string | undefined;
  const delivery_type = req.query.delivery_type as string | undefined;
  const deleted = req.query.deleted as string | undefined;

  if (deleted === 'true') {
    orders = orders.filter((o) => o.deleted);
  } else if (deleted === 'false' || deleted === undefined) {
    orders = orders.filter((o) => !o.deleted);
  }

  if (source) orders = orders.filter((o) => o.source === source);
  if (status) orders = orders.filter((o) => o.status === status);
  if (payment_status) orders = orders.filter((o) => o.payment_status === payment_status);
  if (delivery_type) orders = orders.filter((o) => o.delivery_type === delivery_type);

  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(orders);
});

// GET /api/orders/:id — admin only
router.get('/:id', requireAdmin, (req: Request, res: Response) => {
  const order = OrderRepository.findById(req.params.id as string);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

// POST /api/orders — public (customer checkout) or admin (offline order)
router.post('/', async (req: Request, res: Response) => {
  const body: CreateOrderPayload = req.body;
  const errors: string[] = [];

  // Determine source: admin session = offline, otherwise online
  const source = req.session?.isAdmin ? 'offline' : 'online';

  if (!body.customer_name || typeof body.customer_name !== 'string' || !body.customer_name.trim())
    errors.push('customer_name is required');

  if (!body.phone || !validateIndianPhone(body.phone))
    errors.push('phone must be a valid 10-digit Indian mobile number (starting with 6-9)');

  if (!body.delivery_type || !['pickup', 'home_delivery'].includes(body.delivery_type))
    errors.push('delivery_type must be "pickup" or "home_delivery"');

  if (body.delivery_type === 'home_delivery' && !body.delivery_address?.trim())
    errors.push('delivery_address is required for home delivery');

  if (!body.payment_method || !['COD', 'UPI'].includes(body.payment_method))
    errors.push('payment_method must be "COD" or "UPI"');

  if (body.delivery_type === 'home_delivery' && body.payment_method === 'COD')
    errors.push('COD is only available for pickup orders; use UPI for home delivery');

  if (body.delivery_type === 'pickup' && body.payment_method === 'UPI') {
    // UPI is also allowed for pickup — no error
  }

  if (!Array.isArray(body.items) || body.items.length === 0)
    errors.push('items must be a non-empty array');

  if (body.special_instructions !== undefined && body.special_instructions !== null) {
    if (typeof body.special_instructions !== 'string')
      errors.push('special_instructions must be a string');
    else if (body.special_instructions.length > 500)
      errors.push('special_instructions must be 500 characters or fewer');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  // Validate and snapshot items
  const products = ProductRepository.findAll();
  const snapshotItems: Order['items'] = [];
  const itemErrors: string[] = [];

  for (const item of body.items) {
    if (!item.product_id || typeof item.quantity !== 'number' || item.quantity < 1) {
      itemErrors.push(`invalid item: ${JSON.stringify(item)}`);
      continue;
    }
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      itemErrors.push(`product ${item.product_id} not found`);
    } else if (product.status !== 'active') {
      itemErrors.push(`product ${item.product_id} is not available`);
    } else {
      snapshotItems.push({
        product_id: product.id,
        name: product.name,
        unit_price: product.price,
        quantity: item.quantity,
      });
    }
  }

  if (itemErrors.length > 0) {
    res.status(400).json({ errors: itemErrors });
    return;
  }

  const total_price = snapshotItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  try {
    const order = await OrderRepository.create({
      source,
      status: 'pending',
      items: snapshotItems,
      total_price,
      customer_name: body.customer_name.trim(),
      phone: normalizePhone(body.phone),
      delivery_type: body.delivery_type,
      delivery_address:
        body.delivery_type === 'home_delivery' ? (body.delivery_address?.trim() || null) : null,
      delivery_charges_applicable: calcDeliveryCharges(body.delivery_type, total_price),
      payment_method: body.payment_method,
      payment_status: 'unpaid',
      special_instructions:
        body.special_instructions?.trim() || null,
      deleted: false,
      deleted_at: null,
    });

    // Trigger WhatsApp notification (non-blocking)
    WhatsAppService.sendOrderPlaced(order.customer_name, order.phone).catch((err) =>
      console.error('[WhatsApp] order_placed failed:', err)
    );

    res.status(201).json(order);
  } catch (err) {
    console.error('[Orders] Create error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id — admin only
router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  const order = OrderRepository.findById(req.params.id as string);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.deleted) {
    res.status(400).json({ error: 'Cannot update a deleted order' });
    return;
  }

  const body: PatchOrderPayload = req.body;
  const errors: string[] = [];

  // Status update validation
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    } else if (TERMINAL_STATUSES.includes(order.status)) {
      errors.push(`cannot update status of a ${order.status} order`);
    } else if (body.status === 'declined' && order.status !== 'pending') {
      errors.push('only pending orders can be declined');
    } else if (body.status === 'cancelled' && order.status === 'pending') {
      errors.push('pending orders must be declined, not cancelled');
    }
  }

  // Editing validation (non-status fields)
  const isFieldEdit =
    body.items !== undefined ||
    body.customer_name !== undefined ||
    body.phone !== undefined ||
    body.delivery_type !== undefined ||
    body.delivery_address !== undefined ||
    body.payment_method !== undefined ||
    body.special_instructions !== undefined;

  if (isFieldEdit && TERMINAL_STATUSES.includes(order.status)) {
    errors.push('cannot edit a terminal order');
  }

  if (body.phone !== undefined && !validateIndianPhone(body.phone)) {
    errors.push('phone must be a valid 10-digit Indian mobile number');
  }

  if (body.status === undefined && body.payment_status !== undefined) {
    if (!['unpaid', 'paid', 'refunded'].includes(body.payment_status)) {
      errors.push('payment_status must be "unpaid", "paid", or "refunded"');
    }
  }

  if (body.special_instructions !== undefined && body.special_instructions !== null) {
    if (typeof body.special_instructions !== 'string' || body.special_instructions.length > 500) {
      errors.push('special_instructions must be 500 characters or fewer');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const updates: Partial<Order> = {};

  if (body.status !== undefined) updates.status = body.status;
  if (body.payment_status !== undefined) updates.payment_status = body.payment_status;
  if (body.customer_name !== undefined) updates.customer_name = body.customer_name.trim();
  if (body.phone !== undefined) updates.phone = normalizePhone(body.phone);
  if (body.delivery_type !== undefined) updates.delivery_type = body.delivery_type;
  if (body.delivery_address !== undefined) updates.delivery_address = body.delivery_address || null;
  if (body.payment_method !== undefined) updates.payment_method = body.payment_method;
  if (body.special_instructions !== undefined)
    updates.special_instructions = body.special_instructions?.trim() || null;

  // Re-snapshot items if provided
  if (body.items !== undefined) {
    const products = ProductRepository.findAll();
    const snapshotItems: Order['items'] = [];
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        res.status(400).json({ errors: [`product ${item.product_id} not found`] });
        return;
      }
      snapshotItems.push({
        product_id: product.id,
        name: product.name,
        unit_price: product.price,
        quantity: item.quantity,
      });
    }
    updates.items = snapshotItems;
    updates.total_price = snapshotItems.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
  }

  // Recalculate delivery charges if items or delivery_type changed
  const deliveryType = updates.delivery_type ?? order.delivery_type;
  const totalPrice = updates.total_price ?? order.total_price;
  if (updates.items !== undefined || updates.delivery_type !== undefined) {
    updates.delivery_charges_applicable = calcDeliveryCharges(deliveryType, totalPrice);
  }

  const oldStatus = order.status;

  try {
    const updated = await OrderRepository.update(req.params.id as string, updates);

    // WhatsApp notifications on status change
    if (updated && body.status !== undefined && body.status !== oldStatus) {
      const newStatus = body.status;
      if (newStatus === 'completed') {
        WhatsAppService.sendOrderCompleted(updated.customer_name, updated.phone, oldStatus, newStatus).catch(
          (err) => console.error('[WhatsApp] order_completed failed:', err)
        );
      } else if (newStatus === 'cancelled') {
        WhatsAppService.sendOrderCancelled(updated.customer_name, updated.phone).catch(
          (err) => console.error('[WhatsApp] order_cancelled failed:', err)
        );
      } else if (['confirmed', 'dispatched', 'declined'].includes(newStatus)) {
        WhatsAppService.sendOrderStatusUpdate(
          updated.customer_name,
          updated.phone,
          oldStatus,
          newStatus
        ).catch((err) => console.error('[WhatsApp] order_status_update failed:', err));
      }
    }

    res.json(updated);
  } catch (err) {
    console.error('[Orders] Update error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id — admin only (soft delete)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const order = OrderRepository.findById(req.params.id as string);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const updated = await OrderRepository.update(req.params.id as string, {
    deleted: true,
    deleted_at: new Date().toISOString(),
  });

  res.json(updated);
});

export default router;
