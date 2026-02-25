'use client'

import { useState, useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { EventCategories } from '@/types/enums'
import { CATEGORY_SHORT_LABELS } from '@/lib/category-styles'
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>()
    events.forEach((event) => {
      if (event.sectors?.[0]) catSet.add(event.sectors[0])
    })
    return EventCategories.filter((c) => catSet.has(c))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (selectedCategories.length === 0) return events
    return events.filter((event) =>
      event.sectors?.[0] ? selectedCategories.includes(event.sectors[0]) : false
    )
  }, [events, selectedCategories])

  const monthGroups = useMemo(
    () => groupByMonth(filteredEvents),
    [filteredEvents]
  )

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      {availableCategories.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Filtra per categoria
          </p>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const isActive = selectedCategories.includes(category)
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-namo-cyan bg-namo-cyan text-white shadow-sm'
                      : 'border-border bg-card text-namo-charcoal hover:border-namo-cyan/50 hover:bg-namo-cyan/5'
                  )}
                >
                  {CATEGORY_SHORT_LABELS[category] ?? category}
                </button>
              )
            })}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
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
        <div className="space-y-10">
          {monthGroups.map((group) => (
            <section key={group.key}>
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-lg font-bold text-namo-charcoal">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
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
            Nessun evento per le categorie selezionate
          </p>
          <button
            onClick={() => setSelectedCategories([])}
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
