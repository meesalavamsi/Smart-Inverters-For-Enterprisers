import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/api/auth/login", data),
  register: (data: Record<string, string>) => api.post("/api/auth/register", data),
  verifyOtp: (data: { userId: string; otp: string }) => api.post("/api/auth/verify-otp", data),
  resendOtp: (userId: string) => api.post("/api/auth/resend-otp", { userId }),
  forgotPassword: (email: string) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (data: { userId: string; otp: string; newPassword: string }) => api.post("/api/auth/reset-password", data),
  getMe: () => api.get("/api/auth/me"),
  updateProfile: (data: { name: string; phone: string }) => api.put("/api/auth/profile", data),
};

// Products
export const productsApi = {
  getAll: (params?: Record<string, string | number>) => api.get("/api/products", { params }),
  getBySlug: (slug: string) => api.get(`/api/products/${slug}`),
  getAdminAll: (params?: Record<string, string | number>) => api.get("/api/products/admin/all", { params }),
  create: (data: FormData) => api.post("/api/products", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, data: FormData) => api.put(`/api/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/api/products/${id}`),
  deleteImage: (productId: string, imageId: string) => api.delete(`/api/products/${productId}/images/${imageId}`),
  getCategories: () => api.get("/api/products/categories/all"),
  createCategory: (data: Record<string, string>) => api.post("/api/products/categories", data),
};

// Orders
export const ordersApi = {
  create: (data: Record<string, unknown>) => api.post("/api/orders", data),
  getMy: (params?: Record<string, string | number>) => api.get("/api/orders/my", { params }),
  track: (orderNumber: string) => api.get(`/api/orders/track/${orderNumber}`),
  getAdminAll: (params?: Record<string, string | number>) => api.get("/api/orders/admin/all", { params }),
  updateStatus: (id: string, data: { status: string; paymentStatus?: string }) => api.put(`/api/orders/${id}/status`, data),
};

// Bookings
export const bookingsApi = {
  create: (data: Record<string, string>) => api.post("/api/bookings", data),
  getMy: () => api.get("/api/bookings/my"),
  getAdminAll: (params?: Record<string, string | number>) => api.get("/api/bookings/admin/all", { params }),
  updateStatus: (id: string, data: { status: string; technicianId?: string }) => api.put(`/api/bookings/${id}/status`, data),
};

// Issues
export const issuesApi = {
  create: (data: FormData) => api.post("/api/issues", data, { headers: { "Content-Type": "multipart/form-data" } }),
  getMy: () => api.get("/api/issues/my"),
  getAdminAll: (params?: Record<string, string | number>) => api.get("/api/issues/admin/all", { params }),
  update: (id: string, data: { status?: string; priority?: string; resolution?: string }) => api.put(`/api/issues/${id}`, data),
};

// Feedback
export const feedbackApi = {
  create: (data: Record<string, string | number>) => api.post("/api/feedback", data),
  getPublic: () => api.get("/api/feedback/public"),
  getAdminAll: (params?: Record<string, string | number>) => api.get("/api/feedback/admin/all", { params }),
  update: (id: string, data: { isApproved: boolean; isDisplayed: boolean }) => api.put(`/api/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/api/feedback/${id}`),
};

// Videos
export const videosApi = {
  getAll: (params?: Record<string, string>) => api.get("/api/videos", { params }),
  create: (data: Record<string, string | number>) => api.post("/api/videos", data),
  update: (id: string, data: Record<string, string | number>) => api.put(`/api/videos/${id}`, data),
  delete: (id: string) => api.delete(`/api/videos/${id}`),
  getRecycling: () => api.get("/api/videos/recycling"),
  createRecycling: (data: Record<string, string>) => api.post("/api/videos/recycling", data),
  deleteRecycling: (id: string) => api.delete(`/api/videos/recycling/${id}`),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => api.get("/api/analytics/dashboard"),
  getRevenue: (period: string) => api.get("/api/analytics/revenue", { params: { period } }),
  getNotifications: () => api.get("/api/analytics/notifications"),
  markRead: (id: string) => api.put(`/api/analytics/notifications/${id}/read`),
  markAllRead: () => api.put("/api/analytics/notifications/read-all"),
  getAuditLogs: (params?: Record<string, string | number>) => api.get("/api/analytics/audit-logs", { params }),
};

// Users
export const usersApi = {
  getAll: (params?: Record<string, string | number>) => api.get("/api/users", { params }),
  getById: (id: string) => api.get(`/api/users/${id}`),
  update: (id: string, data: Record<string, string | boolean>) => api.put(`/api/users/${id}`, data),
  toggleStatus: (id: string) => api.put(`/api/users/${id}/toggle-status`),
  createTechnician: (data: Record<string, string>) => api.post("/api/users/technician", data),
  getSettings: () => api.get("/api/users/settings/all"),
  updateSettings: (data: Record<string, string>) => api.put("/api/users/settings/update", data),
};

export default api;
