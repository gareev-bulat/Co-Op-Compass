"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";

export default function AddApplicationPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [externalApplicationId, setExternalApplicationId] = useState("");
  const [externalCompanyId, setExternalCompanyId] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit() {
    if (!companyName || !roleTitle || !externalApplicationId) return;
    setIsLoading(true);
    setError("");
    const supabase = createClient();

    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("external_application_id", externalApplicationId)
      .single();

    if (existingApplication) {
      setError("This application already exists in your tracker.");
      setIsLoading(false);
      return;
    }

    // 1. Check if company exists
    let { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", companyName)
      .single();

    let companyId = existingCompany?.id;

    // 2. If not found — create it
    if (!companyId) {
      const { data: newCompany } = await supabase
        .from("companies")
        .insert({ name: companyName })
        .select("id")
        .single();
      companyId = newCompany?.id;
    }

    // 3. Create application
    const { error } = await supabase.from("applications").insert({
      company_id: companyId,
      role_title: roleTitle,
      status: "Applied",
      deadline: deadline || null,
      notes: notes || null,
      external_application_id: externalApplicationId,
    });

    if (error) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/applications");
    }, 1500);
  }

  const inputClass =
    "w-full bg-white/5 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 outline-none border border-white/10 focus:border-blue-400";
  if (isSuccess) {
    return (
      <div className="text-white max-w-lg mx-auto flex flex-col items-center justify-center min-h-64 gap-4 mt-20 animate-fade-in">
        <div className="text-green-400 text-6xl animate-bounce">✓</div>
        <h2 className="text-xl font-bold">Application added!</h2>
        <p className="text-gray-400 text-sm">Redirecting you back...</p>
      </div>
    );
  }
  return (
    <div className="text-white max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-8">Add Application</h1>

      <div className="flex flex-col gap-4">
        <input
          placeholder="Job posting ID (required)"
          value={externalApplicationId}
          onChange={(e) => setExternalApplicationId(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Role title (required)"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Company ID (optional)"
          value={externalCompanyId}
          onChange={(e) => setExternalCompanyId(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Company name (required)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none h-24`}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={
            !companyName || !roleTitle || !externalApplicationId || isLoading
          }
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {isLoading ? "Adding..." : "Add Application"}
        </button>

        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white text-sm text-center transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
