import apiClient from './apiClient';
import { Advance, Expense, Incentive, ApplyAdvancePayload, ApplyExpensePayload } from '../types/finance';

export const FinanceService = {
  // Expenses
  getMyExpenses: async (status?: string): Promise<Expense[]> => {
    try {
      const url = status ? `/expenses/my-expenses?status=${status}` : '/expenses/my-expenses';
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  applyExpense: async (payload: ApplyExpensePayload): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('expense_date', payload.expense_date);
      formData.append('expense_type', payload.expense_type);
      formData.append('expense_category', payload.expense_category);
      formData.append('expense_head', payload.expense_head);
      formData.append('amount', payload.amount);

      if (payload.attachment) {
        formData.append('attachment', payload.attachment as any);
      }

      const response = await apiClient.post('/expenses/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error applying expense:', error);
      throw error;
    }
  },

  // Advances
  getMyAdvances: async (): Promise<Advance[]> => {
    try {
      const response = await apiClient.get('/advances/my-advances');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching advances:', error);
      throw error;
    }
  },

  applyAdvance: async (payload: ApplyAdvancePayload): Promise<any> => {
    try {
      const response = await apiClient.post('/advances/apply', payload);
      return response.data;
    } catch (error) {
      console.error('Error applying advance:', error);
      throw error;
    }
  },

  // Incentives
  getMyIncentives: async (): Promise<Incentive[]> => {
    try {
      const response = await apiClient.get('/incentives/my-incentives');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching incentives:', error);
      throw error;
    }
  },
};
