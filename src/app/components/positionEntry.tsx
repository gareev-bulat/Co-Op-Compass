export function PositionEntry({ company }: { company: { position_id: string, name: string, position: string } }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition">
      <p className="font-medium text-sm text-white">{company.name}</p>
      <p className="text-gray-400 text-xs mt-1">{company.position}</p>
    </div>
  )
}
