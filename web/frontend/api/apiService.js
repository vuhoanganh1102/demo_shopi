import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

// Tạo một instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm gọi API đăng nhập
export const login = async (credentials) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Login failed";
  }
};

// Hàm lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch users";
  }
};

// Hàm lấy thông tin chi tiết một người dùng
export const getUserDetail = async (userId) => {
  try {
    const response = await api.get(API_ENDPOINTS.USERS.DETAIL(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch user details";
  }
};

// Hàm lấy danh sách sản phẩm
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch products";
  }
};
