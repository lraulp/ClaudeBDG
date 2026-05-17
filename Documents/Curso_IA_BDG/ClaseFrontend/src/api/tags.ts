import { api } from '@/lib/axios'
import type { Tag } from '@/types'

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags').then((r) => r.data),
}
