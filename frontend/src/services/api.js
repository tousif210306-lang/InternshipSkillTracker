import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
const TOKEN_KEY = 'skilltracker-token';
const USER_KEY = 'skilltracker-user';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export const authHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const request = async (method, url, data = null, config = {}) => {
  const headers = { ...config.headers, ...authHeader() };
  return api.request({ method, url, data, ...config, headers });
};
