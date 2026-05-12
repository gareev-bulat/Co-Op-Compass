import { LucideIcon } from "lucide-react";

type QuickActionProps = {
    label: string;
    icon: LucideIcon;
};

export function QuickAction({ label, icon: Icon }: QuickActionProps ) {
  return (
    <div className="bg-white/5 rounded-lg p-5 hover:bg-white/10 cursor-pointer transition flex items-center gap-3">
    <Icon className="h-6 w-6 text-white" />
      <span>
        <p className="font-medium text-sm text-white">{label}</p>
      </span>
    </div>
  );
}
