'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sectors } from '@/types/enums'
import { cn } from '@/lib/utils'
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
    <article className="flex gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      {/* Date block */}
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-namo-cyan/10 py-3 sm:w-20">
        <span className="text-xs font-medium uppercase text-namo-cyan">
          {shortDate.weekday}
        </span>
        <span className="text-2xl font-bold text-namo-charcoal sm:text-3xl">
          {shortDate.day}
        </span>
        <span className="text-xs font-medium uppercase text-namo-cyan">
          {shortDate.month}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Sectors */}
        {event.sectors && event.sectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.sectors.map(sector => (
              <Badge
                key={sector}
                variant="secondary"
                className="text-[11px] font-medium"
              >
                {sector}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold leading-tight text-namo-charcoal sm:text-xl">
          {event.title}
        </h3>

        {/* Date & time */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="capitalize">{formatDate(startAt)}</span>
          <span className="mx-0.5">·</span>
          <span>{formatTime(startAt)} – {formatTime(endAt)}</span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
              <span className="inline-flex items-center gap-1.5 text-sm text-namo-green">
                <Users className="h-3.5 w-3.5" />
                {spotsLeft} {spotsLeft === 1 ? 'posto disponibile' : 'posti disponibili'}
              </span>
            )}
          </div>
        )}

        {/* Notes preview */}
        {event.notes && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
              className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
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
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [registeringEvent, setRegisteringEvent] = useState<PublicEvent | null>(null)

  // Determine which sectors are present across all events
  const availableSectors = useMemo(() => {
    const sectorSet = new Set<string>()
    events.forEach(event => {
      event.sectors?.forEach(s => sectorSet.add(s))
    })
    return Sectors.filter(s => sectorSet.has(s))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (selectedSectors.length === 0) return events
    return events.filter(event =>
      event.sectors?.some(s => selectedSectors.includes(s))
    )
  }, [events, selectedSectors])

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    )
  }

  return (
    <div className="space-y-6">
      {/* Sector filter — only show if there are multiple sectors */}
      {availableSectors.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Filtra per settore
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSectors.map(sector => {
              const isActive = selectedSectors.includes(sector)
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-namo-cyan bg-namo-cyan text-white'
                      : 'border-border bg-white text-namo-charcoal hover:border-namo-cyan/50 hover:bg-namo-cyan/5'
                  )}
                >
                  {sector}
                </button>
              )
            })}
            {selectedSectors.length > 0 && (
              <button
                onClick={() => setSelectedSectors([])}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
              >
                Mostra tutti
              </button>
            )}
          </div>
        </div>
      )}

      {/* Events list */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={setRegisteringEvent}
            />
          ))}
        </div>
      ) : events.length > 0 ? (
        /* Filtered to empty */
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CalendarDays className="h-12 w-12 text-namo-muted" />
          <p className="text-lg font-medium text-namo-charcoal">
            Nessun evento per i settori selezionati
          </p>
          <button
            onClick={() => setSelectedSectors([])}
            className="text-sm font-medium text-namo-cyan hover:underline"
          >
            Mostra tutti gli eventi
          </button>
        </div>
      ) : (
        /* No events at all */
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarDays className="h-8 w-8 text-namo-cyan" />
          </div>
          <p className="text-lg font-medium text-namo-charcoal">
            Nessun evento aperto al momento
          </p>
          <p className="text-muted-foreground">
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
