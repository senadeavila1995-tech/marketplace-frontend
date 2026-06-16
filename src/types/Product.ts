export interface Product {
  id: number;

  name: string;
  description: string;

  price: number;
  stock: number;

  imageUrl?: string;
  status?: boolean;

  createdAt?: string;

  store?: string;
  seller?: string;
  category?: string;

  storeId?: number;
  categoryId?: number;
}