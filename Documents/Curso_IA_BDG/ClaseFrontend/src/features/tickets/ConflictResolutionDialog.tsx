import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Ticket } from '@/types'

interface Props {
  open: boolean
  serverTicket: Ticket | null
  onKeepMine: () => void
  onUseServer: () => void
}

export default function ConflictResolutionDialog({ open, serverTicket, onKeepMine, onUseServer }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conflicto de edición</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Otro usuario modificó este ticket mientras lo editabas (versión{' '}
          {serverTicket?.version}). ¿Qué deseas hacer?
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onUseServer}>
            Usar versión del servidor
          </Button>
          <Button onClick={onKeepMine}>Conservar mis cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
