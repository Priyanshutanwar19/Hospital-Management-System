import api from './axiosConfig';

const login = (credentials) => api.post('/auth/login', credentials);
const register = (data) => api.post('/auth/register', data);
const forgotPassword = (email) => api.post('/auth/forgot-password', email);
const resetPassword = (payload) => api.post('/auth/reset-password', payload);
const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });

export default { login, register, forgotPassword, resetPassword, logout };
