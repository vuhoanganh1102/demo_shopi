const API_BASE_URL = "localhost:3000/shopify-api-client"; // URL gốc của API

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    DETAIL: (userId) => `${API_BASE_URL}/users/${userId}`,
    UPDATE: (userId) => `${API_BASE_URL}/users/${userId}`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/product`,
    DETAIL: (productId) => `${API_BASE_URL}/products/${productId}`,
  },
};

export { API_BASE_URL, API_ENDPOINTS };
