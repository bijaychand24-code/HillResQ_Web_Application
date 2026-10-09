import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hillresq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean up token if on protected pages
      if (
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/responder') ||
        window.location.pathname.startsWith('/report') ||
        window.location.pathname.startsWith('/profile')
      ) {
        localStorage.removeItem('hillresq_token');
        localStorage.removeItem('hillresq_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
