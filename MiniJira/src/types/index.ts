// ── Enums ────────────────────────────────────────────────────────────────────

export type TicketStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'member'

// ── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface Ticket {
  id: string
  title: string          // ≤ 120 chars
  description?: string   // markdown
  status: TicketStatus
  priority: Priority
  isBlocked: boolean     // lateral flag; does not move columns
  assignees: User[]
  labels: string[]
  createdBy: User
  createdAt: string      // ISO 8601 UTC
  updatedAt: string      // ISO 8601 UTC
  archivedAt?: string    // ISO 8601 UTC; present = archived
  version: number        // Optimistic Locking — always sent in PATCH
}

export interface Comment {
  id: string
  ticketId: string
  author: User
  body: string           // plain text
  createdAt: string      // ISO 8601 UTC
  archivedAt?: string    // soft delete
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
}

export interface AuthSession {
  user: User
  tokens: AuthTokens
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export interface MetricsSummary {
  closedByMonth: { month: string; count: number }[]  // month = 'YYYY-MM'
  byStatus: { status: TicketStatus; count: number }[]
  byMember: { user: User; activeCount: number }[]
}

// ── Board Filters (URL + Zustand) ─────────────────────────────────────────────

export interface BoardFilters {
  status?: TicketStatus[]
  priority?: Priority[]
  assigneeId?: string
  labelIds?: string[]
  dateFrom?: string      // YYYY-MM-DD
  dateTo?: string        // YYYY-MM-DD
}

// ── CSV Export ────────────────────────────────────────────────────────────────

export interface ExportFilters {
  from?: string          // YYYY-MM-DD
  to?: string            // YYYY-MM-DD
  status?: TicketStatus[]
  assigneeId?: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
}

// ── Kanban columns config ─────────────────────────────────────────────────────

export interface KanbanColumn {
  id: TicketStatus
  label: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'todo',        label: 'Por hacer'   },
  { id: 'in_progress', label: 'En progreso' },
  { id: 'review',      label: 'Review'      },
  { id: 'done',        label: 'Listo'       },
]

export const STATUS_LABELS: Record<TicketStatus, string> = {
  todo:        'Por hacer',
  in_progress: 'En progreso',
  review:      'Review',
  done:        'Listo',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:    'Baja',
  medium: 'Media',
  high:   'Alta',
}
