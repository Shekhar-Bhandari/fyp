// Services/api.js
{/*
  import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
});

export default api;
*/}

// Services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
});

// ✅ Attach token automatically to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get JWT from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
