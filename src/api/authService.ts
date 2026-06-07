import axios from "axios";

const API_URL = "http://localhost:5108/api/Auth";

// =========================
// REGISTER
// =========================
export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// =========================
// LOGIN
// =========================
export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/login`, data);

  // guardar sesión
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

// =========================
// LOGOUT
// =========================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};