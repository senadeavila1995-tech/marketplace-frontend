import API from "./api";
import type {
  CheckoutRequest,
  CheckoutResponse,
  SellerOrder,
} from "../types/Order";

export async function checkout(
  data: CheckoutRequest
): Promise<CheckoutResponse> {
  const response = await API.post<CheckoutResponse>(
    "/orders/checkout",
    data
  );

  return response.data;
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const response = await API.get<SellerOrder[]>(
    "/orders/seller"
  );

  return response.data;
}

export async function shipOrder(id: number) {
  const response = await API.post(
    `/orders/${id}/ship`
  );

  return response.data;
}
