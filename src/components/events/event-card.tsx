'use client'

import Link from 'next/link'
import { Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  RegistrationStatusBadge,
  type RegistrationStatusType,
} from './registration-status-badge'

import { CATEGORY_STYLES, CATEGORY_SHORT_LABELS } from '@/lib/category-styles'

function formatShortDate(date: Date): {
  day: string
  month: string
  weekday: string
} {
  const day = date.getDate().toString()
  const month = new Intl.DateTimeFormat('it-IT', { month: 'short' })
    .format(date)
    .toUpperCase()
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(
    date
  )
  return { day, month, weekday }
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export interface EventCardEvent {
  id: string
  title: string
  type: 'interno' | 'aperto'
  status: 'draft' | 'published' | 'cancelled' | 'archived'
  sectors: string[] | null
  startAt: string | Date
  endAt: string | Date
  location: string | null
  capacity: number | null
  notes?: string | null
  confirmedCount: number
}

export interface UserRegistration {
  id: string
  status: RegistrationStatusType
  position?: number | null
}

interface EventCardProps {
  event: EventCardEvent
  variant?: 'default' | 'public'
  href?: string
  userRegistration?: UserRegistration
}

export function EventCard({
  event,
  variant = 'default',
  href,
  userRegistration,
}: EventCardProps) {
  const startAt = new Date(event.startAt)
  const endAt = new Date(event.endAt)
  const shortDate = formatShortDate(startAt)
  const isPast = endAt < new Date()
  const isFull =
    event.capacity !== null && event.confirmedCount >= event.capacity
  const spotsLeft =
    event.capacity !== null ? event.capacity - event.confirmedCount : null

  const isRegistered =
    userRegistration &&
    (userRegistration.status === 'confirmed' ||
      userRegistration.status === 'waitlist')

  const cardHref =
    href ??
    (variant === 'public'
      ? `/eventi/${event.id}`
      : `/calendario/${event.id}`)

  return (
    <Link href={cardHref} className="group block">
      <article
        className={cn(
          'flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 group-hover:shadow-natural group-hover:scale-[1.01] sm:p-5',
          isPast && 'opacity-60'
        )}
      >
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
          {/* Category */}
          {event.sectors?.[0] && (
            <div className="flex flex-wrap gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                  CATEGORY_STYLES[event.sectors[0]] ?? 'bg-secondary text-secondary-foreground'
                )}
              >
                {CATEGORY_SHORT_LABELS[event.sectors[0]] ?? event.sectors[0]}
              </span>
              {variant === 'default' && event.type === 'aperto' && (
                <Badge variant="outline" className="text-[11px]">
                  Aperto
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight text-namo-charcoal group-hover:text-namo-cyan transition-colors sm:text-xl">
            {event.title}
          </h3>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {formatTime(startAt)} – {formatTime(endAt)}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Capacity + action */}
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {event.capacity === null ? (
                <span className="text-muted-foreground">Posti illimitati</span>
              ) : isFull ? (
                <span className="font-semibold text-namo-red">
                  Evento al completo
                </span>
              ) : (
                <span className="text-namo-green">
                  {spotsLeft}{' '}
                  {spotsLeft === 1
                    ? 'posto disponibile'
                    : 'posti disponibili'}
                </span>
              )}
            </div>

            {/* Registration status or action button */}
            {!isPast && variant === 'default' && isRegistered && (
              <RegistrationStatusBadge
                status={userRegistration.status}
                position={userRegistration.position}
              />
            )}

            {!isPast && variant === 'default' && !isRegistered && (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  isFull
                    ? 'bg-secondary text-muted-foreground'
                    : 'bg-namo-cyan text-white group-hover:bg-namo-cyan/90'
                )}
              >
                {isFull ? 'Completo' : 'Iscriviti'}
              </span>
            )}

            {isPast && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Concluso
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="h-20 w-16 shrink-0 animate-pulse rounded-lg bg-accent sm:w-20" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-accent" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-accent" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-accent" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-accent" />
      </div>
    </div>
  )
}
