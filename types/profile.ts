export interface Address {
  uuid: string;
  address_type: string;
  house_no: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface AddressPayload {
  address_type: string;
  house_no: string;
  landmark?: string;
  area?: string;
  country?: string;
  state?: string;
  city?: string;
  zip_code?: string;
}

export interface Experience {
  uuid: string;
  organization: string;
  designation: string;
  from_date: string;
  to_date: string;
  responsibility?: string;
}

export interface ExperiencePayload {
  organization: string;
  designation: string;
  from_date: string;
  to_date: string;
  responsibility?: string;
}

export interface Education {
  uuid: string;
  qualification: string;
  year_of_passing: number | string;
  grade?: string;
  percentage?: number | string;
  institute: string;
  university_board?: string;
}

export interface EducationPayload {
  qualification: string;
  year_of_passing: number | string;
  grade?: string;
  percentage?: number | string;
  institute: string;
  university_board?: string;
}

export interface Family {
  uuid: string;
  name: string;
  dob: string;
  phone?: string;
  relation: string;
  gender: string;
}

export interface FamilyPayload {
  name: string;
  dob: string;
  phone?: string;
  relation: string;
  gender: string;
}

export interface WorkDetails {
  branch?: { id: number; name: string; location?: string };
  department?: { id: number; name: string };
  designation?: { id: number; name: string };
  shift?: { start_time: string; end_time: string; working_days: string[] };
}

export interface DocumentType {
  id: number;
  name: string;
  is_required: number;
}

export interface EmployeeDocument {
  id: number;
  document_type_id: number;
  file_url: string;
  file_uuid?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  document_type?: DocumentType;
}
