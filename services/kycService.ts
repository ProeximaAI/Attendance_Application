import apiClient from './apiClient';
import { API_CONFIG } from '../constants/api';
import { TokenManager } from '../utils/tokenManager';

export interface KycData {
  profile_photo: string | null;
  date_of_birth?: string | null;
  aadhaar_last4: string | null;
  pan_last4: string | null;
  esic_last4: string | null;
  pf_last4: string | null;
  bank_name_last4: string | null;
  bank_account_last4: string | null;
  ifsc_code_last4: string | null;
}

export interface GetKycResponse {
  success: boolean;
  data: KycData | null;
  message: string;
}

export interface StandardResponse {
  success: boolean;
  data: any;
  message: string;
}

export const kycService = {
  getMyKyc: async () => {
    try {
      const response = await apiClient.get<GetKycResponse>('/my/kyc');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  submitKyc: async (formData: FormData) => {
    try {
      // Axios in React Native automatically handles FormData boundaries 
      // if we override the default application/json header
      const response = await apiClient.post<StandardResponse>('/my/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  deleteKyc: async () => {
    try {
      const response = await apiClient.delete<StandardResponse>('/my/kyc');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }
};
