import axios from 'axios';
import { toast } from 'react-toastify';
import store from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const response = await api.post('/auth/refresh-token', { refreshToken });
        store.dispatch(setCredentials({ user: store.getState().auth.user, accessToken: response.data.data.accessToken, refreshToken: response.data.data.refreshToken }));
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        toast.error('Session expired, please log in again.');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
