import { Product } from '@/types';

export function cleanPrice(priceStr: string): number {
  if (!priceStr) return 0;
  return Number(priceStr.replace('$', '').replace(/,/g, '').trim());
}

export function parseProducts(data: string): Product[] {
  const lines = data.split('\n');
  const products: Product[] = [];
  let currentId = Date.now();

  for (const line of lines) {
    const parts = line.split('\t').map(part => part.trim());
    if (parts.length >= 3) {
      const [code, name, inventory, price] = parts;
      
      // Skip if no code or name
      if (!code || !name) continue;

      // Convert inventory to number, default to 0 if invalid
      const inventoryNum = Number(inventory) || 0;

      // Clean and convert price
      const priceNum = cleanPrice(price);

      // Only add if we have a valid code and name
      if (code && name) {
        products.push({
          id: currentId++,
          code: code,
          name: name,
          inventory: inventoryNum,
          price: priceNum
        });
      }
    }
  }

  return products;
}