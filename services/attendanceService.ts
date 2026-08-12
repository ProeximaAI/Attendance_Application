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

export interface CalendarDayRecord {
  date: string;
  calendar_badge: string | null;
  status: string;
  is_holiday: boolean;
  is_weekoff: boolean;
  leave_type: string | null;
  attendance_data: {
    id: number;
    employee_id: number;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
    work_hours: string | null;
    late_by: string | null;
    created_at: string;
  } | null;
}

export interface CalendarAPIResponse {
  success: boolean;
  data: CalendarDayRecord[];
}

export interface MonthlyHistoryResponse {
  success: boolean;
  data: AttendanceHistoryItem[];
}

export interface MonthlySummaryHoursResponse {
  success: boolean;
  data: {
    total_working_hours: number;
  };
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

export interface WfhRequestPayload {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: string;
}

export interface OutdoorRequestPayload {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: string;
}

export interface LeaveBalance {
  id: number;
  leave_type: string;
  allocated_days: string;
  used_days: string;
  remaining_days: string;
}

export interface LeaveHistoryItem {
  id: number;
  leave_type: string;
  leave_duration: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface ApplyLeavePayload {
  leave_type: string;
  leave_duration: string; // full_day, first_half, second_half
  start_date: string;
  end_date: string;
  reason: string;
}


export interface TimeCorrectionPayload {
  date: string; // YYYY-MM-DD
  time_in?: string; // HH:mm:ss
  time_out?: string; // HH:mm:ss
  reason: string;
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

  getCalendar: async (year: number, month: number) => {
    try {
      const response = await apiClient.get<CalendarAPIResponse>(`/attendance/calendar?year=${year}&month=${month}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getMonthlyHistory: async (year: number, month: number) => {
    try {
      const response = await apiClient.get<MonthlyHistoryResponse>(`/attendance/my-history/monthly?year=${year}&month=${month}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getMonthlySummaryHours: async (year: number, month: number) => {
    try {
      const response = await apiClient.get<MonthlySummaryHoursResponse>(`/attendance/my-summary/hours?year=${year}&month=${month}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  requestWfh: async (payload: WfhRequestPayload) => {
    try {
      const response = await apiClient.post('/attendance-requests/wfh', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  requestOutdoor: async (payload: OutdoorRequestPayload) => {
    try {
      const response = await apiClient.post('/attendance-requests/outdoor', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  requestTimeCorrection: async (payload: TimeCorrectionPayload) => {
    try {
      const response = await apiClient.post('/attendance-requests/time-correction', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getLeaveBalances: async (year?: number) => {
    try {
      const url = year ? `/leaves/balances?year=${year}` : '/leaves/balances';
      const response = await apiClient.get<{ success: boolean; data: LeaveBalance[] }>(url);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getLeaveHistory: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: LeaveHistoryItem[] }>('/leaves/history');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  applyForLeave: async (payload: ApplyLeavePayload) => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/leaves/apply', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
