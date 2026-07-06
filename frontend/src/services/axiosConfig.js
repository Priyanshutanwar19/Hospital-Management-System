import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Use async request interceptor to lazily import store and resolve circular dependencies
api.interceptors.request.use(async (config) => {
  try {
    const { default: store } = await import('../app/store');
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed to inject auth token dynamically:', err);
  }
  return config;
});

// Use async response interceptor to lazily import store/actions for token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { default: store } = await import('../app/store');
        const { setCredentials, logout } = await import('../features/auth/authSlice');
        
        const refreshToken = store.getState().auth.refreshToken;
        const response = await api.post('/auth/refresh-token', { refreshToken });
        
        store.dispatch(
          setCredentials({
            user: store.getState().auth.user,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          })
        );
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        try {
          const { default: store } = await import('../app/store');
          const { logout } = await import('../features/auth/authSlice');
          store.dispatch(logout());
        } catch (err) {
          console.error('Failed to dispatch logout on token expiry:', err);
        }
        toast.error('Session expired, please log in again.');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
