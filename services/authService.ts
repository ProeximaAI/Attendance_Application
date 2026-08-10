import { Platform } from 'react-native';
import * as Application from 'expo-application';
import apiClient from './apiClient';

const getDeviceUuid = async () => {
  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    return await Application.getIosIdForVendorAsync();
  }
  return 'unknown_device';
};

export const authService = {
  login: async (credentials: any) => {
    const device_uuid = await getDeviceUuid();
    const payload = { ...credentials, device_uuid };
    const response = await apiClient.post('/auth/login', payload);
    
    return {
      data: response.data.data, // assuming { token: '...', user: {...} }
      headers: response.headers
    };
  },
  
  changeInitialPassword: async (new_password: string) => {
    const response = await apiClient.post('/auth/change-initial-password', { new_password });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed, continuing local logout');
    }
  },
};

