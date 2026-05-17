import { cn } from '@/lib/utils'

interface Props {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ className, size = 'md' }: Props) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizes[size], className)}
    />
  )
}
