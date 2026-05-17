import type { DashboardMetrics } from '@/types'
import MetricCards from './MetricCards'
import ClosedByMonthChart from './ClosedByMonthChart'
import StatusDistributionChart from './StatusDistributionChart'

const mockMetrics: DashboardMetrics = {
  openTickets: 8,
  overdueTickets: 2,
  resolvedThisMonth: 5,
  closedByMonth: [
    { month: 'Ene', count: 3 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 2 },
    { month: 'Abr', count: 7 },
    { month: 'May', count: 5 },
  ],
  statusDistribution: [
    { status: 'backlog', count: 4 },
    { status: 'en_progreso', count: 2 },
    { status: 'en_revision', count: 1 },
    { status: 'hecho', count: 5 },
  ],
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      <MetricCards metrics={mockMetrics} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClosedByMonthChart data={mockMetrics.closedByMonth} />
        <StatusDistributionChart data={mockMetrics.statusDistribution} />
      </div>
    </div>
  )
}
