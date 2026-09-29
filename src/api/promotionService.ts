import API from "./api";
import type {
  CreatePromotionRequest,
  Promotion,
  UpdatePromotionRequest,
} from "../types/Promotion";

export async function getPromotions(): Promise<Promotion[]> {
  const response = await API.get<Promotion[]>("/Promotions");
  return response.data;
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const response = await API.get<Promotion[]>("/Promotions/active");
  return response.data;
}

export async function createPromotion(
  data: CreatePromotionRequest
): Promise<Promotion> {
  const response = await API.post<Promotion>("/Promotions", data);
  return response.data;
}

export async function updatePromotion(
  id: number,
  data: UpdatePromotionRequest
): Promise<Promotion> {
  const response = await API.put<Promotion>(
    `/Promotions/${id}`,
    data
  );
  return response.data;
}

export async function deletePromotion(id: number) {
  const response = await API.delete(`/Promotions/${id}`);
  return response.data;
}
