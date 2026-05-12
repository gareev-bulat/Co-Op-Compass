import { formatDistanceToNow } from "date-fns"

export function ActivityEntry({

  action,
}: {
  action: {
    position_id: string;
    name: string;
    label: string;
    time: string;
  };
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition">
      <p className="font-medium text-sm text-white">{action.label}</p>
      <p className="text-gray-400 text-xs mt-1">
        {formatDistanceToNow(new Date(action.time + "Z" ), { addSuffix: true })}
      </p>
    </div>
  );
}
