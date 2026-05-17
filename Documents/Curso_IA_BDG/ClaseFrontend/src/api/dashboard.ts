import { api } from '@/lib/axios'
import type { DashboardMetrics } from '@/types'

export const dashboardApi = {
  metrics: () => api.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),
}
