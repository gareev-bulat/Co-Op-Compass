export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Waitlist"
  | "Offer"
  | "Rejected";

export type Company = {
  id: string;
  name: string;
  location?: string;
  website?: string;
  external_company_id?: string;  
};

export type Application = {
  id: string;
  company_id: string;
  role_title: string;
  status: ApplicationStatus;
  deadline?: string;
  notes?: string;
  job_description?: string;
  external_application_id: string;
  created_at?: string;
};