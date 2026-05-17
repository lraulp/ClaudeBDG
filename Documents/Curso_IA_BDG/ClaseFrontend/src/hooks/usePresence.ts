import { useEffect, useState } from 'react'
import { useSocket } from './useSocket'
import type { UserSummary } from '@/types'

interface PresenceEvent {
  ticketId: string
  user: UserSummary
  editing: boolean
}

export function usePresence(ticketId: string) {
  const [editingBy, setEditingBy] = useState<UserSummary | null>(null)
  const socketRef = useSocket()

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    socket.emit('presence:join', { ticketId })

    function onPresence({ user, editing }: PresenceEvent) {
      setEditingBy(editing ? user : null)
    }

    socket.on('presence:update', onPresence)

    return () => {
      socket.emit('presence:leave', { ticketId })
      socket.off('presence:update', onPresence)
    }
  }, [ticketId, socketRef])

  function setEditing(editing: boolean) {
    socketRef.current?.emit('presence:editing', { ticketId, editing })
  }

  return { editingBy, setEditing }
}
