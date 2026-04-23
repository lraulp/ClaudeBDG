import { create } from 'zustand'
import type { BoardFilters, TicketStatus, Priority } from '@/types'

interface BoardFilterState {
  filters: BoardFilters
  setFilter: <K extends keyof BoardFilters>(key: K, value: BoardFilters[K]) => void
  resetFilters: () => void
  initFromSearchParams: (params: URLSearchParams) => void
  toSearchParams: () => URLSearchParams
}

const EMPTY: BoardFilters = {}

export const useBoardFilterStore = create<BoardFilterState>((set, get) => ({
  filters: EMPTY,

  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: EMPTY }),

  initFromSearchParams: (params) => {
    const filters: BoardFilters = {}

    const status = params.getAll('status') as TicketStatus[]
    if (status.length) filters.status = status

    const priority = params.getAll('priority') as Priority[]
    if (priority.length) filters.priority = priority

    const assigneeId = params.get('assigneeId')
    if (assigneeId) filters.assigneeId = assigneeId

    const labelIds = params.getAll('labelIds')
    if (labelIds.length) filters.labelIds = labelIds

    const dateFrom = params.get('dateFrom')
    if (dateFrom) filters.dateFrom = dateFrom

    const dateTo = params.get('dateTo')
    if (dateTo) filters.dateTo = dateTo

    set({ filters })
  },

  toSearchParams: () => {
    const { filters } = get()
    const params = new URLSearchParams()

    filters.status?.forEach(s => params.append('status', s))
    filters.priority?.forEach(p => params.append('priority', p))
    if (filters.assigneeId) params.set('assigneeId', filters.assigneeId)
    filters.labelIds?.forEach(l => params.append('labelIds', l))
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo)   params.set('dateTo', filters.dateTo)

    return params
  },
}))
