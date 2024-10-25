import { Client, Product } from '@/types';

const STORAGE_KEYS = {
  CLIENTS: 'newpet-clients',
  PRODUCTS: 'newpet-products',
};

export function loadClients(): Client[] {
  try {
    const clientsData = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return clientsData ? JSON.parse(clientsData) : [];
  } catch (error) {
    console.error('Error loading clients:', error);
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (error) {
    console.error('Error saving clients:', error);
  }
}

export function loadProducts(): Product[] {
  try {
    const productsData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return productsData ? JSON.parse(productsData) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
  }
}

// Helper function to clear all data (useful for testing)
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.CLIENTS);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
}