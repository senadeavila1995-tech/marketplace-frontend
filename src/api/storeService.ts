import API from "./api";
import type {
  CreateStoreRequest,
  Store,
} from "../types/Store";

export async function getStores(): Promise<Store[]> {
  const response = await API.get<Store[]>("/Stores");
  return response.data;
}

export async function createStore(
  data: CreateStoreRequest
): Promise<Store> {
  const response = await API.post<Store>(
    "/Stores",
    data
  );

  return response.data;
}

export async function getMyStores(): Promise<Store[]> {
  const response = await API.get<Store[]>(
    "/Stores/my"
  );

  return response.data;
}
