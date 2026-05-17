import { useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket } from '@/lib/socket'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const s = getSocket()
    socketRef.current = s
    s.connect()
    return () => {
      disconnectSocket()
    }
  }, [])

  return socketRef
}
