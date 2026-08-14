import apiClient from './apiClient';
import { TokenManager } from '../utils/tokenManager';
import { API_CONFIG } from '../constants/api';
import {
  Address,
  AddressPayload,
  Experience,
  ExperiencePayload,
  Education,
  EducationPayload,
  Family,
  FamilyPayload,
  WorkDetails,
  DocumentType,
  EmployeeDocument,
} from '../types/profile';

// Helper to safely extract arrays from various API response structures
const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  return [];
};

// Address
export const getAddress = async (): Promise<Address[]> => {
  const response = await apiClient.get('/profile/address');
  return extractArray(response.data.data);
};

export const addAddress = async (data: AddressPayload): Promise<Address> => {
  const response = await apiClient.post('/profile/address', data);
  return response.data.data;
};

export const updateAddress = async (uuid: string, data: Partial<AddressPayload>): Promise<Address> => {
  const response = await apiClient.put(`/profile/address/${uuid}`, data);
  return response.data.data;
};

export const deleteAddress = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/profile/address/${uuid}`);
};

// Experience
export const getExperience = async (): Promise<Experience[]> => {
  const response = await apiClient.get('/profile/experience');
  return extractArray(response.data.data);
};

export const addExperience = async (data: ExperiencePayload): Promise<Experience> => {
  const response = await apiClient.post('/profile/experience', data);
  return response.data.data;
};

export const deleteExperience = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/profile/experience/${uuid}`);
};

// Education
export const getEducation = async (): Promise<Education[]> => {
  const response = await apiClient.get('/profile/education');
  return extractArray(response.data.data);
};

export const addEducation = async (data: EducationPayload): Promise<Education> => {
  const response = await apiClient.post('/profile/education', data);
  return response.data.data;
};

export const deleteEducation = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/profile/education/${uuid}`);
};

// Family Details
export const getFamily = async (): Promise<Family[]> => {
  const response = await apiClient.get('/profile/family');
  return extractArray(response.data.data);
};

export const addFamily = async (data: FamilyPayload): Promise<Family> => {
  const response = await apiClient.post('/profile/family', data);
  return response.data.data;
};

export const deleteFamily = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/profile/family/${uuid}`);
};

// Work Details (Branch, Department, Designation, Shift)
export const getWorkDetails = async (): Promise<WorkDetails> => {
  const response = await apiClient.get('/profile/work-details');
  return response.data.data.work_details || {};
};

// Employee Documents
export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  const response = await apiClient.get('/document-types');
  return response.data.data || [];
};

export const getDocuments = async (): Promise<EmployeeDocument[]> => {
  const response = await apiClient.get('/profile/documents');
  return response.data.data || []; // Assuming array is in data.data
};

export const uploadDocument = async (asset: any, documentTypeId: number): Promise<any> => {
  const token = await TokenManager.getAccessToken();
  
  const formData = new FormData();
  
  const fileObj = {
    uri: asset.uri,
    name: asset.name || asset.fileName || 'upload.jpg',
    type: asset.mimeType || asset.type || 'image/jpeg' 
  };
  
  formData.append('document', fileObj as any);
  
  formData.append('document_type_id', documentTypeId.toString());

  const response = await apiClient.post('/profile/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return response.data;
};

export const getDocumentPhotoUrl = async (fileUuid: string): Promise<string> => {
  const token = await TokenManager.getAccessToken();
  // Ensure BASE_URL does not have a trailing slash if constructed like this
  return `${API_CONFIG.BASE_URL}/files/${fileUuid}?token=${token}`;
};
