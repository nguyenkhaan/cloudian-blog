import axios from 'axios';
import type { RefreshResponse } from '../types/auth';
import { clearStoredAuth } from '\../utils/authTokens';

const API_TARGET = import.meta.env.VITE_API_TARGET || 'http://localhost:8787';
const isDev = import.meta.env.DEV
const BASE_URL = isDev ? '/api' : `${API_TARGET}/api`;
console.log(BASE_URL)

export const SESSION_EXPIRED_EVENT = 'auth_session_expired';

let refreshPromise: Promise<string> | null = null;

const dispatchSessionExpired = () => {
  clearStoredAuth();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

export const requestAccessTokenRefresh = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await axios.post<RefreshResponse>(`${BASE_URL}/auth/refresh`, {
      token: refreshToken,
    });
    const accessToken = response.data.accessToken;
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    dispatchSessionExpired();
    throw error;
  } finally {
    refreshPromise = null;
  }
};

const client = axios.create({
  
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto-refresh token on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh API fails with 401
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await requestAccessTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
//Su dung originalRequest: Request ban dau. Dieu kien de no co the lay duoc access token 
//chinh la dua vao originalRequest => originalRequest._retry = 0 && originalRequest (co ton tai)
// && originalRequest.url.includes('/auth/refresh') (Khong goi lai API nay neu nhu day chinh la API dung de lay access token luon - tranh loi infinity loop)