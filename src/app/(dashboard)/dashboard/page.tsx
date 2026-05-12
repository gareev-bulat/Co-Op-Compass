import { ActivityEntry } from "@/app/components/activityEntry";
import { PositionEntry } from "@/app/components/positionEntry";
import { QuickAction } from "@/app/components/quickAction";
import { ChevronRight, SquarePlus, Calendar, FileText } from "lucide-react";


const data = [
  {
    label: "Applied",
    value: 17,
    color: "text-blue-400",
    border: "border-blue-400",
    companies: [
      {
        position_id: "1",
        name: "JPMorgan Chase",
        position: "Software Engineer Co-op",
      },
      { position_id: "2", name: "Vanguard", position: "Software Engineer" },
      { position_id: "3", name: "Comcast", position: "Software Engineer" },
    ],
  },
  {
    label: "Interview",
    value: 5,
    color: "text-purple-400",
    border: "border-purple-400",
    companies: [
      { position_id: "7", name: "Amazon", position: "SDE Co-op" },
      { position_id: "8", name: "Microsoft", position: "Software Engineer" },
      { position_id: "9", name: "Adobe", position: "Software Engineer" },
      { position_id: "30", name: "Adobe", position: "Software Engineer" },
      { position_id: "31", name: "Adobe", position: "Software Engineer" },
      { position_id: "32", name: "Adobe", position: "Software Engineer" },
    ],
  },
  {
    label: "Waitlist",
    value: 8,
    color: "text-yellow-400",
    border: "border-yellow-400",
    companies: [
      { position_id: "4", name: "Capital One", position: "Software Engineer" },
      { position_id: "5", name: "Goldman Sachs", position: "Analyst Co-op" },
      { position_id: "6", name: "Deloitte", position: "Technology Co-op" },
    ],
  },
  {
    label: "Offer",
    value: 2,
    color: "text-green-400",
    border: "border-green-400",
    companies: [
      {
        position_id: "10",
        name: "American Express",
        position: "Software Engineer",
      },
      {
        position_id: "11",
        name: "Lockheed Martin",
        position: "Systems Engineer",
      },
    ],
  },
  {
    label: "Rejected",
    value: 4,
    color: "text-red-400",
    border: "border-red-400",
    companies: [
      { position_id: "12", name: "Tesla", position: "Software Engineer" },
      { position_id: "13", name: "IBM", position: "Software Engineer" },
      { position_id: "14", name: "Cisco", position: "Software Engineer" },
    ],
  },
];

const upcoming_deadlines_data = {
    companies: [
      {
        position_id: "1",
        name: "JPMorgan Chase",
        position: "Software Engineer Co-op",
      },
      { position_id: "2", name: "Vanguard", position: "Software Engineer" },
      { position_id: "3", name: "Comcast", position: "Software Engineer" },
    ],
}

//5 past activities
const recent_activity = {
    actions: [
        {
            name: "Vanguard",
            position_id: "1",
            label: "You added Vanguard application",
            time: "2026-05-11",
        },
        {
            name: "Vanguard",
            position_id: "2",
            label: "You added Vanguard application",
            time: "2026-05-11",
        },
        {
            name: "Vanguard",
            position_id: "3",
            label: "You added Vanguard application",
            time: "2026-05-11",
        },
        {
            name: "Vanguard",
            position_id: "4",
            label: "You added Vanguard application",
            time: "2026-05-11",
        },
        {
            name: "Vanguard",
            position_id: "5",
            label: "You added Vanguard application",
            time: "2026-05-11",
        }
    ]

}

export default function DashboardPage() {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Pipeline */}
      <div className="grid grid-cols-5 gap-3">
        {data.map((column) => (
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

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-brand-dark rounded-xl p-4">
            <h1 className="text-1xl font-bold mb-6">Upcoming Deadlines</h1>

                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {upcoming_deadlines_data.companies.map((company) => (
                        <PositionEntry key={company.position_id} company={company} />
                    ))
                    }
                </div>
        </div>
        <div className="bg-brand-dark rounded-xl p-4">
            <h1 className="text-1xl font-bold mb-6">Recent Activity</h1>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {recent_activity.actions.map((action) => (
                    <ActivityEntry key={action.position_id} action={action} />
                ))
                }
            </div>
        </div>
        <div className="bg-brand-dark rounded-xl p-4">
            <h1 className="text-1xl font-bold mb-6">Quick Actions</h1>
            <div className="space-y-2">
                <QuickAction label="Add Application" icon={SquarePlus} />
                <QuickAction label="View Calendar" icon={Calendar} />
                <QuickAction label="Upload Document" icon={FileText} />
                </div>
        </div>
      </div>

    </div>
  );
}
