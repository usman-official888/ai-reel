import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover border-2 border-border',
          sizes[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center font-semibold text-white',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
