'use client'

import { useState, useTransition, useMemo } from 'react'
import type { Event } from '@/db/schema'
import { EventCategories } from '@/types/enums'
import { CATEGORY_SHORT_LABELS } from '@/lib/category-styles'
import {
  publishEvent,
  cancelEvent,
  deleteEvent,
} from '@/features/events/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuSeparator,
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Pencil,
  Send,
  Copy,
  XCircle,
  Trash2,
  CalendarDays,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'
import { EventFormDialog } from './event-form-dialog'
import { EventCloneDialog } from './event-clone-dialog'
import { SeriesEditDialog } from './series-edit-dialog'

interface AdminEventsViewProps {
  initialEvents: Event[]
}

type StatusFilter = 'all' | 'draft' | 'published' | 'cancelled' | 'archived'
type TypeFilter = 'all' | 'interno' | 'aperto'

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'draft':
      return (
        <Badge variant="secondary" className="text-xs">
          Bozza
        </Badge>
      )
    case 'published':
      return (
        <Badge className="bg-namo-green/10 text-namo-green hover:bg-namo-green/20 text-xs">
          Pubblicato
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge className="bg-namo-red/10 text-namo-red hover:bg-namo-red/20 text-xs">
          Annullato
        </Badge>
      )
    case 'archived':
      return (
        <Badge variant="outline" className="text-muted-foreground text-xs">
          Archiviato
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'interno') {
    return (
      <Badge className="bg-namo-cyan/10 text-namo-cyan hover:bg-namo-cyan/20 text-xs">
        Interno
      </Badge>
    )
  }
  return (
    <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20 text-xs">
      Aperto
    </Badge>
  )
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminEventsView({ initialEvents }: AdminEventsViewProps) {
  const [events, setEvents] = useState(initialEvents)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [cloningEvent, setCloningEvent] = useState<Event | null>(null)
  const [seriesEditEvent, setSeriesEditEvent] = useState<Event | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'publish' | 'cancel' | 'delete'
    event: Event
  } | null>(null)

  const [isPending, startTransition] = useTransition()

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (categoryFilter !== 'all' && e.sectors?.[0] !== categoryFilter)
        return false
      return true
    })
  }, [events, statusFilter, typeFilter, categoryFilter])

  function handleEdit(event: Event) {
    if (event.cloneSeriesId) {
      setSeriesEditEvent(event)
    } else {
      setEditingEvent(event)
    }
  }

  function handleConfirmAction() {
    if (!confirmAction) return

    startTransition(async () => {
      try {
        switch (confirmAction.type) {
          case 'publish':
            await publishEvent(confirmAction.event.id)
            setEvents((prev) =>
              prev.map((e) =>
                e.id === confirmAction.event.id
                  ? { ...e, status: 'published' as const }
                  : e
              )
            )
            toast.success('Evento pubblicato')
            break
          case 'cancel':
            await cancelEvent(confirmAction.event.id)
            setEvents((prev) =>
              prev.map((e) =>
                e.id === confirmAction.event.id
                  ? { ...e, status: 'cancelled' as const }
                  : e
              )
            )
            toast.success('Evento annullato')
            break
          case 'delete':
            await deleteEvent(confirmAction.event.id)
            setEvents((prev) =>
              prev.filter((e) => e.id !== confirmAction.event.id)
            )
            toast.success('Evento eliminato')
            break
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Errore nell'operazione"
        )
      } finally {
        setConfirmAction(null)
      }
    })
  }

  function handleFormSuccess() {
    // Revalidation happens server-side; update local state via page refresh
    window.location.reload()
  }

  const confirmLabels = {
    publish: {
      title: 'Pubblica evento',
      description: 'Sei sicuro di voler pubblicare questo evento? Sarà visibile ai volontari.',
      action: 'Pubblica',
    },
    cancel: {
      title: 'Annulla evento',
      description: 'Sei sicuro di voler annullare questo evento? I volontari iscritti saranno notificati.',
      action: 'Annulla evento',
    },
    delete: {
      title: 'Elimina evento',
      description: 'Sei sicuro di voler eliminare questo evento? Questa azione è irreversibile.',
      action: 'Elimina',
    },
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-namo-charcoal/5">
            <CalendarDays className="h-5 w-5 text-namo-charcoal" />
          </div>
          <h1 className="text-2xl font-bold text-namo-charcoal">Gestione eventi</h1>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo evento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full bg-card sm:w-[160px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="draft">Bozza</SelectItem>
            <SelectItem value="published">Pubblicato</SelectItem>
            <SelectItem value="cancelled">Annullato</SelectItem>
            <SelectItem value="archived">Archiviato</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TypeFilter)}
        >
          <SelectTrigger className="w-full bg-card sm:w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="interno">Interno</SelectItem>
            <SelectItem value="aperto">Aperto</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full bg-card sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {EventCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_SHORT_LABELS[cat] ?? cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Table / Card List */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
            <Calendar className="h-8 w-8 text-namo-cyan" />
          </div>
          <p className="text-muted-foreground">
            {events.length === 0
              ? 'Nessun evento. Crea il primo evento per iniziare.'
              : 'Nessun evento corrisponde ai filtri selezionati.'}
          </p>
          {events.length === 0 && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crea evento
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Titolo</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Stato</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Luogo</TableHead>
                  <TableHead className="text-center font-semibold">Capienza</TableHead>
                  <TableHead className="text-right font-semibold">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {event.title}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={event.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(event.startAt)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {event.location ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {event.capacity ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <EventActions
                        event={event}
                        onEdit={() => handleEdit(event)}
                        onClone={() => setCloningEvent(event)}
                        onPublish={() =>
                          setConfirmAction({ type: 'publish', event })
                        }
                        onCancel={() =>
                          setConfirmAction({ type: 'cancel', event })
                        }
                        onDelete={() =>
                          setConfirmAction({ type: 'delete', event })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-natural"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold text-namo-charcoal">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(event.startAt)}
                    </p>
                    {event.location && (
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    )}
                  </div>
                  <EventActions
                    event={event}
                    onEdit={() => handleEdit(event)}
                    onClone={() => setCloningEvent(event)}
                    onPublish={() =>
                      setConfirmAction({ type: 'publish', event })
                    }
                    onCancel={() =>
                      setConfirmAction({ type: 'cancel', event })
                    }
                    onDelete={() =>
                      setConfirmAction({ type: 'delete', event })
                    }
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <TypeBadge type={event.type} />
                  <StatusBadge status={event.status} />
                  {event.capacity && (
                    <span className="text-xs text-muted-foreground">
                      {event.capacity} posti
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Dialog */}
      <EventFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Edit Dialog */}
      <EventFormDialog
        open={!!editingEvent}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null)
        }}
        event={editingEvent ?? undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Clone Dialog */}
      <EventCloneDialog
        open={!!cloningEvent}
        onOpenChange={(open) => {
          if (!open) setCloningEvent(null)
        }}
        event={cloningEvent ?? undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Series Edit Dialog */}
      <SeriesEditDialog
        open={!!seriesEditEvent}
        onOpenChange={(open) => {
          if (!open) setSeriesEditEvent(null)
        }}
        event={seriesEditEvent ?? undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Confirm Action Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction && confirmLabels[confirmAction.type].title}
            </DialogTitle>
            <DialogDescription>
              {confirmAction && confirmLabels[confirmAction.type].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmAction(null)}
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button
              className={`rounded-full ${
                confirmAction?.type === 'delete'
                  ? 'bg-namo-red hover:bg-namo-red/90'
                  : confirmAction?.type === 'cancel'
                    ? 'bg-namo-red hover:bg-namo-red/90'
                    : 'bg-namo-green hover:bg-namo-green/90'
              }`}
              onClick={handleConfirmAction}
              disabled={isPending}
            >
              {isPending
                ? 'Attendere...'
                : confirmAction && confirmLabels[confirmAction.type].action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Event Actions Dropdown ──────────────────────────────

function EventActions({
  event,
  onEdit,
  onClone,
  onPublish,
  onCancel,
  onDelete,
}: {
  event: Event
  onEdit: () => void
  onClone: () => void
  onPublish: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const canPublish = event.status === 'draft'
  const canCancel = event.status === 'published' || event.status === 'draft'
  const canDelete =
    event.status === 'cancelled' && new Date(event.endAt) < new Date()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Azioni</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/eventi/${event.id}`}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Vedi iscrizioni
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifica
        </DropdownMenuItem>
        {canPublish && (
          <DropdownMenuItem onClick={onPublish}>
            <Send className="mr-2 h-4 w-4" />
            Pubblica
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onClone}>
          <Copy className="mr-2 h-4 w-4" />
          Clona
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {canCancel && event.status !== 'cancelled' && (
          <DropdownMenuItem
            onClick={onCancel}
            className="text-namo-red focus:text-namo-red"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Annulla
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-namo-red focus:text-namo-red"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Loading Skeleton ────────────────────────────────────

export function AdminEventsViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="flex gap-3 rounded-xl border bg-muted/30 p-4">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/30 p-3">
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-0 divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-5 w-[30%]" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-[20%]" />
              <Skeleton className="h-5 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
