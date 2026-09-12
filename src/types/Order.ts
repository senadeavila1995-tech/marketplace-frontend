export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "NEQUI"
  | "PAYPAL";

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  paymentMethod: PaymentMethod;
}

export interface CheckoutResponse {
  message: string;
  id: number;
  total: number;
  stockUpdated: boolean;
  cartCleared: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED";

export interface SellerOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface SellerOrder {
  id: number;
  status: OrderStatus;
  createdAt: string;
  total: number;
  paymentMethod?: PaymentMethod;
  items: SellerOrderItem[];
}
