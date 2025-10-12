import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:3000", // backend server,
  baseURL: "https://chathive-backend-gqs9.onrender.com", // backend server,
  withCredentials: true,
  headers:{
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  }
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
