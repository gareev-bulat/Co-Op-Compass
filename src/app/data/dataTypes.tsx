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
};

export type Application = {
  id: string;
  companyId: string;
  roleTitle: string;
  status: ApplicationStatus;
  deadline?: string;
  link?: string;
  notes?: string;
  jobDescription?: string;
};