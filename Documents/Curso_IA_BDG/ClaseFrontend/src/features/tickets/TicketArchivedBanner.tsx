import { Archive } from 'lucide-react'

export default function TicketArchivedBanner() {
  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 text-sm text-yellow-800">
      <Archive className="h-4 w-4 flex-shrink-0" />
      Este ticket está archivado y no puede editarse.
    </div>
  )
}
