import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5108/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      if (window.location.pathname !== "/login") {
        const returnTo =
          window.location.pathname +
          window.location.search +
          window.location.hash;

        window.location.href =
          "/login?returnTo=" +
          encodeURIComponent(returnTo);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
