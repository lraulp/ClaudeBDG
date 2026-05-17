import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import type { UserSummary } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  users: UserSummary[]
  placeholder?: string
  className?: string
}

export default function MentionTextarea({ value, onChange, users, placeholder, className }: Props) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filtered =
    mentionQuery !== null
      ? users.filter(
          (u) =>
            u.handle.startsWith(mentionQuery) ||
            u.name.toLowerCase().startsWith(mentionQuery)
        )
      : []

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    onChange(val)
    const cursor = e.target.selectionStart ?? val.length
    const before = val.slice(0, cursor)
    const match = before.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
      setSelectedIdx(0)
    } else {
      setMentionQuery(null)
    }
  }

  function insertMention(user: UserSummary) {
    if (!textareaRef.current) return
    const cursor = textareaRef.current.selectionStart ?? value.length
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const prefix = before.replace(/@\w*$/, `@${user.handle} `)
    onChange(prefix + after)
    setMentionQuery(null)
    setTimeout(() => {
      textareaRef.current?.focus()
      const pos = prefix.length
      textareaRef.current?.setSelectionRange(pos, pos)
    }, 0)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => (i + 1) % filtered.length)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length)
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      insertMention(filtered[selectedIdx])
    }
    if (e.key === 'Escape') setMentionQuery(null)
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('resize-none', className)}
      />
      {mentionQuery !== null && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-white shadow-md p-1">
          {filtered.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                insertMention(user)
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100',
                i === selectedIdx && 'bg-gray-100'
              )}
            >
              <span className="font-medium">@{user.handle}</span>
              <span className="text-gray-500 ml-1">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
