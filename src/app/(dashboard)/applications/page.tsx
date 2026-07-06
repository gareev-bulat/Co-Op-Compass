"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { Application, Company, AiSuggestion } from "@/app/data/dataTypes";

const tabs = ["All", "Applied", "Waitlist", "Interview", "Offer", "Rejected"];

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
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);

  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    async function fetchSupabaseData() {
      const supabase = createClient();

      const { data: applicationsData } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: companiesData } = await supabase
        .from("companies")
        .select("*");

      setApplications(applicationsData ?? []);
      setCompanies(companiesData ?? []);
    }
    fetchSupabaseData();
  }, []);

  useEffect(() => {
    async function fetchSuggestions() {
      const supabase = createClient();
      const { data } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("review_status", "pending")
        .order("fit_score", { ascending: false });
      setSuggestions(data ?? []);
    }
    fetchSuggestions();
  }, []);

  async function rejectSuggestion(jobId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("ai_suggestions")
      .update({ review_status: "rejected", updated_at: new Date().toISOString() })
      .eq("external_job_id", jobId);

    if (error) {
      console.error("Failed to reject suggestion:", error);
      return;
    }
    setSuggestions((prev) => prev.filter((s) => s.external_job_id !== jobId));
  }

  async function submitSuggestion(s: AiSuggestion) {
    const supabase = createClient();

    // 1. Skip if this application already exists (dedup by external id)
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("external_application_id", s.external_job_id)
      .single();

    // 2. Find or create the company (mirrors add/page.tsx)
    let companyId: string | undefined;
    if (!existing && s.company) {
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", s.company)
        .single();

      companyId = existingCompany?.id;
      if (!companyId) {
        const { data: newCompany } = await supabase
          .from("companies")
          .insert({ name: s.company })
          .select("id")
          .single();
        companyId = newCompany?.id;
      }
    }

    // 3. Create the application (only if it didn't already exist)
    if (!existing) {
      const { error: insertError } = await supabase.from("applications").insert({
        company_id: companyId,
        role_title: s.title,
        status: "Applied",
        notes: s.reasoning ?? null,
        external_application_id: s.external_job_id,
      });
      if (insertError) {
        console.error("Failed to create application:", insertError);
        return;
      }
    }

    // 4. Mark the suggestion submitted + remove from queue + refresh applications
    const { error: updateError } = await supabase
      .from("ai_suggestions")
      .update({ review_status: "submitted", updated_at: new Date().toISOString() })
      .eq("external_job_id", s.external_job_id);

    if (updateError) {
      console.error("Failed to mark suggestion submitted:", updateError);
      return;
    }

    setSuggestions((prev) => prev.filter((x) => x.external_job_id !== s.external_job_id));

    // Re-fetch applications so Manual mode shows the new one immediately
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications(apps ?? []);
  }

  const filteredApplications = applications.filter((a) => {
    const company = companies.find((c) => c.id === a.company_id);

    const matchesTab = activeTab === "All" || a.status === activeTab;

    const searchValue = input.toLowerCase();

    const matchesSearch =
      a.role_title.toLowerCase().includes(searchValue) ||
      a.status.toLowerCase().includes(searchValue) ||
      company?.name.toLowerCase().includes(searchValue);

    return matchesTab && matchesSearch;
  });

  return (
    <section className="text-white">
      <div className="bg-brand-dark rounded-2xl border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Applications</h1>

          <Link
            href="/add"
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
          >
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </Link>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 mb-6 w-fit rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              mode === "manual"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              mode === "ai"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            AI Suggested
          </button>
        </div>

        {mode === "manual" && (
          <>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full rounded-lg bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 outline-none border border-white/5 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Application list */}
            <div className="overflow-hidden rounded-xl border border-white/5">
              {filteredApplications.map((a) => {
                const company = companies.find((c) => c.id === a.company_id);
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
                        <p className="text-sm text-gray-400">{a.role_title}</p>
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
          </>
        )}

        {mode === "ai" && (
          <div className="flex flex-col gap-4">
            {suggestions.length === 0 && (
              <div className="text-gray-400 py-12 text-center">
                No pending suggestions. Run the pipeline to populate this list.
              </div>
            )}

            {suggestions.map((s) => (
              <div
                key={s.external_job_id}
                className="rounded-xl border border-white/10 bg-white/3 p-5"
              >
                {/* Top row: title/company + score */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h2 className="font-bold text-white">{s.title}</h2>
                    <p className="text-sm text-gray-400">
                      {s.company ?? "—"} · {s.location ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="rounded-full bg-blue-500/15 text-blue-300 px-3 py-1 text-sm font-bold">
                      {s.fit_score}/10
                    </span>
                    {s.resume_id && (
                      <span className="text-xs text-gray-400">
                        resume: {s.resume_id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reasoning */}
                {s.reasoning && (
                  <p className="text-sm text-gray-300 mb-3">{s.reasoning}</p>
                )}

                {/* To-verify checklist */}
                {s.to_verify && s.to_verify.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-yellow-400/80 mb-1">
                      ⚠️ Verify before applying:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-0.5">
                      {s.to_verify.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Link */}
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View posting ↗
                  </a>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => submitSuggestion(s)}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => rejectSuggestion(s.external_job_id)}
                    className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
