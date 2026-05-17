import type { Ticket, UserSummary } from '@/types'

const alice: UserSummary = {
  id: 'u1',
  name: 'Alice García',
  handle: 'alice',
  role: 'admin',
  active: true,
}

const bob: UserSummary = {
  id: 'u2',
  name: 'Bob López',
  handle: 'bob',
  role: 'usuario',
  active: true,
}

export const mockTickets: Ticket[] = [
  {
    id: 't1',
    title: 'Configurar autenticación JWT',
    description: 'Implementar login con JWT en el backend y conectar al frontend.',
    status: 'hecho',
    priority: 'alta',
    reporter: alice,
    assignee: alice,
    tags: [{ id: 'tag1', name: 'backend', color: '#3b82f6' }],
    archived: false,
    version: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 't2',
    title: 'Diseñar tablero Kanban',
    description: 'Crear el layout del tablero con columnas arrastrables.',
    status: 'en_progreso',
    priority: 'alta',
    reporter: alice,
    assignee: bob,
    tags: [{ id: 'tag2', name: 'frontend', color: '#22c55e' }],
    archived: false,
    version: 2,
    createdAt: '2024-01-11T09:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
  },
  {
    id: 't3',
    title: 'Integrar drag-and-drop',
    description: 'Usar @dnd-kit para mover tarjetas entre columnas.',
    status: 'en_revision',
    priority: 'media',
    reporter: bob,
    assignee: bob,
    tags: [
      { id: 'tag2', name: 'frontend', color: '#22c55e' },
      { id: 'tag3', name: 'ux', color: '#a855f7' },
    ],
    archived: false,
    version: 1,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 't4',
    title: 'Conectar API de tickets',
    description: 'Integrar TanStack Query con los endpoints REST de tickets.',
    status: 'backlog',
    priority: 'media',
    reporter: alice,
    tags: [],
    archived: false,
    version: 1,
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z',
  },
  {
    id: 't5',
    title: 'Notificaciones en tiempo real',
    description: 'Usar Socket.io para notificar cambios de estado.',
    status: 'backlog',
    priority: 'baja',
    reporter: bob,
    tags: [{ id: 'tag1', name: 'backend', color: '#3b82f6' }],
    archived: false,
    version: 1,
    dueDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
]

export const mockUsers: UserSummary[] = [alice, bob]
