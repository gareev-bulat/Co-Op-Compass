"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { Application, Company } from "@/app/data/dataTypes";
import { ActivityEntry } from "@/app/components/activityEntry";
import { PositionEntry } from "@/app/components/positionEntry";
import { QuickAction } from "@/app/components/quickAction";
import { ApplicationStatus } from "@/app/data/dataTypes";
import { ChevronRight, SquarePlus, Calendar, FileText } from "lucide-react";
import Link from "next/link";


const statusConfig = {
  Applied: { color: "text-blue-400", border: "border-blue-400" },
  Interview: { color: "text-purple-400", border: "border-purple-400" },
  Waitlist: { color: "text-yellow-400", border: "border-yellow-400" },
  Offer: { color: "text-green-400", border: "border-green-400" },
  Rejected: { color: "text-red-400", border: "border-red-400" },
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: applicationsData } = await supabase
        .from("applications")
        .select("*");

      const { data: companiesData } = await supabase
        .from("companies")
        .select("*");

      setApplications(applicationsData ?? []);
      setCompanies(companiesData ?? []);
    }
    fetchData();
  }, []);

  const columns = (
    [
      "Applied",
      "Interview",
      "Waitlist",
      "Offer",
      "Rejected",
    ] as ApplicationStatus[]
  ).map((status) => ({
    label: status,
    color: statusConfig[status].color,
    border: statusConfig[status].border,
    companies: applications
      .filter((app) => app.status === status)
      .map((app) => ({
        position_id: app.id,
        name: companies.find((c) => c.id === app.company_id)?.name ?? "Unknown",
        position: app.role_title,
      })),
    value: applications.filter((app) => app.status === status).length,
  }));

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Pipeline */}
      <div className="grid grid-cols-5 gap-3">
        {columns.map((column) => (
          <div
            key={column.label}
            className={`bg-brand-dark rounded-xl p-4 border-t-2 min-h-105 ${column.border}`}
          >
            {/* Column header */}
            <div className="flex justify-between items-center mb-4">
              <span className={`font-bold text-sm ${column.color}`}>
                {column.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{column.value}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Company cards */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {column.companies.map((company) => (
                <PositionEntry key={company.position_id} company={company} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/*Deadlines box*/}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-brand-dark rounded-xl p-4">
          <h1 className="text-1xl font-bold mb-6">Upcoming Deadlines</h1>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {applications
              .filter((app) => app.deadline)
              .map((app) => (
                <PositionEntry
                  key={app.id}
                  company={{
                    position_id: app.id,
                    name:
                      companies.find((c) => c.id === app.company_id)?.name ??
                      "Unknown",
                    position: app.role_title,
                  }}
                />
              ))}
          </div>
        </div>
        {/*Recent Activity box*/}
        <div className="bg-brand-dark rounded-xl p-4">
          <h1 className="text-1xl font-bold mb-6">Recent Activity</h1>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {applications.slice(0, 5).map((app) => {
              const companyName =
                companies.find((c) => c.id === app.company_id)?.name ??
                "Unknown";
              return (
                <ActivityEntry
                  key={app.id}
                  action={{
                    position_id: app.id,
                    name: companyName,
                    label: `You added ${companyName} application`,
                    time: app.created_at ?? "",
                  }}
                />
              );
            })}
          </div>
        </div>
        {/*Quick actions box*/}
        <div className="bg-brand-dark rounded-xl p-4">
          <h1 className="text-1xl font-bold mb-6">Quick Actions</h1>
          <div className="space-y-2">
            <Link className="space-y-3" href="/add">
              <QuickAction label="Add Application" icon={SquarePlus} />
            </Link>
            <QuickAction label="View Calendar" icon={Calendar} />
            <QuickAction label="Upload Document" icon={FileText} />
          </div>
        </div>
      </div>
    </div>
  );
}
