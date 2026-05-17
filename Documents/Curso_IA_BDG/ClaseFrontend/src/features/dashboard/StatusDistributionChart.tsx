import { DonutChart, Card, Legend } from '@tremor/react'
import type { DashboardMetrics, TicketStatus } from '@/types'

const labels: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  hecho: 'Hecho',
}

interface Props {
  data: DashboardMetrics['statusDistribution']
}

export default function StatusDistributionChart({ data }: Props) {
  const chartData = data.map((d) => ({ name: labels[d.status], value: d.count }))
  const names = chartData.map((d) => d.name)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por estado</h3>
      <DonutChart
        data={chartData}
        category="value"
        index="name"
        colors={['slate', 'blue', 'yellow', 'green']}
        className="h-48"
      />
      <Legend categories={names} colors={['slate', 'blue', 'yellow', 'green']} className="mt-3" />
    </Card>
  )
}
