'use client'

import { cn } from '@/lib/utils'

export type RegistrationStatusType = 'confirmed' | 'waitlist' | 'cancelled'

interface RegistrationStatusBadgeProps {
  status: RegistrationStatusType
  position?: number | null
  className?: string
}

const STATUS_CONFIG: Record<
  RegistrationStatusType,
  { label: string; className: string }
> = {
  confirmed: {
    label: 'Iscritto',
    className: 'bg-namo-green/15 text-namo-green',
  },
  waitlist: {
    label: "In lista d'attesa",
    className: 'bg-namo-orange/15 text-namo-orange',
  },
  cancelled: {
    label: 'Annullato',
    className: 'bg-secondary text-muted-foreground',
  },
}

export function RegistrationStatusBadge({
  status,
  position,
  className,
}: RegistrationStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  const label =
    status === 'waitlist' && position
      ? `In lista d'attesa #${position}`
      : config.label

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {label}
    </span>
  )
}
