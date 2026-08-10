import apiClient from './apiClient';

export interface CheckInPayload {
  latitude: number | null;
  longitude: number | null;
  attendance_type: 'office' | 'wfh' | 'outdoor';
  selfie_data: string | null; // base64 string
}

export interface CheckInResponse {
  status: string;
  message: string;
  data: {
    attendance_id: number;
    status: string;
    checkin_time: string;
    warning?: string;
  };
}

export interface CheckOutPayload {
  latitude: number | null;
  longitude: number | null;
}

export interface CheckOutOutOfBoundsPayload extends CheckOutPayload {
  reason?: string;
}

export interface AttendanceStatusResponse {
  success: boolean;
  data: {
    checked_in: boolean;
    checked_out: boolean;
    record?: any;
  };
}

export interface AttendanceHistoryItem {
  date: string;
  status: string;
  leave_type: string | null;
  leave_duration: string | null;
  attendance_data: {
    id?: number;
    checkin_time?: string;
    checkout_time?: string;
    total_hours?: string;
  } | null;
}

export interface WeeklyHistoryResponse {
  success: boolean;
  data: AttendanceHistoryItem[];
}

export interface MonthStats {
  total_days: number;
  present: number;
  late: number;
  absent: number;
  avg_hours: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    today?: any;
    month_stats: MonthStats;
    this_week: AttendanceHistoryItem[];
  };
}

export const attendanceService = {
  checkIn: async (payload: CheckInPayload) => {
    try {
      const response = await apiClient.post<CheckInResponse>('/attendance/checkin', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data; // Throw the backend's precise error response
      }
      throw error;
    }
  },

  getStatus: async () => {
    try {
      const response = await apiClient.get<AttendanceStatusResponse>('/attendance/status');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  checkOut: async (payload: CheckOutPayload) => {
    try {
      const response = await apiClient.post('/attendance/checkout', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  checkOutOutOfBounds: async (payload: CheckOutOutOfBoundsPayload) => {
    try {
      const response = await apiClient.post('/attendance/checkout-out-of-bounds', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getWeeklyHistory: async () => {
    try {
      const response = await apiClient.get<WeeklyHistoryResponse>('/attendance/my-history/weekly');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await apiClient.get<DashboardResponse>('/dashboard/employee');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
