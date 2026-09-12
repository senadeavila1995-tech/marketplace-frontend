import API from "./api";
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "../types/Product";

export async function getProducts(): Promise<Product[]> {
  const response = await API.get<Product[]>("/Products");
  return response.data;
}

export async function createProduct(
  data: CreateProductRequest
): Promise<Product> {
  const response = await API.post<Product>(
    "/Products",
    data
  );

  return response.data;
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest
): Promise<Product> {
  const response = await API.put<Product>(
    `/Products/${id}`,
    data
  );

  return response.data;
}

export async function deleteProduct(id: number) {
  const response = await API.delete(
    `/Products/${id}`
  );

  return response.data;
}
