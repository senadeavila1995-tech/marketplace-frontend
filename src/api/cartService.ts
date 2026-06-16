import API from "./api";

// GET CART
export const getCart = async () => {
  const res = await API.get("/Cart");
  return res.data;
};

// ADD TO CART
export const addToCart = async (productId: number, quantity = 1) => {
  const res = await API.post("/Cart", {
    productId,
    quantity,
  });

  return res.data;
};

// UPDATE ITEM
export const updateCartItem = async (id: number, quantity: number) => {
  const res = await API.put(`/Cart/${id}`, {
    quantity,
  });

  return res.data;
};

// DELETE ITEM
export const removeCartItem = async (id: number) => {
  const res = await API.delete(`/Cart/${id}`);
  return res.data;
};