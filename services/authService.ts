import apiClient from './apiClient';

export const authService = {
  login: async (credentials: any) => {
    // const response = await apiClient.post('/auth/login', credentials);
    // return response.data;
    return { token: 'mock-token', user: { id: 1, name: 'Swarup Kumar', role: 'Software Developer' } };
  },
  logout: async () => {
    // await apiClient.post('/auth/logout');
  },
};
