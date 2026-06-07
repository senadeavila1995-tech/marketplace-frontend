import axios from "axios";

const API_URL = "http://localhost:5108/api/Stores";

// =========================
// CREATE STORE
// =========================
export const createStore = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// =========================
// GET MY STORE
// =========================
export const getMyStore = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/my-store`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};