"use client";

import { createClient } from "@/app/utils/supabase/client";

const statuses = ["Applied", "Interview", "Waitlist", "Offer", "Rejected"];

type Props = {
  company: { position_id: string; name: string; position: string };
  onStatusChange?: () => void;
};

export function PositionEntry({ company, onStatusChange }: Props) {
  async function updateStatus(newStatus: string) {
    const supabase = createClient();
    await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", company.position_id);
    onStatusChange?.();
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition group">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm text-white">{company.name}</p>
          <p className="text-gray-400 text-xs mt-1">{company.position}</p>
        </div>
      </div>
      {onStatusChange && (
        <select
          onChange={(e) => updateStatus(e.target.value)}
          className="mt-2 w-full bg-transparent text-gray-500 text-xs rounded outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          defaultValue=""
        >
          <option value="" disabled>
            Move to...
          </option>
          {statuses.map((status) => (
            <option key={status} value={status} className="bg-brand-darker">
              {status}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
