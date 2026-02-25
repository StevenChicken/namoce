import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { getPublishedEventById } from '@/features/events/queries'
import {
  getActiveRegistrationForUser,
  getWaitlistPosition,
} from '@/features/registrations/queries'
import { requireVolunteerOrAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EventDetailActions } from '@/components/events/event-detail-actions'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const event = await getPublishedEventById(eventId)

  if (!event) {
    return { title: 'Evento non trovato — Namo' }
  }

  return { title: `${event.title} — Namo` }
}

import { CATEGORY_STYLES, CATEGORY_SHORT_LABELS } from '@/lib/category-styles'

function formatFullDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function VolunteerEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const userId = await requireVolunteerOrAdmin()

  const [event, activeReg] = await Promise.all([
    getPublishedEventById(eventId),
    getActiveRegistrationForUser(userId, eventId),
  ])

  if (!event) {
    notFound()
  }

  // Only show interno events on this route
  if (event.type !== 'interno') {
    notFound()
  }

  let waitlistPosition: number | null = null
  if (activeReg && activeReg.status === 'waitlist') {
    waitlistPosition = await getWaitlistPosition(activeReg.id)
  }

  const startAt = new Date(event.startAt)
  const endAt = new Date(event.endAt)
  const isPast = endAt < new Date()
  const isFull =
    event.capacity !== null && event.confirmedCount >= event.capacity
  const spotsLeft =
    event.capacity !== null ? event.capacity - event.confirmedCount : null

  const userRegistration = activeReg
    ? {
        id: activeReg.id,
        status: activeReg.status as 'confirmed' | 'waitlist',
        position: waitlistPosition,
      }
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <Link
        href="/calendario_del_volontario"
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-namo-cyan/30 hover:text-namo-cyan"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Torna al calendario
      </Link>

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        {isPast && (
          <Badge variant="secondary" className="text-sm">
            Evento concluso
          </Badge>
        )}
      </div>

      {/* Category */}
      {event.sectors?.[0] && (
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
              CATEGORY_STYLES[event.sectors[0]] ?? 'bg-secondary text-secondary-foreground'
            )}
          >
            {CATEGORY_SHORT_LABELS[event.sectors[0]] ?? event.sectors[0]}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-namo-charcoal">{event.title}</h1>

      {/* Info card */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-natural">
        {/* Date */}
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-namo-cyan" />
          <div>
            <p className="font-medium capitalize text-foreground">
              {formatFullDate(startAt)}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-namo-cyan" />
          <p className="text-foreground">
            {formatTime(startAt)} – {formatTime(endAt)}
          </p>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-namo-cyan" />
            <p className="text-foreground">{event.location}</p>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-namo-cyan" />
          <div>
            {event.capacity === null ? (
              <p className="text-foreground">Posti illimitati</p>
            ) : (
              <>
                <p className="text-foreground">
                  <span className="font-semibold">
                    {event.confirmedCount}
                  </span>{' '}
                  / {event.capacity} posti occupati
                </p>
                {isFull ? (
                  <p className="mt-0.5 text-sm font-semibold text-namo-red">
                    Evento al completo
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-namo-green">
                    {spotsLeft}{' '}
                    {spotsLeft === 1
                      ? 'posto disponibile'
                      : 'posti disponibili'}
                  </p>
                )}
              </>
            )}
            {event.waitlistCount > 0 && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {event.waitlistCount} in lista d&apos;attesa
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {event.notes && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Note
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-secondary/30 p-4 text-foreground">
            {event.notes}
          </div>
        </div>
      )}

      {/* Cancellation deadline info */}
      {event.cancellationDeadlineHours && !isPast && (
        <div className="flex items-start gap-2 rounded-lg bg-namo-orange/5 p-3 text-sm text-namo-orange">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            La cancellazione è considerata tardiva se effettuata meno di{' '}
            {event.cancellationDeadlineHours} ore prima dell&apos;evento.
          </p>
        </div>
      )}

      {/* Registration actions */}
      <EventDetailActions
        event={{
          id: event.id,
          title: event.title,
          startAt: event.startAt.toISOString(),
          endAt: event.endAt.toISOString(),
          location: event.location,
          capacity: event.capacity,
          confirmedCount: event.confirmedCount,
          cancellationDeadlineHours: event.cancellationDeadlineHours,
          waitlistLimit: event.waitlistLimit,
        }}
        userRegistration={userRegistration}
        isPast={isPast}
      />
    </div>
  )
}
