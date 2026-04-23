import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ExportFilters, TicketStatus } from '@/types'

// ── Tailwind class merger ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date formatting ───────────────────────────────────────────────────────────

export function formatDate(iso: string, pattern = 'd MMM yyyy') {
  return format(parseISO(iso), pattern, { locale: es })
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "d MMM yyyy 'a las' HH:mm", { locale: es })
}

// ── CSV Export URL builder ────────────────────────────────────────────────────

export function buildExportUrl(filters: ExportFilters): string {
  const params = new URLSearchParams()

  if (filters.from) params.set('from', filters.from)
  if (filters.to)   params.set('to', filters.to)
  if (filters.assigneeId) params.set('assignee_id', filters.assigneeId)
  filters.status?.forEach(s => params.append('status', s))

  return `/api/metrics/export?${params.toString()}`
}

// ── Trigger browser file download ─────────────────────────────────────────────

export function triggerDownload(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.click()
}

// ── Status chip styles ────────────────────────────────────────────────────────

export function getStatusStyles(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    todo:        'bg-[#e4e9ee] text-[#0c0e10]',
    in_progress: 'bg-[#d7e2ff] text-[#003d84]',
    review:      'bg-[#dde3e9] text-[#0c0e10]',
    done:        'bg-[#69f6b8] text-[#00452d]',
  }
  return map[status]
}

// ── Priority styles ───────────────────────────────────────────────────────────

export const PRIORITY_COLOR: Record<string, string> = {
  low:    'text-[#5a7a6b]',
  medium: 'text-[#8a6a00]',
  high:   'text-[#b03020]',
}

export const PRIORITY_DOT: Record<string, string> = {
  low:    'bg-[#69f6b8]',
  medium: 'bg-[#f6d869]',
  high:   'bg-[#fe8983]',
}
