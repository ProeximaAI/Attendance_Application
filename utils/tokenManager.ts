import * as SecureStore from 'expo-secure-store';

export const TokenManager = {
  getAccessToken: async () => {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch (e) {
      return null;
    }
  },
  
  setAccessToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync('access_token', token);
    } catch (e) {
      console.error('Failed to save access token', e);
    }
  },

  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync('refresh_token');
    } catch (e) {
      return null;
    }
  },

  setRefreshToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync('refresh_token', token);
    } catch (e) {
      console.error('Failed to save refresh token', e);
    }
  },

  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } catch (e) {
      console.error('Failed to clear tokens', e);
    }
  }
};
