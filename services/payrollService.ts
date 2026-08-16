import apiClient from './apiClient';

export interface PayslipItem {
  id: number;
  employee_id: number;
  company_id: number;
  month: number;
  year: number;
  basic_pay: string;
  total_allowances: string;
  total_incentives: string;
  total_deductions: string;
  net_salary: string;
  status: string;
}

export interface PayslipBreakdownItem {
  name?: string;
  amount: string;
}

export interface PayslipDetail extends PayslipItem {
  breakdown: {
    allowances: PayslipBreakdownItem[];
    deductions: PayslipBreakdownItem[];
    incentives: PayslipBreakdownItem[];
  };
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
}

export interface MyPayslipsResponse {
  success: boolean;
  data: PayslipItem[];
  pagination: Pagination;
}

export interface SinglePayslipResponse {
  success: boolean;
  message: string;
  data: PayslipDetail;
}

export const payrollService = {
  getMyPayslips: async (year?: number, page: number = 1) => {
    try {
      const url = year ? `/my/payslips?year=${year}&page=${page}` : `/my/payslips?page=${page}`;
      const response = await apiClient.get<MyPayslipsResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getPayslipDetail: async (payslipId: number) => {
    try {
      const response = await apiClient.get<SinglePayslipResponse>(`/payroll/payslip/${payslipId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }
};
