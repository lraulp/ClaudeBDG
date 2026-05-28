import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { ticketSchema, type TicketFormValues } from './ticketSchemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import MarkdownPreview from '@/components/MarkdownPreview'
import UserAvatar from '@/components/UserAvatar'
import type { Tag, Ticket, TicketPriority, TicketStatus, UserSummary } from '@/types'
import { cn } from '@/lib/utils'

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'backlog',     label: 'Por hacer'   },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'hecho',       label: 'Listo'       },
]

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta',    label: 'Alta'    },
  { value: 'media',   label: 'Media'   },
  { value: 'baja',    label: 'Baja'    },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-on-surface-variant mb-1.5">
      {children}
    </p>
  )
}

interface Props {
  ticket?: Partial<Ticket>
  users?: UserSummary[]
  tags?: Tag[]
  isNew?: boolean
  onSubmit: (values: TicketFormValues) => void
  onArchive?: () => void
  onCancel: () => void
}

export default function TicketForm({
  ticket,
  users = [],
  tags = [],
  isNew = false,
  onSubmit,
  onArchive,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title:       ticket?.title ?? '',
      description: ticket?.description ?? '',
      status:      ticket?.status ?? 'backlog',
      priority:    ticket?.priority ?? 'media',
      assigneeId:  ticket?.assignee?.id,
      tagIds:      ticket?.tags?.map((t) => t.id) ?? [],
      dueDate:     ticket?.dueDate?.slice(0, 10) ?? '',
    },
  })

  const description = watch('description') ?? ''
  const status      = watch('status')
  const priority    = watch('priority')
  const tagIds      = watch('tagIds') ?? []

  const inputClass =
    'h-8 text-[15px] leading-[22px] tracking-[-0.012em] bg-surface-container border-outline-variant focus-visible:border-primary focus-visible:ring-0 text-on-surface placeholder:text-on-surface-variant'

  const selectTriggerClass =
    'h-8 text-[15px] leading-[22px] bg-surface-container border-outline-variant focus:border-primary focus:ring-0 text-on-surface'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Título */}
      <div>
        <FieldLabel>Título</FieldLabel>
        <Input
          {...register('title')}
          placeholder="Describe brevemente la tarea"
          className={inputClass}
        />
        {errors.title && (
          <p className="mt-1 text-[12px] leading-4 text-error">{errors.title.message}</p>
        )}
      </div>

      {/* Estado + Prioridad — fila */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Estado</FieldLabel>
          <Select value={status} onValueChange={(v) => setValue('status', v as TicketStatus)}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Prioridad</FieldLabel>
          <Select value={priority} onValueChange={(v) => setValue('priority', v as TicketPriority)}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción con tabs */}
      <div>
        <FieldLabel>Descripción</FieldLabel>
        <Tabs defaultValue="escribir">
          <TabsList className="h-8 bg-surface-container border border-outline-variant mb-1">
            <TabsTrigger value="escribir" className="text-[13px] h-7 data-[state=active]:bg-surface-container-lowest">
              Escribir
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-[13px] h-7 data-[state=active]:bg-surface-container-lowest">
              Vista previa
            </TabsTrigger>
          </TabsList>
          <TabsContent value="escribir">
            <Textarea
              {...register('description')}
              placeholder="Soporta **Markdown**"
              className="min-h-28 resize-none text-[15px] bg-surface-container border-outline-variant focus-visible:border-primary focus-visible:ring-0 text-on-surface placeholder:text-on-surface-variant"
            />
          </TabsContent>
          <TabsContent value="preview">
            {description ? (
              <MarkdownPreview
                content={description}
                className="min-h-28 border border-outline-variant rounded-md p-3 bg-surface-container"
              />
            ) : (
              <p className="min-h-28 flex items-center justify-center text-[15px] text-on-surface-variant border border-outline-variant rounded-md">
                Sin contenido
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Asignado a */}
      {users.length > 0 && (
        <div>
          <FieldLabel>Asignado a</FieldLabel>
          <Select
            value={watch('assigneeId') ?? '__none__'}
            onValueChange={(v) => setValue('assigneeId', v === '__none__' ? undefined : v ?? undefined)}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin asignar</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  <span className="flex items-center gap-2">
                    <UserAvatar user={u} size="sm" />
                    {u.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Etiquetas */}
      {tags.length > 0 && (
        <div>
          <FieldLabel>Etiquetas</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = tagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setValue(
                      'tagIds',
                      active ? tagIds.filter((id) => id !== tag.id) : [...tagIds, tag.id]
                    )
                  }
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium leading-4 border transition-colors',
                    active
                      ? 'border-primary bg-primary-fixed text-primary'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {active && <Check size={10} className="stroke-[3]" />}
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Fecha de vencimiento */}
      <div>
        <FieldLabel>Fecha de vencimiento</FieldLabel>
        <Input
          type="date"
          {...register('dueDate')}
          className={inputClass}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
        {!isNew && onArchive ? (
          <button
            type="button"
            onClick={onArchive}
            className="text-[13px] font-medium leading-[18px] tracking-[-0.006em] text-error hover:text-on-error-container transition-colors"
          >
            Archivar ticket
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-8 text-[13px] border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-8 text-[13px] bg-primary text-on-primary hover:bg-primary-container"
          >
            {isSubmitting ? 'Guardando…' : isNew ? 'Crear ticket' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  )
}
