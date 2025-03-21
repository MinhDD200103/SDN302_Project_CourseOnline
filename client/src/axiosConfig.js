import axios from "axios";
import sweetalert from "sweetalert";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Thay bằng URL backend của bạn
  withCredentials: true, // Để gửi cookie refreshToken nếu cần
});

// Request interceptor - tự động đính kèm accessToken vào request
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

// Response interceptor - xử lý khi accessToken hết hạn
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.get("http://localhost:5000/api/user/refresh-token", {
          withCredentials: true // Đảm bảo gửi kèm cookie refreshToken
        });
        
        if (response.data.success) {
          // Lưu accessToken mới vào localStorage
          localStorage.setItem("accessToken", response.data.newAccessToken);
          
          // Cập nhật token trong header của request ban đầu
          originalRequest.headers.Authorization = `Bearer ${response.data.newAccessToken}`;
          
          // Thực hiện lại request ban đầu với token mới
          return API(originalRequest);
        } else {
          // Nếu refresh token thất bại, đăng xuất
          logoutUser();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Nếu có lỗi khi refresh token, đăng xuất
        logoutUser();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Hàm đăng xuất khi token hết hạn
const logoutUser = () => {
  // Xóa thông tin người dùng khỏi localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("tid");
  
  // Hiển thị thông báo
  sweetalert("Session Expired", "Please log in again", "warning")
    .then(() => {
      // Chuyển hướng về trang chủ
      window.location.href = "/";
    });
};

export default API;