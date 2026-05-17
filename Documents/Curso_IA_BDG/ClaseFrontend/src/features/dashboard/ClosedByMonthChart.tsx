import { BarChart, Card } from '@tremor/react'
import type { DashboardMetrics } from '@/types'

interface Props {
  data: DashboardMetrics['closedByMonth']
}

export default function ClosedByMonthChart({ data }: Props) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Tickets cerrados por mes</h3>
      <BarChart
        data={data.map((d) => ({ mes: d.month, Tickets: d.count }))}
        index="mes"
        categories={['Tickets']}
        colors={['blue']}
        yAxisWidth={32}
        className="h-48"
      />
    </Card>
  )
}
