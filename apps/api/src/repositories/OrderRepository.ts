import { Order } from '../types';
import { readJson, writeJson } from './JsonRepository';
import { randomUUID } from 'crypto';

const FILE = 'orders.json';

// Simple in-process write lock
let writeLock = false;

async function acquireLock(): Promise<void> {
  while (writeLock) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  writeLock = true;
}

function releaseLock(): void {
  writeLock = false;
}

export const OrderRepository = {
  findAll(): Order[] {
    return readJson<Order[]>(FILE) || [];
  },

  findById(id: string): Order | undefined {
    return this.findAll().find((o) => o.id === id);
  },

  async create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    await acquireLock();
    try {
      const orders = this.findAll();
      const now = new Date().toISOString();
      const order: Order = {
        ...data,
        id: randomUUID(),
        created_at: now,
        updated_at: now,
      };
      orders.push(order);
      writeJson(FILE, orders);
      return order;
    } finally {
      releaseLock();
    }
  },

  async update(id: string, partial: Partial<Omit<Order, 'id' | 'created_at'>>): Promise<Order | null> {
    await acquireLock();
    try {
      const orders = this.findAll();
      const idx = orders.findIndex((o) => o.id === id);
      if (idx === -1) return null;
      const updated: Order = {
        ...orders[idx],
        ...partial,
        updated_at: new Date().toISOString(),
      };
      orders[idx] = updated;
      writeJson(FILE, orders);
      return updated;
    } finally {
      releaseLock();
    }
  },
};
