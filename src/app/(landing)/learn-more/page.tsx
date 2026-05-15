import Link from "next/link";

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center text-white">
      <nav className="flex items-center px-8 py-6">
        <Link href="/" className="hover:brightness-110 hover:scale-105 transition-opacity duration-300">
        <span className="text-brand-yellow font-bold text-xl">
          CO-OP COMPASS
        </span>
        </Link>
      </nav>  

      <section className="max-w-3xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Why Co-Op Compass?</h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          Every Drexel student goes through co-op. Co-Op Compass gives you a
          clearer, more organized way to manage your applications — beyond
          spreadsheets and scattered notes.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-8 pb-20 grid grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold mb-3">Track Everything</h3>
          <p className="text-gray-400">
            One place for all your applications — company, role, status,
            deadline, and notes.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold mb-3">See the Big Picture</h3>
          <p className="text-gray-400">
            Kanban pipeline shows exactly where you stand across every
            application at a glance.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-bold mb-3">Understand Your Progress</h3>
          <p className="text-gray-400">
            Analytics dashboard shows your application trends and conversion
            rates over time.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 border-dashed">
          <h3 className="text-xl font-bold mb-3">Coming Soon</h3>
          <p className="text-gray-400">
            Shared anonymous data from Drexel students — real interview rates by
            company, by cycle.
          </p>
        </div>
      </section>

      <section className="text-center pb-24">
        <p className="text-gray-400 mb-6">
          Built by a Drexel student. For Drexel students. Always free.
        </p>
        <a href="/dashboard">
          <button className="bg-brand-yellow text-black font-semibold px-8 py-4 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110">
            Get Started Free
          </button>
        </a>
      </section>
    </div>
  );
}
