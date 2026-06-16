import API from "./api";

// =========================
// GET PRODUCTS
// =========================
export const getProducts = async () => {
  try {
    const res = await API.get("/Products");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};

// =========================
// CREATE PRODUCT (SELLER)
// =========================
export const createProduct = async (data: any) => {
  try {
    const res = await API.post("/Products", data);
    return res.data;
  } catch (error) {
    console.error("❌ Error creating product:", error);
    throw error;
  }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProduct = async (id: number, data: any) => {
  try {
    const res = await API.put(`/Products/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating product:", error);
    throw error;
  }
};

// =========================
// DELETE PRODUCT (ADMIN ONLY)
// =========================
export const deleteProduct = async (id: number) => {
  try {
    const res = await API.delete(`/Products/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    throw error;
  }
};