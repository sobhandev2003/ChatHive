import axios from "axios";

const api = axios.create({
  baseURL: "https://chathive-backend-gqs9.onrender.com",
  // baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Update Authorization header before each request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     delete config.headers.Authorization;
//   }
//   return config;
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
