export type Role = 'admin' | 'usuario'

export type TicketStatus = 'backlog' | 'en_progreso' | 'en_revision' | 'hecho'
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica'

export interface UserSummary {
  id: string
  name: string
  handle: string
  avatarUrl?: string
  role: Role
  active: boolean
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assignee?: UserSummary
  reporter: UserSummary
  tags: Tag[]
  dueDate?: string
  archived: boolean
  version: number
  editingBy?: UserSummary
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  ticketId: string
  author: UserSummary
  body: string
  createdAt: string
}

export interface DashboardMetrics {
  openTickets: number
  overdueTickets: number
  resolvedThisMonth: number
  closedByMonth: { month: string; count: number }[]
  statusDistribution: { status: TicketStatus; count: number }[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  handle: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserSummary
}

export interface ApiError {
  message: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  assigneeId?: string
  tagIds?: string[]
  search?: string
  dueDateFrom?: string
  dueDateTo?: string
}
