import API from "./api";

export const getStores = async () => {
  const response = await API.get("/Stores");
  return response.data;
};

export const createStore = async (data: any) => {
  const response = await API.post("/Stores", data);
  return response.data;
};

export const updateStore = async (
  id: number,
  data: any
) => {
  const response = await API.put(`/Stores/${id}`, data);
  return response.data;
};

export const deleteStore = async (id: number) => {
  const response = await API.delete(`/Stores/${id}`);
  return response.data;
};