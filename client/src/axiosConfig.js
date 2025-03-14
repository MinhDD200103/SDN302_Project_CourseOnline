import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Thay bằng URL backend của bạn
  withCredentials: true, // Để gửi cookie refreshToken nếu cần
});

// Thêm interceptor để tự động đính kèm accessToken vào request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



export default API;
