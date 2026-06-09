interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="card flex-1 min-w-[130px] text-center py-5">
      <p className="text-4xl font-bold text-accent2">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  )
}

interface StatsBarProps {
  employeeCount: number
  shiftCount: number
  weekShiftCount: number
}

export default function StatsBar({ employeeCount, shiftCount, weekShiftCount }: StatsBarProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <StatCard label="Empleados" value={employeeCount} />
      <StatCard label="Turnos totales" value={shiftCount} />
      <StatCard label="Turnos esta semana" value={weekShiftCount} />
    </div>
  )
}
