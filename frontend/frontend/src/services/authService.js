import api from './api';

export const AuthService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data.data; // { id, username, email, accessToken, refreshToken }
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data.data; // { id, username, email, accessToken, refreshToken }
  },

  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data.data; // { id, username, email }
  },

  verifyEmail: async (token) => {
    const response = await api.get('/auth/verify-email', { params: { token } });
    return response.data;
  },

  resendVerifyEmail: async (email) => {
    const response = await api.post('/auth/resend-verify-email', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyCode: async (email, verificationCode) => {
    const response = await api.post('/auth/verify-code', { verificationCode }, { params: { email } });
    return response.data.data; // { token }
  },

  resetPassword: async (token, password, confirmPassword) => {
    const response = await api.post('/auth/reset-password', { password, confirmPassword }, { params: { token } });
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data.data; // { token }
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
};
