'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RegistrationStatusBadge } from './registration-status-badge'
import { RegistrationDialog } from './registration-dialog'
import { CancelRegistrationDialog } from './cancel-registration-dialog'

interface EventSummary {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string | null
  capacity: number | null
  confirmedCount: number
  cancellationDeadlineHours: number | null
  waitlistLimit: number | null
}

interface UserRegistrationData {
  id: string
  status: 'confirmed' | 'waitlist'
  position: number | null
}

interface EventDetailActionsProps {
  event: EventSummary
  userRegistration: UserRegistrationData | null
  isPast: boolean
}

export function EventDetailActions({
  event,
  userRegistration,
  isPast,
}: EventDetailActionsProps) {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const isFull =
    event.capacity !== null && event.confirmedCount >= event.capacity

  if (isPast) {
    return (
      <div className="pt-2">
        <div className="w-full rounded-full bg-secondary py-3.5 text-center text-lg font-semibold text-muted-foreground">
          Evento concluso
        </div>
      </div>
    )
  }

  // User is registered (confirmed or waitlist)
  if (userRegistration) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-4">
          <RegistrationStatusBadge
            status={userRegistration.status}
            position={userRegistration.position}
            className="text-sm"
          />
        </div>

        <button
          onClick={() => setCancelOpen(true)}
          className="w-full rounded-full border border-namo-red/20 py-3 text-center text-sm font-medium text-namo-red transition-colors hover:bg-namo-red/5"
        >
          Annulla iscrizione
        </button>

        <CancelRegistrationDialog
          registrationId={userRegistration.id}
          eventTitle={event.title}
          eventStartAt={event.startAt}
          cancellationDeadlineHours={event.cancellationDeadlineHours}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
      </div>
    )
  }

  // Not registered — show register button
  return (
    <div className="pt-2">
      <button
        onClick={() => setRegisterOpen(true)}
        disabled={isFull && event.waitlistLimit === 0}
        className={cn(
          'w-full rounded-full py-3.5 text-center text-lg font-semibold transition-colors',
          isFull && event.waitlistLimit === 0
            ? 'cursor-not-allowed bg-secondary text-muted-foreground'
            : 'bg-namo-cyan text-white hover:bg-namo-cyan/90'
        )}
      >
        {isFull
          ? event.waitlistLimit === 0
            ? 'Evento al completo'
            : 'Iscriviti (lista d\'attesa)'
          : 'Iscriviti'}
      </button>

      <RegistrationDialog
        event={event}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
      />
    </div>
  )
}
