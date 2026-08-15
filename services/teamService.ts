import apiClient from './apiClient';

export interface TeamMemberResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  designation: string;
  department_id: number;
  manager_id: number | null;
  org_path: string;
}

export interface TeamData {
  team: TeamMemberResponse[];
}

export interface TeamApiResponse {
  success: boolean;
  message: string;
  data: TeamData;
}

export const teamService = {
  getTeam: async (): Promise<TeamApiResponse> => {
    const response = await apiClient.get('/team');
    return response.data;
  },
};
