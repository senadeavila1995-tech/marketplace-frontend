import API from "./api";

export const getCategories = async () => {
  const response = await API.get("/Categories");
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await API.post("/Categories", data);
  return response.data;
};

export const updateCategory = async (
  id: number,
  data: any
) => {
  const response = await API.put(`/Categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await API.delete(`/Categories/${id}`);
  return response.data;
};