'use client'

import { Plus, Search, SlidersHorizontal, List } from "lucide-react";
import { applications, companies } from "@/app/data/mockedSupabaseData";
import { useState } from "react";

const tabs = ["All", "Applied", "Screening", "Interview", "Offer", "Rejected"];

function getStatusStyle(status: string) {
  switch (status) {
    case "Applied":
      return "bg-lime-400/10 text-lime-400";
    case "Screening":
      return "bg-yellow-400/10 text-yellow-400";
    case "Interview":
      return "bg-yellow-400/10 text-yellow-400";
    case "Offer":
      return "bg-green-400/10 text-green-400";
    case "Rejected":
      return "bg-gray-400/10 text-gray-300";
    default:
      return "bg-white/10 text-white";
  }
}

export default function ApplicationsPage() {

  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <section className="text-white">
      <div className="bg-brand-dark rounded-2xl border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Applications</h1>

          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold transition ${
                  tab === activeTab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search and view controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search applications..."
              className="w-full rounded-lg bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 outline-none border border-white/5 focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg bg-white/5 p-3 hover:bg-white/10 transition">
              <SlidersHorizontal className="h-4 w-4 text-gray-300" />
            </button>

            <button className="rounded-lg bg-white/5 p-3 hover:bg-white/10 transition">
              <List className="h-4 w-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Application list */}
        <div className="overflow-hidden rounded-xl border border-white/5">
          {applications
            .filter((a) => a.status.includes(activeTab))
            .map((a) => {
            const company = companies.find((c) => c.id === a.companyId);
            return (
              <div
                key={a.id}
                className="grid grid-cols-[1.8fr_0.6fr_1fr_1fr] items-center gap-4 border-b border-white/5 bg-white/3 px-5 py-4 last:border-b-0 hover:bg-white/6 transition"
              >
                {/* Company */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                    {company?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white">
                      {company?.name}
                    </h2>
                    <p className="text-sm text-gray-400">{a.roleTitle}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`rounded-full px-4 py-1 text-xs font-bold ${getStatusStyle(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>

                {/* Date */}
                <p className="text-sm font-semibold text-gray-300 text-right">
                  {a.deadline ?? "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
