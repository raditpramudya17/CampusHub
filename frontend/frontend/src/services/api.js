import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request. Backend auth-middleware reads X-API-TOKEN.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['X-API-TOKEN'] = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize API errors: backend always responds {success, message, data, errors}
api.interceptors.response.use(
  (response) => {
    if (response && response.data && response.data.success === false) {
      const err = new Error(response.data.message || 'Request failed');
      err.errors = response.data.errors ?? (response.data.message ? [response.data.message] : null);
      if (err.errors) {
        err.message = Array.isArray(err.errors) ? String(err.errors[0]) : String(err.errors);
      }
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error && error.response && error.response.data) {
      const resp = error.response.data;
      error.errors = resp.errors ?? (resp.message ? [resp.message] : [error.message]);
      if (resp && resp.errors) {
        error.message = Array.isArray(resp.errors) ? String(resp.errors[0]) : String(resp.errors);
      } else if (resp && resp.message) {
        error.message = String(resp.message);
      }
    } else {
      error.errors = [error.message];
    }
    return Promise.reject(error);
  }
);

export default api;
