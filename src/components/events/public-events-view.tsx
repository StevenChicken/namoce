'use client'

import { useState } from 'react'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExternalRegistrationDialog } from './external-registration-dialog'

export interface PublicEvent {
  id: string
  title: string
  sectors: string[] | null
  startAt: string | Date
  endAt: string | Date
  location: string | null
  capacity: number | null
  notes: string | null
  confirmedCount: number
}

interface PublicEventsViewProps {
  events: PublicEvent[]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatShortDate(date: Date): { day: string; month: string; weekday: string } {
  const day = date.getDate().toString()
  const month = new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(date).toUpperCase()
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(date)
  return { day, month, weekday }
}

function EventCard({
  event,
  onRegister,
}: {
  event: PublicEvent
  onRegister: (event: PublicEvent) => void
}) {
  const startAt = new Date(event.startAt)
  const endAt = new Date(event.endAt)
  const shortDate = formatShortDate(startAt)

  const isFull = event.capacity !== null && event.confirmedCount >= event.capacity
  const spotsLeft = event.capacity !== null ? event.capacity - event.confirmedCount : null

  return (
    <article className="flex gap-4 rounded-xl border border-border/60 bg-card p-4 transition-shadow duration-200 hover:shadow-[6px_6px_9px_rgba(0,0,0,0.08)] sm:p-5">
      {/* Date block */}
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-namo-cyan/8 py-3 sm:w-20">
        <span className="text-[11px] font-semibold uppercase text-namo-cyan">
          {shortDate.weekday}
        </span>
        <span className="text-2xl font-bold text-namo-charcoal sm:text-3xl">
          {shortDate.day}
        </span>
        <span className="text-[11px] font-semibold uppercase text-namo-cyan">
          {shortDate.month}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Title */}
        <h3 className="text-lg font-bold leading-tight text-namo-charcoal sm:text-xl">
          {event.title}
        </h3>

        {/* Date & time */}
        <div className="flex items-center gap-1.5 text-sm text-namo-charcoal/60">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="capitalize">{formatDate(startAt)}</span>
          <span className="mx-0.5">&middot;</span>
          <span>{formatTime(startAt)} &ndash; {formatTime(endAt)}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-sm text-namo-charcoal/60">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Capacity */}
        {event.capacity !== null && (
          <div className="mt-1">
            {isFull ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-namo-red/10 px-3 py-1 text-sm font-semibold text-namo-red">
                <Users className="h-3.5 w-3.5" />
                Evento al completo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-namo-green">
                <Users className="h-3.5 w-3.5" />
                {spotsLeft} {spotsLeft === 1 ? 'posto disponibile' : 'posti disponibili'}
              </span>
            )}
          </div>
        )}

        {/* Notes preview */}
        {event.notes && (
          <p className="mt-1 line-clamp-2 text-sm text-namo-charcoal/50">
            {event.notes}
          </p>
        )}

        {/* Registration button */}
        <div className="mt-2">
          {isFull ? (
            <Button
              disabled
              variant="outline"
              className="rounded-full"
              size="sm"
            >
              Completo
            </Button>
          ) : (
            <Button
              onClick={() => onRegister(event)}
              className="rounded-full bg-namo-charcoal font-semibold hover:bg-namo-charcoal/90"
              size="sm"
            >
              Iscriviti
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

export function PublicEventsView({ events }: PublicEventsViewProps) {
  const [registeringEvent, setRegisteringEvent] = useState<PublicEvent | null>(null)

  return (
    <div className="space-y-6">
      {/* Events list */}
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={setRegisteringEvent}
            />
          ))}
        </div>
      ) : (
        /* No events at all */
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-namo-cyan/8">
            <CalendarDays className="h-10 w-10 text-namo-cyan" />
          </div>
          <p className="text-xl font-semibold text-namo-charcoal">
            Nessun evento aperto al momento
          </p>
          <p className="text-namo-charcoal/50">
            Torna a trovarci presto!
          </p>
        </div>
      )}

      {/* External Registration Dialog */}
      <ExternalRegistrationDialog
        open={!!registeringEvent}
        onOpenChange={(open) => {
          if (!open) setRegisteringEvent(null)
        }}
        eventId={registeringEvent?.id ?? ''}
        eventTitle={registeringEvent?.title ?? ''}
      />
    </div>
  )
}
