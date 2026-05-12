import { Company, Application } from "./dataTypes";

export const companies: Company[] = [
    { id: "1", name: "JPMorgan Chase", location: "New York, NY" },
    { id: "2", name: "Vanguard", location: "Malvern, PA" },
]


export const applications: Application[] = [
  {
    id: "1",
    companyId: "1",
    roleTitle: "Software Engineer Co-op",
    status: "Applied",
    deadline: "2026-05-15",
  },
  {
    id: "2",
    companyId: "2",
    roleTitle: "Fintech Engineer",
    status: "Interview",
  },
];
