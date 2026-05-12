type Props = {
  label: string
  value: string | number
  color?: string
  accent?: string
}

export function StatCard({ label, value, color = "text-white", accent = "border-white/10" }: Props) {
  return (
    <div className={`bg-brand-dark rounded-xl p-6 border-l-4 ${accent}`}>
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}