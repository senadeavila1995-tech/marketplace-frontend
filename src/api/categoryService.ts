import API from "./api";
import type {
  Category,
  CategoryRequest,
} from "../types/Category";

export async function getCategories(): Promise<Category[]> {
  const response = await API.get<Category[]>(
    "/Categories"
  );

  return response.data;
}

export async function createCategory(
  data: CategoryRequest
): Promise<Category> {
  const response = await API.post<Category>(
    "/Categories",
    data
  );

  return response.data;
}

export async function updateCategory(
  id: number,
  data: CategoryRequest
): Promise<Category> {
  const response = await API.put<Category>(
    `/Categories/${id}`,
    data
  );

  return response.data;
}

export async function deleteCategory(id: number) {
  const response = await API.delete(
    `/Categories/${id}`
  );

  return response.data;
}
