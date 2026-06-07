import API from "../api/api.ts";

export const getCart = async () => {
  const res = await API.get("/Cart");
  return res.data;
};

export const addToCart = async (
  productId: number,
  quantity: number = 1
) => {
  const res = await API.post("/Cart", {
    productId,
    quantity,
  });

  return res.data;
};

export const updateCartItem = async (
  id: number,
  quantity: number
) => {
  const res = await API.put(`/Cart/${id}`, {
    quantity,
  });

  return res.data;
};

export const removeCartItem = async (id: number) => {
  const res = await API.delete(`/Cart/${id}`);
  return res.data;
};