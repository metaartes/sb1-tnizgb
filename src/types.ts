export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  inventory: number;
}

export interface ClientProduct extends Product {
  quantity: number;
  purchaseDate: string;
}

export interface Client {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  products: ClientProduct[];
}