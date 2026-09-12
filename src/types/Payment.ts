export type PaymentStatus = "PENDING" | "COMPLETED";

export type EscrowStatus =
  | "HELD"
  | "READY"
  | "RELEASED";

export interface Payment {
  id: number;
  orderId: number;
  method: string;
  status: PaymentStatus;
  paidAt: string;
  sellerId: number;
  storeId: number;
  releaseDate?: string | null;
  adminConfirmed: boolean;
  escrowStatus: EscrowStatus;
}

export interface ConfirmPaymentResponse {
  message: string;
  id: number;
  orderId: number;
  adminConfirmed: boolean;
  escrowStatus: string;
  orderStatus?: string;
}

export interface ReleasePaymentResponse {
  message: string;
  id: number;
  orderId: number;
  status: string;
  escrowStatus: string;
  releaseDate: string;
}
