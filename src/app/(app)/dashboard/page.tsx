import { requireAuthenticated } from '@/lib/auth'
import { getUpcomingUserRegistrations, getPastUserRegistrations } from '@/features/registrations/queries'
import { getUserAttendanceSummary } from '@/features/users/queries'
import Link from 'next/link'
import {
  CalendarDays,
  ClipboardCheck,
  History,
  Download,
  Clock,
  MapPin,
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Helpers ─────────────────────────────────────────────

const SECTOR_STYLES: Record<string, string> = {
  'Clown Terapia': 'bg-namo-orange/10 text-namo-orange',
  'Laboratori Scuole': 'bg-namo-cyan/10 text-namo-cyan',
  'Compagno Adulto': 'bg-namo-purple/10 text-namo-purple',
  'Riunioni': 'bg-namo-charcoal/10 text-namo-charcoal',
  'Eventi Speciali': 'bg-namo-green/10 text-namo-green',
}

const SECTOR_SUMMARY_STYLES: Record<string, string> = {
  'Clown Terapia': 'bg-namo-orange/5 border-namo-orange/20',
  'Laboratori Scuole': 'bg-namo-cyan/5 border-namo-cyan/20',
  'Compagno Adulto': 'bg-namo-purple/5 border-namo-purple/20',
  'Riunioni': 'bg-namo-charcoal/5 border-namo-charcoal/20',
  'Eventi Speciali': 'bg-namo-green/5 border-namo-green/20',
}

const SECTOR_COUNT_STYLES: Record<string, string> = {
  'Clown Terapia': 'text-namo-orange',
  'Laboratori Scuole': 'text-namo-cyan',
  'Compagno Adulto': 'text-namo-purple',
  'Riunioni': 'text-namo-charcoal',
  'Eventi Speciali': 'text-namo-green',
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getAttendanceLabel(status: string | null): string {
  switch (status) {
    case 'present':
      return 'Presente'
    case 'absent':
      return 'Assente'
    case 'no_show':
      return 'Non presentato'
    default:
      return '\u2014'
  }
}

function getAttendanceStyle(status: string | null): string {
  switch (status) {
    case 'present':
      return 'bg-namo-green/10 text-namo-green border-namo-green/20'
    case 'absent':
      return 'bg-namo-orange/10 text-namo-orange border-namo-orange/20'
    case 'no_show':
      return 'bg-namo-red/10 text-namo-red border-namo-red/20'
    default:
      return 'bg-secondary text-muted-foreground'
  }
}

// ─── Page ────────────────────────────────────────────────

export default async function DashboardPage() {
  const userId = await requireAuthenticated()

  const [upcoming, past, attendance] = await Promise.all([
    getUpcomingUserRegistrations(userId),
    getPastUserRegistrations(userId, 10),
    getUserAttendanceSummary(userId),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-namo-charcoal">La mia dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tieni traccia dei tuoi eventi e delle tue presenze
        </p>
      </div>

      {/* Section 1: Prossimi eventi */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarDays className="h-4 w-4 text-namo-cyan" />
          </div>
          <h2 className="text-lg font-semibold text-namo-charcoal">
            Prossimi eventi
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessun evento in programma
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((reg) => {
              const start = new Date(reg.eventStartAt)
              const end = new Date(reg.eventEndAt)
              const sectors = reg.eventSectors as string[] | null
              return (
                <Link
                  key={reg.id}
                  href={`/calendario/${reg.eventId}`}
                  className="group block"
                >
                  <Card className="transition-all duration-200 group-hover:shadow-natural group-hover:scale-[1.01]">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-2">
                        {/* Sectors + type badge */}
                        {((sectors && sectors.length > 0) || reg.eventType === 'aperto') && (
                          <div className="flex flex-wrap gap-1.5">
                            {sectors?.map((sector) => (
                              <span
                                key={sector}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${SECTOR_STYLES[sector] ?? 'bg-secondary text-secondary-foreground'}`}
                              >
                                {sector}
                              </span>
                            ))}
                            {reg.eventType === 'aperto' && (
                              <Badge variant="outline" className="text-[11px]">
                                Aperto
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-base font-bold text-namo-charcoal transition-colors group-hover:text-namo-cyan sm:text-lg">
                          {reg.eventTitle}
                        </h3>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 shrink-0" />
                          <span className="capitalize">
                            {formatFullDate(start)}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>
                            {formatTime(start)} – {formatTime(end)}
                          </span>
                        </div>

                        {/* Location */}
                        {reg.eventLocation && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">{reg.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Section 2: Riepilogo presenze */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-namo-green/10">
            <ClipboardCheck className="h-4 w-4 text-namo-green" />
          </div>
          <h2 className="text-lg font-semibold text-namo-charcoal">
            Riepilogo presenze
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {attendance.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessuna presenza registrata
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {attendance.map((item) => (
              <Card
                key={item.sector}
                className={`border ${SECTOR_SUMMARY_STYLES[item.sector] ?? 'bg-secondary/30 border-border'}`}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium text-namo-charcoal">
                    {item.sector}
                  </span>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-bold ${SECTOR_COUNT_STYLES[item.sector] ?? 'text-namo-charcoal'}`}
                    >
                      {item.presentCount}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {item.presentCount === 1 ? 'presenza' : 'presenze'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Attività recente */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-namo-orange/10">
            <History className="h-4 w-4 text-namo-orange" />
          </div>
          <h2 className="text-lg font-semibold text-namo-charcoal">
            Attività recente
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {past.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessuna attività recente
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {past.map((reg) => {
                  const start = new Date(reg.eventStartAt)
                  return (
                    <Link
                      key={reg.id}
                      href={`/calendario/${reg.eventId}`}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-namo-charcoal">
                          {reg.eventTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(start)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${getAttendanceStyle(reg.attendanceStatus)}`}
                      >
                        {getAttendanceLabel(reg.attendanceStatus)}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Section 4: Esporta */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-namo-charcoal/10">
            <Download className="h-4 w-4 text-namo-charcoal" />
          </div>
          <h2 className="text-lg font-semibold text-namo-charcoal">
            Esporta
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              variant="outline"
              className="rounded-full"
              asChild
            >
              <a href="/api/export/calendar.ics" download>
                <CalendarDays className="mr-2 h-4 w-4" />
                Scarica calendario (.ics)
              </a>
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              asChild
            >
              <a href="/api/export/personal" download>
                <Download className="mr-2 h-4 w-4" />
                Scarica i miei dati (.csv)
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
