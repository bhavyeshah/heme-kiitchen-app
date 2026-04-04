import { Product } from '../types';
import { readJson, writeJson } from './JsonRepository';
import { randomUUID } from 'crypto';

const FILE = 'products.json';

export const ProductRepository = {
  findAll(): Product[] {
    return readJson<Product[]>(FILE) || [];
  },

  findById(id: string): Product | undefined {
    return this.findAll().find((p) => p.id === id);
  },

  findActive(): Product[] {
    return this.findAll().filter((p) => p.status === 'active');
  },

  create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const products = this.findAll();
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: randomUUID(),
      created_at: now,
      updated_at: now,
    };
    products.push(product);
    writeJson(FILE, products);
    return product;
  },

  update(id: string, partial: Partial<Omit<Product, 'id' | 'created_at'>>): Product | null {
    const products = this.findAll();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updated: Product = {
      ...products[idx],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    products[idx] = updated;
    writeJson(FILE, products);
    return updated;
  },
};
