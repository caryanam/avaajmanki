import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request Interceptor: Add Authorization header with Bearer token & handle FormData headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized safely without breaking active login flow on public pages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/', '', '/index.html', '/about', '/privacy-policy', '/community-guidelines', '/child-safety', '/child-safety-standards', '/contact', '/faq', '/delete-account', '/login', '/admin/login', '/register', '/forgot-password'];
      const currentPath = window.location.pathname.split('?')[0].replace(/\/+$/, '') || '/';
      
      // Do not clear tokens or force redirect if user is actively on public pages like /login
      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('mka_admin_logged_in');
        window.location.href = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);
