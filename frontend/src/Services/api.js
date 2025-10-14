// Services/api.js
{/*
  import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
});

export default api;
*/}

// Services/api.js
// src/Services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("todoapp"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
