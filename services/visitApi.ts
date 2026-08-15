import apiClient from './apiClient';
import { CreateVisitData, Visit, VisitStats } from '../types/visit';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const visitApi = {
  createVisit: async (data: CreateVisitData) => {
    const response = await apiClient.post<ApiResponse<{ visit_id: number }>>('/api/visits', data);
    return response.data;
  },

  getVisits: async (params?: { assignee_id?: number; status?: string }) => {
    const response = await apiClient.get<ApiResponse<Visit[]>>('/api/visits', { params });
    return response.data;
  },

  checkInVisit: async (id: number, formData: FormData) => {
    const response = await apiClient.post<ApiResponse<{ checkin_time: string }>>(`/api/visits/${id}/checkin`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  checkOutVisit: async (id: number, formData: FormData) => {
    const response = await apiClient.post<ApiResponse<{ checkout_time: string }>>(`/api/visits/${id}/checkout`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVisitStats: async (params?: { assignee_id?: number }) => {
    const response = await apiClient.get<ApiResponse<VisitStats>>('/api/visits/stats', { params });
    return response.data;
  },

  getCompletedVisits: async (params?: { assignee_id?: number }) => {
    const response = await apiClient.get<ApiResponse<Visit[]>>('/api/visits/completed', { params });
    return response.data;
  },
};
