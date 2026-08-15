export interface Visit {
  id: number;
  company_id: number;
  assignee_id: number;
  co_assignee_id: number | null;
  assigned_by: number;
  customer_name: string;
  client_name?: string;
  address: string;
  visit_purpose: string;
  product: string;
  visit_date: string;
  visit_time: string;
  status: 'pending' | 'in_progress' | 'completed';
  checkin_time: string | null;
  checkin_lat: string | null;
  checkin_lng: string | null;
  checkin_selfie: string | null;
  checkout_time: string | null;
  checkout_lat: string | null;
  checkout_lng: string | null;
  checkout_selfie: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface VisitStats {
  total: number;
  completed: number;
  pending: number;
  upcoming: number;
}

export interface CreateVisitData {
  customer_name: string;
  client_name?: string;
  address: string;
  visit_purpose: string;
  product: string;
  visit_date: string;
  visit_time: string;
  assignee_id?: number;
  co_assignee_id?: number;
}
