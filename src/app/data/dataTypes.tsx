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

export type ReviewStatus = "pending" | "submitted" | "rejected";

export type AiSuggestion = {
  external_job_id: string;
  title: string;
  company?: string;
  location?: string;
  url?: string;
  terms?: string[];
  fit_score: number;
  reasoning?: string;
  meets_hard_filters: boolean;
  resume_id?: string;
  red_flags?: string[];
  to_verify?: string[];
  review_status: ReviewStatus;
  created_at?: string;
  updated_at?: string;
};