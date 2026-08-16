export interface Expense {
  id: number;
  employee_id: number;
  expense_date: string;
  expense_type: string;
  expense_category: string;
  expense_head: string;
  amount: string;
  status: string;
  attachment: string | null;
  created_at: string;
}

export interface Advance {
  id: number;
  employee_id: number;
  expense_type: string;
  amount_requested: string;
  amount_disbursed: string | null;
  advance_disbursal_date: string | null;
  status: string;
  created_at: string;
}

export interface Incentive {
  id: number;
  user_id: number;
  incentive_type: string;
  total_incentive_amount: string;
  payroll_processing_month: string;
  approval_date: string;
  target_achieved_description: string;
  created_at: string;
}

export interface ApplyExpensePayload {
  expense_date: string;
  expense_type: string;
  expense_category: string;
  expense_head: string;
  amount: string;
  attachment?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface ApplyAdvancePayload {
  expense_type: string;
  amount_requested: string | number;
}
