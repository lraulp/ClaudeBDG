import { create } from 'zustand'
import type { Ticket } from '@/types'

interface TicketDraftState {
  draft: Partial<Ticket> | null
  conflictVersion: number | null  // server version at time of 409

  setDraft: (draft: Partial<Ticket>) => void
  setConflictVersion: (version: number) => void
  clearDraft: () => void
}

export const useTicketDraftStore = create<TicketDraftState>((set) => ({
  draft: null,
  conflictVersion: null,

  setDraft: (draft) => set({ draft }),
  setConflictVersion: (version) => set({ conflictVersion: version }),
  clearDraft: () => set({ draft: null, conflictVersion: null }),
}))
