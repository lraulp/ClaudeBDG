import { Card } from '@tremor/react'
import type { DashboardMetrics } from '@/types'

interface Props {
  metrics: DashboardMetrics
}

export default function MetricCards({ metrics }: Props) {
  const cards = [
    { label: 'Tickets abiertos', value: metrics.openTickets, color: 'text-blue-600' },
    { label: 'Vencidos', value: metrics.overdueTickets, color: 'text-red-600' },
    { label: 'Resueltos este mes', value: metrics.resolvedThisMonth, color: 'text-green-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <p className="text-sm text-gray-500">{c.label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
        </Card>
      ))}
    </div>
  )
}
