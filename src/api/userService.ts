import API from "./api";

// GET USERS
export const getUsers = async () => {
  const res = await API.get("/Users");
  return res.data;
};

// UPDATE USER
export const updateUser = async (id: number, data: any) => {
  const res = await API.put(`/Users/${id}`, data);
  return res.data;
};

// DELETE USER
export const deleteUser = async (id: number) => {
  const res = await API.delete(`/Users/${id}`);
  return res.data;
};