// Centralized axios instance with base URL and auth token handling
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simple helpers
export const AuthAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (name, email, password) => api.post('/register', { name, email, password }),
};

export const ExpenseAPI = {
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  addExpense: (payload) => api.post('/add', payload),
  listExpenses: () => api.get('/list'),
  deleteExpense: (id) => api.delete(`/delete/${id}`),
  updateExpense: (id, payload) => api.put(`/update/${id}`, payload),
  categorize: (text) => api.post('/categorize', { text }),
};

export default api;
