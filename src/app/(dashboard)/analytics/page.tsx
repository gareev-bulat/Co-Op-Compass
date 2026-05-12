"use client";

import { StatCard } from "@/app/components/statsCard";
import { Application, Company } from "@/app/data/dataTypes";
import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: applicationsData } = await supabase.from("applications").select("*");
      const { data: companiesData } = await supabase.from("companies").select("*");
      setApplications(applicationsData ?? []);
      setCompanies(companiesData ?? []);
    }
    fetchData();
  }, []);

  const totalApplications = applications.length;
  const totalInterviews = applications.filter((app) => app.status === "Interview").length;
  const totalOffers = applications.filter((app) => app.status === "Offer").length;

  const chartData = applications.reduce(
    (acc, app) => {
      const date = app.created_at?.split("T")[0] ?? "Unknown";
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    },
    [] as { date: string; count: number }[],
  );

  const statusData = [
    { status: "Applied", count: applications.filter(a => a.status === "Applied").length, color: "#3B82F6" },
    { status: "Interview", count: totalInterviews, color: "#A855F7" },
    { status: "Offer", count: totalOffers, color: "#22C55E" },
    { status: "Rejected", count: applications.filter(a => a.status === "Rejected").length, color: "#EF4444" },
  ]

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Applications Submitted" value={totalApplications} color="text-blue-400" accent="border-blue-400" />
        <StatCard label="Interviews Received" value={totalInterviews} color="text-purple-400" accent="border-purple-400" />
        <StatCard label="Offers Received" value={totalOffers} color="text-green-400" accent="border-green-400" />
        <StatCard label="Response Rate" value={`${totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0}%`} color="text-brand-yellow" accent="border-brand-yellow" />
      </div>

      <div className="grid grid-cols-2 gap-4">
       
        <div className="bg-brand-dark rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Applications Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#151A20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                labelStyle={{ color: "#fff", fontWeight: "bold", marginBottom: "4px" }}
                itemStyle={{ color: "#60A5FA" }}
              />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fill="url(#colorCount)" dot={{ fill: "#3B82F6", r: 5, strokeWidth: 2, stroke: "#1d4ed8" }} activeDot={{ r: 7, fill: "#60A5FA", stroke: "#3B82F6", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brand-dark rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} barSize={40}>
              <XAxis dataKey="status" stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#151A20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}