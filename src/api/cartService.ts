import API from "./api";
import type {
  AddToCartRequest,
  CartItem,
  UpdateCartRequest,
} from "../types/Cart";

export async function getCart(): Promise<CartItem[]> {
  const response = await API.get<CartItem[]>("/Cart");
  return response.data;
}

export async function addToCart(
  data: AddToCartRequest
) {
  const response = await API.post(
    "/Cart",
    data
  );

  return response.data;
}

export async function updateCartItem(
  id: number,
  data: UpdateCartRequest
) {
  const response = await API.put(
    `/Cart/${id}`,
    data
  );

  return response.data;
}

export async function removeCartItem(id: number) {
  const response = await API.delete(
    `/Cart/${id}`
  );

  return response.data;
}
