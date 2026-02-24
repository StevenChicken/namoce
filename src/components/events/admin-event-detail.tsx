'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  UserPlus,
} from 'lucide-react'
import {
  AdminEventRegistrations,
  type InternalRegistration,
  type ExternalRegistrationRow,
} from './admin-event-registrations'
import {
  AdminAddVolunteerDialog,
  type ActiveVolunteer,
} from './admin-add-volunteer-dialog'

interface EventSummary {
  id: string
  title: string
  type: 'interno' | 'aperto'
  status: 'draft' | 'published' | 'cancelled' | 'archived'
  startAt: string
  endAt: string
  location: string | null
  capacity: number | null
  sectors: string[] | null
  confirmedCount: number
  waitlistCount: number
  attendanceGracePeriodHours: number | null
}

interface AdminEventDetailProps {
  event: EventSummary
  internalRegistrations: InternalRegistration[]
  externalRegistrations: ExternalRegistrationRow[]
  volunteers: ActiveVolunteer[]
  isFull: boolean
  attendanceSummary: { present: number; absent: number; noShow: number; unmarked: number } | null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Bozza</Badge>
    case 'published':
      return (
        <Badge className="bg-namo-green/10 text-namo-green hover:bg-namo-green/20">
          Pubblicato
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge className="bg-namo-red/10 text-namo-red hover:bg-namo-red/20">
          Annullato
        </Badge>
      )
    case 'archived':
      return <Badge variant="outline" className="text-muted-foreground">Archiviato</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'interno') {
    return (
      <Badge className="bg-namo-cyan/10 text-namo-cyan hover:bg-namo-cyan/20">
        Interno
      </Badge>
    )
  }
  return (
    <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20">
      Aperto
    </Badge>
  )
}

export function AdminEventDetail({
  event,
  internalRegistrations,
  externalRegistrations,
  volunteers,
  isFull,
  attendanceSummary,
}: AdminEventDetailProps) {
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false)

  const isPastEvent = useMemo(() => new Date(event.endAt) < new Date(), [event.endAt])
  const graceExpired = useMemo(() => {
    if (!isPastEvent) return false
    const endMs = new Date(event.endAt).getTime()
    const gracePeriodMs = (event.attendanceGracePeriodHours ?? 48) * 3600000
    return new Date().getTime() - endMs > gracePeriodMs
  }, [isPastEvent, event.endAt, event.attendanceGracePeriodHours])

  return (
    <div className="space-y-6">
      {/* Event header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={event.type} />
          <StatusBadge status={event.status} />
        </div>

        <h1 className="text-2xl font-bold text-namo-charcoal">
          {event.title}
        </h1>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span className="capitalize">{formatDate(event.startAt)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatTime(event.startAt)} – {formatTime(event.endAt)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          )}
          {event.capacity !== null && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {event.confirmedCount}/{event.capacity} posti
              {event.waitlistCount > 0 && (
                <span className="text-namo-orange">
                  (+{event.waitlistCount} in attesa)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Attendance summary (past events only) */}
      {isPastEvent && attendanceSummary && (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-namo-charcoal">
              Presenze
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-namo-green/5 p-3 text-center">
                <p className="text-2xl font-bold text-namo-green">{attendanceSummary.present}</p>
                <p className="text-xs text-muted-foreground">Presenti</p>
              </div>
              <div className="rounded-lg border bg-namo-red/5 p-3 text-center">
                <p className="text-2xl font-bold text-namo-red">{attendanceSummary.absent}</p>
                <p className="text-xs text-muted-foreground">Assenti</p>
              </div>
              <div className="rounded-lg border bg-namo-orange/5 p-3 text-center">
                <p className="text-2xl font-bold text-namo-orange">{attendanceSummary.noShow}</p>
                <p className="text-xs text-muted-foreground">No show</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-muted-foreground">{attendanceSummary.unmarked}</p>
                <p className="text-xs text-muted-foreground">Non segnati</p>
              </div>
            </div>
            {!graceExpired && (
              <p className="text-xs text-muted-foreground">
                Puoi correggere le presenze entro {event.attendanceGracePeriodHours ?? 48} ore dalla fine dell&apos;evento.
              </p>
            )}
            {graceExpired && (
              <p className="text-xs text-namo-orange">
                Il periodo di correzione presenze è scaduto.
              </p>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Registrations section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-namo-charcoal">
            Iscrizioni
          </h2>
          <Button
            onClick={() => setAddVolunteerOpen(true)}
            className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Aggiungi volontario
          </Button>
        </div>

        <AdminEventRegistrations
          internalRegistrations={internalRegistrations}
          externalRegistrations={externalRegistrations}
          isPastEvent={isPastEvent}
          graceExpired={graceExpired}
        />
      </div>

      {/* Add volunteer dialog */}
      <AdminAddVolunteerDialog
        open={addVolunteerOpen}
        onOpenChange={setAddVolunteerOpen}
        eventId={event.id}
        volunteers={volunteers}
        isFull={isFull}
      />
    </div>
  )
}
