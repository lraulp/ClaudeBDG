import { z } from 'zod'

export const ticketSchema = z.object({
  title: z.string().min(3, 'Título requerido (mínimo 3 caracteres)'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'en_progreso', 'en_revision', 'hecho']),
  priority: z.enum(['baja', 'media', 'alta', 'critica']),
  assigneeId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
})

export type TicketFormValues = z.infer<typeof ticketSchema>
