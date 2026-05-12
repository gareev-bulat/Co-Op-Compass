import { LayoutDashboard, Briefcase, TrendingUp, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-darker text-white">
      <aside className="w-64 bg-brand-dark flex flex-col p-6 gap-8">
        
        <div className="flex items-center gap-3">
          <span className="text-brand-yellow font-bold text-lg">CO-OP COMPASS</span>
        </div>

        {/*NavBar*/}
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/applications" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
            <Briefcase className="w-5 h-5" />
            Applications
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10">
            <TrendingUp className="w-5 h-5" />
            Analytics
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}