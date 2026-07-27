import axios from 'axios';
const API_TARGET = import.meta.env.VITE_API_TARGET || 'http://localhost:8787';
const isDev = import.meta.env.DEV
const BASE_URL = isDev ? '/api' : `${API_TARGET}/api`;
console.log(BASE_URL)
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
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          let accessToken = '';
          if (refreshToken.startsWith('mock-')) {
            await new Promise((resolve) => setTimeout(resolve, 600));
            accessToken = 'mock-new-access-token-' + Date.now();
          } else {
            const response = await axios.post<{ accessToken: string }>('/api/auth/refresh', {
              token: refreshToken,
            });
            accessToken = response.data.accessToken;
          }

          localStorage.setItem('accessToken', accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid, trigger logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.dispatchEvent(new Event('auth_logout'));
        }
      }
    }

    return Promise.reject(error);
  }
);

export default client;
