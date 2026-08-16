import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { TokenManager } from '../utils/tokenManager';
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await TokenManager.getAccessToken();
    if (token) {
      // PROPER AXIOS 1.X SYNTAX
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// QUEUE SYSTEM VARIABLES
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};
// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {

      // IF A REFRESH IS ALREADY RUNNING, ADD TO QUEUE AND WAIT
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          return apiClient.request(originalRequest); // Use apiClient.request
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await TokenManager.getRefreshToken();
        const refreshHeaders: any = {};
        if (refreshToken) {
          refreshHeaders['Cookie'] = `refresh_token=${refreshToken}`;
        }

        const refreshApi = axios.create({ baseURL: API_CONFIG.BASE_URL });
        const response = await refreshApi.post('/auth/refresh-token', {}, { headers: refreshHeaders });

        const { token } = response.data.data;
        await TokenManager.setAccessToken(token);

        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
          const cookieStr = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('refresh_token=')) : setCookie;
          if (cookieStr) {
            const newRefreshToken = cookieStr.split(';')[0].split('=')[1];
            await TokenManager.setRefreshToken(newRefreshToken);
          }
        }

        // FLUSH QUEUE: Release all waiting dashboard APIs
        processQueue(null, token);

        // Retry the original request
        originalRequest.headers.set('Authorization', `Bearer ${token}`);
        return apiClient.request(originalRequest); // CRITICAL FIX: apiClient.request

      } catch (refreshError: any) {
        processQueue(refreshError, null);
        await TokenManager.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default apiClient;