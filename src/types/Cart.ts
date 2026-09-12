export interface CartItem {
  id: number;
  productId: number;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}
