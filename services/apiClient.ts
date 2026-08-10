import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { TokenManager } from '../utils/tokenManager';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if backend expects them natively
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops (e.g. if the refresh token endpoint itself returns 401)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await TokenManager.getRefreshToken();
        
        // Manually inject the cookie header for React Native since it drops HttpOnly cookies
        const refreshHeaders: any = {};
        if (refreshToken) {
          refreshHeaders['Cookie'] = `refresh_token=${refreshToken}`;
        }
        
        // Use a new axios instance to avoid our own interceptors interfering
        const refreshApi = axios.create({ baseURL: API_CONFIG.BASE_URL });
        const response = await refreshApi.post('/auth/refresh-token', {}, { headers: refreshHeaders });
        
        const { token } = response.data.data;
        await TokenManager.setAccessToken(token);
        
        // Extract the new refresh token from headers if provided
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
          const cookieStr = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('refresh_token=')) : setCookie;
          if (cookieStr) {
            const newRefreshToken = cookieStr.split(';')[0].split('=')[1];
            await TokenManager.setRefreshToken(newRefreshToken);
          }
        }
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
        
      } catch (refreshError) {
        // Refresh token failed - wipe tokens and let the app handle logout via state
        await TokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
