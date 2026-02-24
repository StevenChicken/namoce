'use client'

import { useState, useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { Sectors } from '@/types/enums'
import { cn } from '@/lib/utils'
import { EventCard, type EventCardEvent, type UserRegistration } from './event-card'

interface CalendarViewProps {
  events: EventCardEvent[]
  userRegistrations?: Map<string, UserRegistration>
}

function formatMonthYear(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1)
  const formatted = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function groupByMonth(
  events: EventCardEvent[]
): Array<{ key: string; label: string; events: EventCardEvent[] }> {
  const groups = new Map<string, EventCardEvent[]>()

  for (const event of events) {
    const date = new Date(event.startAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(event)
  }

  return Array.from(groups.entries()).map(([key, events]) => ({
    key,
    label: formatMonthYear(key),
    events,
  }))
}

export function CalendarView({ events, userRegistrations }: CalendarViewProps) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])

  const availableSectors = useMemo(() => {
    const sectorSet = new Set<string>()
    events.forEach((event) => {
      event.sectors?.forEach((s) => sectorSet.add(s))
    })
    return Sectors.filter((s) => sectorSet.has(s))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (selectedSectors.length === 0) return events
    return events.filter((event) =>
      event.sectors?.some((s) => selectedSectors.includes(s))
    )
  }, [events, selectedSectors])

  const monthGroups = useMemo(
    () => groupByMonth(filteredEvents),
    [filteredEvents]
  )

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    )
  }

  return (
    <div className="space-y-6">
      {/* Sector filter */}
      {availableSectors.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Filtra per settore
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSectors.map((sector) => {
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

      {/* Events grouped by month */}
      {monthGroups.length > 0 ? (
        <div className="space-y-8">
          {monthGroups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-4 text-lg font-bold text-namo-charcoal">
                {group.label}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userRegistration={userRegistrations?.get(event.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : events.length > 0 ? (
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
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarDays className="h-8 w-8 text-namo-cyan" />
          </div>
          <p className="text-lg font-medium text-namo-charcoal">
            Nessun evento in programma
          </p>
          <p className="text-muted-foreground">
            Torna a trovarci presto!
          </p>
        </div>
      )}
    </div>
  )
}
