import API from "./api";
import type {
  ConfirmPaymentResponse,
  Payment,
  ReleasePaymentResponse,
} from "../types/Payment";

export async function getPayments(): Promise<Payment[]> {
  const response = await API.get<Payment[]>(
    "/payments"
  );

  return response.data;
}

export async function getPayment(
  id: number
): Promise<Payment> {
  const response = await API.get<Payment>(
    `/payments/${id}`
  );

  return response.data;
}

export async function confirmPayment(
  id: number
): Promise<ConfirmPaymentResponse> {
  const response =
    await API.post<ConfirmPaymentResponse>(
      `/payments/${id}/confirm`
    );

  return response.data;
}

export async function releasePayment(
  id: number
): Promise<ReleasePaymentResponse> {
  const response =
    await API.post<ReleasePaymentResponse>(
      `/payments/${id}/release`
    );

  return response.data;
}
