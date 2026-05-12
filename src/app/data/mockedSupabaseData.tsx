import { Company, Application } from "./dataTypes";

export const companies: Company[] = [
  { id: "1", name: "JPMorgan Chase", location: "New York, NY" },
  { id: "2", name: "Vanguard", location: "Malvern, PA" },
]

export const applications: Application[] = [
  {
    id: "1",
    company_id: "1",
    role_title: "Software Engineer Co-op",
    status: "Applied",
    deadline: "2026-05-15",
    external_application_id: "JPM-001",
  },
  {
    id: "2",
    company_id: "2",
    role_title: "Fintech Engineer",
    status: "Interview",
    external_application_id: "VAN-001",
  },
]