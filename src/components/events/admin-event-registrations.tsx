'use client'

import { useState, useMemo, useTransition } from 'react'
import { cancelRegistration } from '@/features/registrations/actions'
import { correctAttendance } from '@/features/attendance/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MoreHorizontal, XCircle, Shield, Users, CheckCircle2, XOctagon, AlertTriangle } from 'lucide-react'

export interface InternalRegistration {
  id: string
  eventId: string
  userId: string
  status: 'confirmed' | 'waitlist' | 'cancelled'
  registeredAt: string
  cancelledAt: string | null
  cancellationType: string | null
  isAdminOverride: boolean
  attendanceStatus: string | null
  firstName: string | null
  lastName: string | null
  email: string
}

export interface ExternalRegistrationRow {
  id: string
  eventId: string
  firstName: string
  lastName: string
  email: string
  status: 'confirmed' | 'cancelled'
  registeredAt: string
  cancelledAt: string | null
}

type FilterTab = 'all' | 'confirmed' | 'waitlist' | 'cancelled'

interface AdminEventRegistrationsProps {
  internalRegistrations: InternalRegistration[]
  externalRegistrations: ExternalRegistrationRow[]
  isPastEvent: boolean
  graceExpired: boolean
}

interface UnifiedRow {
  id: string
  name: string
  email: string
  type: 'interno' | 'esterno'
  status: 'confirmed' | 'waitlist' | 'cancelled'
  registeredAt: Date
  isAdminOverride: boolean
  registrationId: string
  attendanceStatus: string | null
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return (
        <Badge className="bg-namo-green/10 text-namo-green hover:bg-namo-green/20 text-xs">
          Confermato
        </Badge>
      )
    case 'waitlist':
      return (
        <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20 text-xs">
          In attesa
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge variant="secondary" className="text-muted-foreground text-xs">
          Annullato
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function TypeBadge({ type }: { type: 'interno' | 'esterno' }) {
  if (type === 'interno') {
    return (
      <Badge className="bg-namo-cyan/10 text-namo-cyan hover:bg-namo-cyan/20 text-xs">
        Interno
      </Badge>
    )
  }
  return (
    <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20 text-xs">
      Esterno
    </Badge>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function AttendanceBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'present':
      return (
        <Badge className="bg-namo-green/10 text-namo-green hover:bg-namo-green/20 text-xs">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Presente
        </Badge>
      )
    case 'absent':
      return (
        <Badge className="bg-namo-red/10 text-namo-red hover:bg-namo-red/20 text-xs">
          <XOctagon className="mr-1 h-3 w-3" />
          Assente
        </Badge>
      )
    case 'no_show':
      return (
        <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20 text-xs">
          <AlertTriangle className="mr-1 h-3 w-3" />
          No show
        </Badge>
      )
    default:
      return (
        <span className="text-xs text-muted-foreground">&mdash;</span>
      )
  }
}

function AttendanceCorrection({
  registrationId,
  currentStatus,
  disabled,
}: {
  registrationId: string
  currentStatus: string | null
  disabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    if (value === (currentStatus ?? '')) return
    startTransition(async () => {
      try {
        await correctAttendance({ registrationId, newStatus: value })
        toast.success('Presenza aggiornata')
        window.location.reload()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Errore durante la correzione'
        )
      }
    })
  }

  return (
    <Select
      value={currentStatus ?? ''}
      onValueChange={handleChange}
      disabled={disabled || isPending}
    >
      <SelectTrigger className="h-8 w-[130px] text-xs">
        <SelectValue placeholder="Correggi" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="present">Presente</SelectItem>
        <SelectItem value="absent">Assente</SelectItem>
        <SelectItem value="no_show">No show</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function AdminEventRegistrations({
  internalRegistrations,
  externalRegistrations,
  isPastEvent,
  graceExpired,
}: AdminEventRegistrationsProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [cancelTarget, setCancelTarget] = useState<UnifiedRow | null>(null)
  const [isPending, startTransition] = useTransition()

  // Merge internal + external into a unified list
  const allRows = useMemo<UnifiedRow[]>(() => {
    const internal: UnifiedRow[] = internalRegistrations.map((r) => ({
      id: r.id,
      name: [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email,
      email: r.email,
      type: 'interno' as const,
      status: r.status,
      registeredAt: new Date(r.registeredAt),
      isAdminOverride: r.isAdminOverride,
      registrationId: r.id,
      attendanceStatus: r.attendanceStatus,
    }))

    const external: UnifiedRow[] = externalRegistrations.map((r) => ({
      id: `ext-${r.id}`,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      type: 'esterno' as const,
      status: r.status,
      registeredAt: new Date(r.registeredAt),
      isAdminOverride: false,
      registrationId: r.id,
      attendanceStatus: null,
    }))

    return [...internal, ...external].sort(
      (a, b) => a.registeredAt.getTime() - b.registeredAt.getTime()
    )
  }, [internalRegistrations, externalRegistrations])

  const filteredRows = useMemo(() => {
    if (activeTab === 'all') return allRows
    return allRows.filter((r) => r.status === activeTab)
  }, [allRows, activeTab])

  // Counts
  const confirmedCount = allRows.filter((r) => r.status === 'confirmed').length
  const waitlistCount = allRows.filter((r) => r.status === 'waitlist').length
  const cancelledCount = allRows.filter((r) => r.status === 'cancelled').length

  // Compute waitlist position for displayed rows
  const waitlistPositions = useMemo(() => {
    const positions = new Map<string, number>()
    let pos = 1
    for (const row of allRows) {
      if (row.status === 'waitlist') {
        positions.set(row.id, pos)
        pos++
      }
    }
    return positions
  }, [allRows])

  function handleCancelConfirm() {
    if (!cancelTarget || cancelTarget.type !== 'interno') return

    startTransition(async () => {
      try {
        await cancelRegistration({ registrationId: cancelTarget.registrationId })
        toast.success('Iscrizione annullata')
        window.location.reload()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Errore durante l'annullamento"
        )
      } finally {
        setCancelTarget(null)
      }
    })
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Tutti', count: allRows.length },
    { key: 'confirmed', label: 'Confermati', count: confirmedCount },
    { key: 'waitlist', label: "Lista d'attesa", count: waitlistCount },
    { key: 'cancelled', label: 'Annullati', count: cancelledCount },
  ]

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-namo-green">
          <Users className="h-4 w-4" />
          {confirmedCount} {confirmedCount === 1 ? 'confermato' : 'confermati'}
        </span>
        {waitlistCount > 0 && (
          <span className="text-namo-orange">
            {waitlistCount} in lista d&apos;attesa
          </span>
        )}
        {cancelledCount > 0 && (
          <span className="text-muted-foreground">
            {cancelledCount} {cancelledCount === 1 ? 'annullato' : 'annullati'}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-card text-namo-charcoal shadow-sm'
                : 'text-muted-foreground hover:text-namo-charcoal'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
            <Users className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            {allRows.length === 0
              ? 'Nessuna iscrizione per questo evento'
              : 'Nessuna iscrizione per il filtro selezionato'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Stato</TableHead>
                  <TableHead className="font-semibold">Data iscrizione</TableHead>
                  {isPastEvent && <TableHead className="font-semibold">Presenza</TableHead>}
                  <TableHead className="text-right font-semibold">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {row.name}
                        {row.isAdminOverride && (
                          <span title="Override admin"><Shield className="h-3.5 w-3.5 text-namo-cyan" /></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.email}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={row.type} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={row.status} />
                        {row.status === 'waitlist' && (
                          <span className="text-xs text-muted-foreground">
                            #{waitlistPositions.get(row.id)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(row.registeredAt)}
                    </TableCell>
                    {isPastEvent && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AttendanceBadge status={row.attendanceStatus} />
                          {!graceExpired && row.type === 'interno' && row.status === 'confirmed' && (
                            <AttendanceCorrection
                              registrationId={row.registrationId}
                              currentStatus={row.attendanceStatus}
                              disabled={false}
                            />
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {row.type === 'interno' && row.status !== 'cancelled' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Azioni</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setCancelTarget(row)}
                              className="text-namo-red focus:text-namo-red"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Annulla iscrizione
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {filteredRows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border bg-card p-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {row.name}
                      {row.isAdminOverride && (
                        <Shield className="ml-1 inline h-3.5 w-3.5 text-namo-cyan" />
                      )}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {row.email}
                    </p>
                  </div>
                  {row.type === 'interno' && row.status !== 'cancelled' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setCancelTarget(row)}
                          className="text-namo-red focus:text-namo-red"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Annulla iscrizione
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TypeBadge type={row.type} />
                  <StatusBadge status={row.status} />
                  {row.status === 'waitlist' && (
                    <span className="text-xs text-muted-foreground">
                      #{waitlistPositions.get(row.id)}
                    </span>
                  )}
                </div>
                {isPastEvent && (
                  <div className="mt-2 flex items-center gap-2">
                    <AttendanceBadge status={row.attendanceStatus} />
                    {!graceExpired && row.type === 'interno' && row.status === 'confirmed' && (
                      <AttendanceCorrection
                        registrationId={row.registrationId}
                        currentStatus={row.attendanceStatus}
                        disabled={false}
                      />
                    )}
                  </div>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatDate(row.registeredAt)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annulla iscrizione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler annullare l&apos;iscrizione di{' '}
              <strong>{cancelTarget?.name}</strong>? Il volontario sarà
              notificato.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setCancelTarget(null)}
              disabled={isPending}
            >
              No, mantieni
            </Button>
            <Button
              className="rounded-full bg-namo-red hover:bg-namo-red/90"
              onClick={handleCancelConfirm}
              disabled={isPending}
            >
              {isPending ? 'Annullamento...' : 'Sì, annulla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
